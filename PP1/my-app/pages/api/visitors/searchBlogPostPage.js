import prisma from '@lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { query, page = 1, pageSize = 10 } = req.query;

    // Validate pagination parameters
    const currentPage = parseInt(page, 10);
    const size = parseInt(pageSize, 10);

    if (!query) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    if (isNaN(currentPage) || currentPage <= 0 || isNaN(size) || size <= 0) {
        return res.status(400).json({ message: 'Invalid page or pageSize.' });
    }

    const searchQuery = query.toLowerCase();

    try {
        // Calculate the offset for pagination
        const skip = (currentPage - 1) * size;

        // Perform a search on the blog posts by title, content, tags, or associated code templates
        const blogs = await prisma.blogPost.findMany({
            where: {
                hidden: false, // Exclude hidden posts
                OR: [
                    { title: { contains: searchQuery, mode: 'insensitive' } }, // Case-insensitive search
                    { content: { contains: searchQuery, mode: 'insensitive' } },
                    {
                        tags: {
                            some: { tag: { contains: searchQuery, mode: 'insensitive' } },
                        },
                    },
                    {
                        codeTemplates: {
                            some: {
                                OR: [
                                    { title: { contains: searchQuery, mode: 'insensitive' } },
                                    { code: { contains: searchQuery, mode: 'insensitive' } },
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
                    { title: { contains: searchQuery, mode: 'insensitive' } },
                    { content: { contains: searchQuery, mode: 'insensitive' } },
                    {
                        tags: {
                            some: { tag: { contains: searchQuery, mode: 'insensitive' } },
                        },
                    },
                    {
                        codeTemplates: {
                            some: {
                                OR: [
                                    { title: { contains: searchQuery, mode: 'insensitive' } },
                                    { code: { contains: searchQuery, mode: 'insensitive' } },
                                ],
                            },
                        },
                    },
                ],
            },
        });

        const totalPages = Math.ceil(totalBlogs / size);

        // Return the found blog posts along with pagination metadata
        return res.status(200).json({
            currentPage,
            pageSize: size,
            totalBlogs,
            totalPages,
            blogs,
        });

    } catch (error) {
        console.error('Error searching blog posts:', error);
        return res.status(500).json({ message: 'An error occurred while searching blog posts.' });
    }
}
