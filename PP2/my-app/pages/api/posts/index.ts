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
    if (req.method === 'POST') {
        return isAuthenticated(req, res, async () => {
            const { title, description, content, tags = [], codeTemplateIds }: {
                title: string;
                description: string;
                content: string;
                tags?: string[];
                codeTemplateIds?: number[];
            } = req.body;

            const authorId = req.user?.id;

            if (!title || !description || !content) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            try {
                // Initialize codeTemplateConnections array
                let codeTemplateConnections: { id: number }[] = [];

                if (Array.isArray(codeTemplateIds) && codeTemplateIds.length > 0) {
                    const codeTemplateIdsInt = codeTemplateIds.map((id) => {
                        const parsedId = parseInt(id.toString(), 10);
                        if (isNaN(parsedId)) {
                            throw new Error('codeTemplateIds must contain valid integers.');
                        }
                        return parsedId;
                    });

                    const existingCodeTemplates = await prisma.codeTemplate.findMany({
                        where: { id: { in: codeTemplateIdsInt } },
                        select: { id: true },
                    });

                    const existingIds = existingCodeTemplates.map((ct) => ct.id);
                    const missingIds = codeTemplateIdsInt.filter((id) => !existingIds.includes(id));

                    if (missingIds.length > 0) {
                        return res.status(400).json({
                            message: 'Some CodeTemplate IDs do not exist',
                            missingIds,
                        });
                    }

                    codeTemplateConnections = existingIds.map((id) => ({ id }));
                }

                const post = await prisma.blogPost.create({
                    data: {
                        title,
                        description,
                        content,
                        userId: authorId!,
                        tags: {
                            create: tags.map((tag) => ({ tag })),
                        },
                        ...(codeTemplateConnections.length > 0 && {
                            codeTemplates: {
                                connect: codeTemplateConnections,
                            },
                        }),
                    },
                });

                res.status(201).json(post);
            } catch (error: any) {
                console.error('Error creating post:', error);
                res.status(500).json({ message: 'Failed to create post', error: error.message });
            }
        });
    } else if (req.method === 'GET') {
        return isAuthenticated(req, res, async () => {
            const authorId = req.user?.id;

            try {
                const posts = await prisma.blogPost.findMany({
                    where: { userId: authorId! },
                    include: {
                        tags: true,
                        codeTemplates: true,
                    },
                });

                res.status(200).json(posts);
            } catch (error: any) {
                console.error('Error fetching posts:', error);
                res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
            }
        });
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
