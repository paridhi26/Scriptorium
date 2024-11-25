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
        res.status(400).json({ error: 'Invalid post ID' });
        return;
    }

    // GET request (fetch post by ID)
    if (req.method === 'GET') {
        return isAuthenticated(req, res, async () => {
            const userId = req.user?.id;

            try {
                const post = await prisma.blogPost.findUnique({
                    where: { id: postId },
                    include: {
                        tags: true,
                        codeTemplates: true,
                    },
                });

                if (!post) {
                    res.status(404).json({ error: 'Post not found' });
                    return;
                }

                if (post.hidden && post.userId !== userId) {
                    res.status(403).json({ error: 'Unauthorized: This post is hidden' });
                    return;
                }

                res.status(200).json(post);
            } catch (error: any) {
                console.error('Error fetching post:', error);
                res.status(500).json({ error: 'Failed to fetch post' });
            }
        });
    }

    // PUT request (update post by ID)
    if (req.method === 'PUT') {
        return isAuthenticated(req, res, async () => {
            const { title, description, content, tags = [], codeTemplateIds = [] }: {
                title: string;
                description: string;
                content: string;
                tags: string[];
                codeTemplateIds: number[];
            } = req.body;

            const userId = req.user?.id;

            try {
                const existingPost = await prisma.blogPost.findUnique({
                    where: { id: postId },
                    select: { userId: true, hidden: true },
                });

                if (!existingPost || existingPost.userId !== userId) {
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
                }

                if (existingPost.hidden) {
                    res.status(403).json({ error: 'You cannot edit a post that has been hidden by an admin' });
                    return;
                }

                const updatedPost = await prisma.blogPost.update({
                    where: { id: postId },
                    data: {
                        title,
                        description,
                        content,
                        tags: {
                            deleteMany: {},
                            create: tags.map(tag => ({ tag })),
                        },
                        codeTemplates: {
                            set: codeTemplateIds.map(id => ({ id })),
                        },
                    },
                    include: {
                        tags: true,
                        codeTemplates: true,
                    },
                });

                res.status(200).json(updatedPost);
            } catch (error: any) {
                console.error('Error updating post:', error);
                res.status(500).json({ error: 'Failed to update post' });
            }
        });
    }

    // DELETE request (delete post by ID)
    if (req.method === 'DELETE') {
        return isAuthenticated(req, res, async () => {
            const userId = req.user?.id;

            try {
                const existingPost = await prisma.blogPost.findUnique({
                    where: { id: postId },
                    select: { userId: true, hidden: true },
                });

                if (!existingPost || existingPost.userId !== userId) {
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
                }

                if (existingPost.hidden) {
                    res.status(403).json({ error: 'You cannot delete a post that has been hidden by an admin' });
                    return;
                }

                await prisma.blogPost.delete({
                    where: { id: postId },
                });

                res.status(200).json({ message: 'Post deleted successfully' });
            } catch (error: any) {
                console.error('Error deleting post:', error);
                res.status(500).json({ error: 'Failed to delete post' });
            }
        });
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
