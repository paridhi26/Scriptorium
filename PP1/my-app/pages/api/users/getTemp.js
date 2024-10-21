import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getSession({ req });

    // Ensure user is authenticated
    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { search } = req.query; // Capture the search term from query params

    try {
        // Find the authenticated user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch templates by the user with optional search filters
        const templates = await prisma.codeTemplate.findMany({
            where: {
                userId: user.id,
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },  // Search by title
                    { description: { contains: search, mode: 'insensitive' } },  // Search by description
                    { tags: {
                        some: {
                            tag: { contains: search, mode: 'insensitive' }  // Search by tag
                        }
                    }}
                ],
            },
            include: {
                tags: true  // Include related tags for each template
            },
        });

        res.status(200).json({ templates });

    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'An error occurred while fetching the templates.' });
    }
}