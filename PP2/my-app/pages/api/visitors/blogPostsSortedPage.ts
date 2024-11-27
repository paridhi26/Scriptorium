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

        // Fetch blog posts that are not hidden, including votes
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
            skip, // Skip results for pagination
            take: size, // Limit results for pagination
        });

        // Get the total count of matching blog posts for pagination metadata
        const totalBlogPosts = await prisma.blogPost.count({
            where: { hidden: false },
        });

        // Sort blog posts based on the number of upvotes and downvotes
        const sortedBlogPosts = blogPosts
            .map((post) => {
                const upvotes = post.votes.filter((vote) => vote.value === 1).length;
                const downvotes = post.votes.filter((vote) => vote.value === -1).length;
                return { ...post, upvotes, downvotes };
            })
            .sort((a, b) => b.upvotes - a.upvotes || a.downvotes - b.downvotes);

        // Calculate total pages
        const totalPages = Math.ceil(totalBlogPosts / size);

        res.status(200).json({
            currentPage,
            pageSize: size,
            totalBlogPosts,
            totalPages,
            blogPosts: sortedBlogPosts,
        });
    } catch (error: any) {
        console.error('Error fetching top-rated blog posts:', error);
        res.status(500).json({ message: 'An error occurred while fetching blog posts.' });
    }
}








