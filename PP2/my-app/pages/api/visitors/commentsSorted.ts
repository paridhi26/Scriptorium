import prisma from '@lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface Comment {
    id: number;
    content: string;
    createdAt: string;
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
        // Fetch comments for the specific blog post, including votes
        const comments = await prisma.comment.findMany({
            where: { blogPostId: parseInt(id as string, 10) },
            include: {
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

        // Sort comments by calculated upvotes and downvotes
        const sortedComments = comments
            .map((comment) => {
                const upvotes = comment.votes.filter((vote) => vote.value === 1).length;
                const downvotes = comment.votes.filter((vote) => vote.value === -1).length;
                return { ...comment, upvotes, downvotes };
            })
            .sort((a, b) => b.upvotes - a.upvotes || a.downvotes - b.downvotes);

        res.status(200).json(sortedComments);
    } catch (error: any) {
        console.error('Error fetching top-rated comments:', error);
        res.status(500).json({ message: 'An error occurred while fetching comments.' });
    }
}









