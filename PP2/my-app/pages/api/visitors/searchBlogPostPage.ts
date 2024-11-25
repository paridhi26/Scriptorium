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

interface PaginatedResponse {
    currentPage: number;
    pageSize: number;
    totalBlogs: number;
    totalPages: number;
    blogs: BlogPost[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { query, page = '1', pageSize = '10' } = req.query;

    // Validate pagination parameters
    const currentPage = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);

    if (!query || typeof query !== 'string') {
        res.status(400).json({ message: 'Search query is required.' });
        return;
    }

    if (isNaN(currentPage) || currentPage <= 0 || isNaN(size) || size <= 0) {
        res.status(400).json({ message: 'Invalid page or pageSize.' });
        return;
    }

    const searchQuery = query.toLowerCase();

    try {
        // Calculate the offset for pagination
        const skip = (currentPage - 1) * size;

        // Perform a search on the blog posts by title, content, tags, or associated code templates
        const blogs: BlogPost[] = await prisma.blogPost.findMany({
            where: {
                hidden: false, // Exclude hidden posts
                OR: [
                    { title: { contains: searchQuery } }, // Case-insensitive by default in SQLite
                    { content: { contains: searchQuery } },
                    {
                        tags: {
                            some: { tag: { contains: searchQuery } },
                        },
                    },
                    {
                        codeTemplates: {
                            some: {
                                OR: [
                                    { title: { contains: searchQuery } },
                                    { code: { contains: searchQuery } },
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
            skip, // Skip results for pagination
            take: size, // Limit results for pagination
        });

        // Count the total number of matching blog posts for pagination metadata
        const totalBlogs = await prisma.blogPost.count({
            where: {
                hidden: false,
                OR: [
                    { title: { contains: searchQuery } },
                    { content: { contains: searchQuery } },
                    {
                        tags: {
                            some: { tag: { contains: searchQuery } },
                        },
                    },
                    {
                        codeTemplates: {
                            some: {
                                OR: [
                                    { title: { contains: searchQuery } },
                                    { code: { contains: searchQuery } },
                                ],
                            },
                        },
                    },
                ],
            },
        });

        const totalPages = Math.ceil(totalBlogs / size);

        // Return the found blog posts along with pagination metadata
        const response: PaginatedResponse = {
            currentPage,
            pageSize: size,
            totalBlogs,
            totalPages,
            blogs,
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Error searching blog posts:', error);
        res.status(500).json({ message: 'An error occurred while searching blog posts.' });
    }
}

