import prisma from '@lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { page = '1', pageSize = '10' } = req.query;

    // Validate pagination parameters
    const currentPage = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);

    if (isNaN(currentPage) || currentPage <= 0 || isNaN(size) || size <= 0) {
        res.status(400).json({ message: 'Invalid page or pageSize.' });
        return;
    }

    try {
        // Calculate the offset for pagination
        const skip = (currentPage - 1) * size;

        // Fetch code templates along with related information
        const codeTemplates = await prisma.codeTemplate.findMany({
            include: {
                tags: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                language: {
                    select: {
                        name: true,
                    },
                },
            },
            skip, // Skip results for pagination
            take: size, // Limit results for pagination
        });

        // Get the total count of code templates for pagination metadata
        const totalCodeTemplates = await prisma.codeTemplate.count();

        // Calculate total pages
        const totalPages = Math.ceil(totalCodeTemplates / size);

        res.status(200).json({
            currentPage,
            pageSize: size,
            totalCodeTemplates,
            totalPages,
            codeTemplates,
        });
    } catch (error: any) {
        console.error('Error fetching code templates:', error);
        res.status(500).json({ message: 'An error occurred while fetching code templates.' });
    }
}