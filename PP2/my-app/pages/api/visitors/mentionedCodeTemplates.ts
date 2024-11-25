import prisma from '@lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface CodeTemplate {
    id: number;
    title: string;
    description: string;
    code: string;
    tags: { id: number; tag: string }[];
    blogPosts: BlogPost[];
}

interface BlogPost {
    id: number;
    title: string;
    description: string;
    content: string;
    hidden: boolean;
    tags: { id: number; tag: string }[];
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { id } = req.query;

    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    if (!id || isNaN(Number(id))) {
        res.status(400).json({ message: 'Invalid template ID.' });
        return;
    }

    try {
        // Fetch the code template by ID, including any blog posts that reference it
        const template: CodeTemplate | null = await prisma.codeTemplate.findUnique({
            where: { id: parseInt(id as string, 10) },
            include: {
                tags: true,
                blogPosts: {
                    where: { hidden: false }, // Only include blog posts that are not hidden
                    include: {
                        tags: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!template) {
            res.status(404).json({ message: 'Template not found.' });
            return;
        }

        // Return the template with associated blog posts that are not hidden
        res.status(200).json(template);
    } catch (error: any) {
        console.error('Error fetching template with associated blog posts:', error);
        res.status(500).json({ message: 'An error occurred while fetching the template.' });
    }
}
