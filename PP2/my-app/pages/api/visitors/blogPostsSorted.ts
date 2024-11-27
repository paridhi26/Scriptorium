import prisma from '@lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

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
    votes: { value: number }[];
    upvotes?: number;
    downvotes?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    try {
        // Fetch blog posts that are not hidden, including vote counts
        const blogPosts = await prisma.blogPost.findMany({
            where: { hidden: false },
            include: {
                tags: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                votes: true, // Include votes for aggregation
            },
        });

        // Sort blog posts based on the number of upvotes and downvotes
        const sortedBlogPosts = blogPosts
            .map((post) => {
                const upvotes = post.votes.filter((vote) => vote.value === 1).length;
                const downvotes = post.votes.filter((vote) => vote.value === -1).length;
                return { ...post, upvotes, downvotes };
            })
            .sort((a, b) => b.upvotes - a.upvotes || a.downvotes - b.downvotes);

        res.status(200).json(sortedBlogPosts);
    } catch (error: any) {
        console.error('Error fetching top-rated blog posts:', error);
        res.status(500).json({ message: 'An error occurred while fetching blog posts.' });
    }
}










