import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { query } = req.query;

    try {
        // Perform search on the blog posts by title, content, tags, or associated code templates
        const blogs = await prisma.blogPost.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },  // Search by blog post title
                    { content: { contains: query, mode: 'insensitive' } },  // Search by blog post content
                    {
                        tags: {
                            some: { tag: { contains: query, mode: 'insensitive' } },  // Search by tags
                        },
                    },
                    {
                        codeTemplates: {
                            some: {
                                OR: [
                                    { title: { contains: query, mode: 'insensitive' } },  // Search by code template title
                                    { code: { contains: query, mode: 'insensitive' } },   // Search by code template content
                                ],
                            },
                        },
                    },
                ],
            },
            include: {
                tags: true,  // Include tags in the result
                codeTemplates: true,  // Include associated code templates in the result
            },
        });

        // If no blog posts are found
        if (blogs.length === 0) {
            return res.status(200).json({ message: 'No blog posts found for the search query.', blogs: [] });
        }

        // Return the found blog posts
        return res.status(200).json(blogs);

    } catch (error) {
        console.error('Error searching blog posts:', error);
        return res.status(500).json({ message: 'An error occurred while searching blog posts.' });
    }
}
