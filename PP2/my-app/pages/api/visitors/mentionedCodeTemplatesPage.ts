import prisma from '@lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface Tag {
    id: number;
    tag: string;
}

interface User {
    firstName: string;
    lastName: string;
    email: string;
}

interface BlogPost {
    id: number;
    title: string;
    description: string;
    content: string;
    hidden: boolean;
    tags: Tag[];
    user: User;
}

interface CodeTemplate {
    id: number;
    title: string;
    description: string;
    code: string;
    tags: Tag[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { id, page = '1', pageSize = '10' } = req.query;

    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    // Validate `id`, `page`, and `pageSize`
    const templateId = parseInt(id as string, 10);
    const currentPage = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);

    if (isNaN(templateId)) {
        res.status(400).json({ message: 'Invalid template ID.' });
        return;
    }
    if (isNaN(currentPage) || currentPage <= 0 || isNaN(size) || size <= 0) {
        res.status(400).json({ message: 'Invalid page or pageSize.' });
        return;
    }

    try {
        // Fetch the code template by ID
        const template: CodeTemplate | null = await prisma.codeTemplate.findUnique({
            where: { id: templateId },
            include: {
                tags: true, // Include tags for the template
            },
        });

        if (!template) {
            res.status(404).json({ message: 'Template not found.' });
            return;
        }

        // Calculate the offset for pagination
        const skip = (currentPage - 1) * size;

        // Fetch paginated blog posts associated with the template
        const blogPosts: BlogPost[] = await prisma.blogPost.findMany({
            where: {
                hidden: false, // Only include blog posts that are not hidden
                codeTemplates: {
                    some: { id: templateId },
                },
            },
            include: {
                tags: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            skip, // Skip results for pagination
            take: size, // Limit results for pagination
        });

        // Get the total count of associated blog posts
        const totalBlogPosts = await prisma.blogPost.count({
            where: {
                hidden: false,
                codeTemplates: {
                    some: { id: templateId },
                },
            },
        });

        const totalPages = Math.ceil(totalBlogPosts / size);

        // Return the template with paginated blog posts and metadata
        res.status(200).json({
            template,
            blogPosts: {
                currentPage,
                pageSize: size,
                totalBlogPosts,
                totalPages,
                posts: blogPosts,
            },
        });
    } catch (error: any) {
        console.error('Error fetching template with associated blog posts:', error);
        res.status(500).json({ message: 'An error occurred while fetching the template.' });
    }
}
