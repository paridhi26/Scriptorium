import prisma from '@lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface BlogPost {
    id: number;
    title: string;
    description: string;
    content: string;
    hidden: boolean;
    tags: { id: number; tag: string }[];
    codeTemplates: { id: number; title: string; description: string }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { id } = req.query;

    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    if (!id || isNaN(Number(id))) {
        res.status(400).json({ message: 'Invalid blog post ID.' });
        return;
    }

    try {
        // Fetch the blog post by ID, including associated tags and code templates
        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id as string, 10) },
            include: {
                tags: true,
                codeTemplates: true,
            },
        });

        // If no blog post is found or if it is hidden, return a 404 error
        if (!blogPost || blogPost.hidden) {
            res.status(404).json({ message: 'Blog post not found.' });
            return;
        }

        // Return the blog post with associated tags and code templates if it is not hidden
        res.status(200).json(blogPost);
    } catch (error: any) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ message: 'An error occurred while fetching the blog post.' });
    }
}
