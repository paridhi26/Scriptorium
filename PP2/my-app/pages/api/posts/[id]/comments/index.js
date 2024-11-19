import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';

// chatGPT

export default async function handler(req, res) {
    const postId = parseInt(req.query.id);

    if (req.method === 'GET') {
        // get comments for the blog post
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
        } catch (error) {
            console.error('Error fetching comments:', error);
            res.status(500).json({ message: 'An error occurred while fetching comments.' });
        }
    } else if (req.method === 'POST') {
        // add comment to the blog post
        return isAuthenticated(req, res, async () => {
            const { content, parentCommentId } = req.body;
            const userId = req.user.id;

            if (!content) {
                return res.status(400).json({ message: 'Content is required.' });
            }

            try {
                const newComment = await prisma.comment.create({
                    data: {
                        content,
                        userId,
                        blogPostId: postId,
                        parentCommentId: parentCommentId || null,
                    },
                });

                res.status(201).json({ message: 'Comment added successfully', comment: newComment });
            } catch (error) {
                console.error('Error adding comment:', error);
                res.status(500).json({ message: 'An error occurred while adding the comment.' });
            }
        });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}
