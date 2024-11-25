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
        // Get comments for the blog post
        try {
            const comments = await prisma.comment.findMany({
                where: { blogPostId: postId, parentCommentId: null },
                include: {
                    replies: true,
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });

            res.status(200).json(comments);
        } catch (error: any) {
            console.error('Error fetching comments:', error);
            res.status(500).json({ message: 'An error occurred while fetching comments.' });
        }
    } else if (req.method === 'POST') {
        // Add a comment to the blog post
        return isAuthenticated(req, res, async () => {
            const { content, parentCommentId }: { content: string; parentCommentId?: number } = req.body;
            const userId = req.user?.id;

            if (!content) {
                res.status(400).json({ message: 'Content is required.' });
                return;
            }

            try {
                const newComment = await prisma.comment.create({
                    data: {
                        content,
                        userId: userId!,
                        blogPostId: postId,
                        parentCommentId: parentCommentId || null,
                    },
                });

                res.status(201).json({ message: 'Comment added successfully', comment: newComment });
            } catch (error: any) {
                console.error('Error adding comment:', error);
                res.status(500).json({ message: 'An error occurred while adding the comment.' });
            }
        });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}
