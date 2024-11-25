import prisma from '@lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

// Define the structure of the response
interface Tag {
    id: number;
    tag: string;
}

interface CodeTemplate {
    id: number;
    title: string;
    code: string;
    tags: Tag[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { id } = req.query;

    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    if (!id || Array.isArray(id) || isNaN(parseInt(id))) {
        res.status(400).json({ message: 'Invalid ID provided.' });
        return;
    }

    try {
        // Fetch the code template by ID
        const template: CodeTemplate | null = await prisma.codeTemplate.findUnique({
            where: { id: parseInt(id, 10) },
            include: { tags: true }, // Include tags, user relation omitted
        });

        if (!template) {
            res.status(404).json({ message: 'Template not found.' });
            return;
        }

        // Return the code template details
        res.status(200).json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ message: 'An error occurred while fetching the template.' });
    }
}
