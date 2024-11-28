import prisma from '@lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface Tag {
    id: number;
    tag: string;
}


interface CodeTemplate {
    id: number;
    title: string;
    description: string;
    code: string;
}

interface BlogPost {
    id: number;
    title: string;
    content: string;
    hidden: boolean;
    tags: Tag[];
    codeTemplates: CodeTemplate[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { query } = req.query;

    if (!query || typeof query !== 'string') {
        res.status(400).json({ message: 'Invalid or missing search query.' });
        return;
    }

    const searchQuery = query.toLowerCase();

    try {
        // Perform a search on the blog posts by title, content, tags, or associated code templates
        const blogs: BlogPost[] = await prisma.blogPost.findMany({
            where: {
                hidden: false, // Exclude hidden posts
                OR: [
                    { title: { contains: searchQuery } }, // Search by blog post title
                    { content: { contains: searchQuery } }, // Search by blog post content
                    {
                        tags: {
                            some: { tag: { contains: searchQuery } }, // Search by tags
                        },
                    },
                    {
                        codeTemplates: {
                            some: {
                                OR: [
                                    { title: { contains: searchQuery } }, // Search by code template title
                                    { code: { contains: searchQuery } }, // Search by code template content
                                ],
                            },
                        },
                    },
                ],
            },
            include: {
                tags: true, // Include tags in the result
                codeTemplates: true, // Include associated code templates in the result
            },
        });

        // If no blog posts are found
        if (blogs.length === 0) {
            res.status(200).json({ message: 'No blog posts found for the search query.', blogs: [] });
            return;
        }

        // Return the found blog posts
        res.status(200).json(blogs);
    } catch (error: any) {
        console.error('Error searching blog posts:', error);
        res.status(500).json({ message: 'An error occurred while searching blog posts.' });
    }
}







































































































