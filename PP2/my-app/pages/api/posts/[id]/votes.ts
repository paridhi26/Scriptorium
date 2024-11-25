import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';
import { NextApiRequest, NextApiResponse } from 'next';

// Extend NextApiRequest to include user information
interface ExtendedNextApiRequest extends NextApiRequest {
    user?: {
        id: number;
        email: string;
    };
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse): Promise<void> {
    const postId = parseInt(req.query.id as string, 10);

    if (isNaN(postId)) {
        res.status(400).json({ message: 'Invalid post ID' });
        return;
    }

    if (req.method === 'GET') {
        // Fetch the total votes for the blog post
        try {
            const postVotes = await prisma.vote.groupBy({
                by: ['blogPostId'],
                _sum: { value: true },
                where: { blogPostId: postId },
            });

            const commentVotes = await prisma.vote.groupBy({
                by: ['commentId'],
                _sum: { value: true },
                where: { blogPostId: postId },
            });

            const totalPostVotes = postVotes.length > 0 ? postVotes[0]._sum?.value ?? 0 : 0;
            const totalCommentVotes = commentVotes.map((vote) => ({
                commentId: vote.commentId,
                totalVotes: vote._sum?.value ?? 0,
            }));

            res.status(200).json({ totalPostVotes, totalCommentVotes });
        } catch (error: any) {
            console.error('Error fetching votes:', error);
            res.status(500).json({ message: 'An error occurred while fetching votes.' });
        }
    } else if (req.method === 'POST') {
        // Add or update a vote for a blog post or comment
        return isAuthenticated(req, res, async () => {
            const { value, commentId }: { value: number; commentId?: number } = req.body;
            const userId = req.user?.id;

            if (![1, -1].includes(value)) {
                res.status(400).json({ message: 'Invalid vote value. Must be +1 or -1.' });
                return;
            }

            try {
                let vote;

                if (commentId) {
                    // Vote on a comment
                    const existingVote = await prisma.vote.findFirst({
                        where: { commentId, userId },
                    });

                    if (existingVote) {
                        // Update the existing vote
                        vote = await prisma.vote.update({
                            where: { id: existingVote.id },
                            data: { value },
                        });
                    } else {
                        // Create a new vote for the comment
                        vote = await prisma.vote.create({
                            data: { value, userId, commentId },
                        });
                    }
                } else {
                    // Vote on a blog post
                    const existingVote = await prisma.vote.findFirst({
                        where: { blogPostId: postId, userId },
                    });

                    if (existingVote) {
                        // Update the existing vote
                        vote = await prisma.vote.update({
                            where: { id: existingVote.id },
                            data: { value },
                        });
                    } else {
                        // Create a new vote for the post
                        vote = await prisma.vote.create({
                            data: { value, userId, blogPostId: postId },
                        });
                    }
                }

                res.status(201).json({ message: 'Vote registered successfully', vote });
            } catch (error: any) {
                console.error('Error saving vote:', error);
                res.status(500).json({ message: 'An error occurred while saving the vote.' });
            }
        });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}
