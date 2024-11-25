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
    const { id, page = '1', pageSize = '10' } = req.query;

    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    // Validate `id`, `page`, and `pageSize`
    const blogPostId = parseInt(id as string, 10);
    const currentPage = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);

    if (isNaN(blogPostId)) {
        res.status(400).json({ message: 'Invalid blog post ID.' });
        return;
    }
    if (isNaN(currentPage) || currentPage <= 0 || isNaN(size) || size <= 0) {
        res.status(400).json({ message: 'Invalid page or pageSize.' });
        return;
    }

    try {
        // Calculate the offset for pagination
        const skip = (currentPage - 1) * size;

        // Fetch paginated comments for the specific blog post, including votes
        const comments = await prisma.comment.findMany({
            where: { blogPostId },
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
            skip, // Skip results for pagination
            take: size, // Limit results for pagination
        });

        // Count total comments for pagination metadata
        const totalComments = await prisma.comment.count({
            where: { blogPostId },
        });

        // Sort comments by calculated upvotes and downvotes
        const sortedComments = comments
            .map((comment) => {
                const upvotes = comment.votes.filter((vote) => vote.value === 1).length;
                const downvotes = comment.votes.filter((vote) => vote.value === -1).length;
                return { ...comment, upvotes, downvotes };
            })
            .sort((a, b) => b.upvotes - a.upvotes || a.downvotes - b.downvotes);

        const totalPages = Math.ceil(totalComments / size);

        // Return sorted comments with pagination metadata
        res.status(200).json({
            currentPage,
            pageSize: size,
            totalComments,
            totalPages,
            comments: sortedComments,
        });
    } catch (error: any) {
        console.error('Error fetching top-rated comments:', error);
        res.status(500).json({ message: 'An error occurred while fetching comments.' });
    }
}
