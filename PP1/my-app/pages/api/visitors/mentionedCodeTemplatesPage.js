import prisma from '@lib/prisma';

export default async function handler(req, res) {
    const { id, page = 1, pageSize = 10 } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Validate `id`, `page`, and `pageSize`
    const templateId = parseInt(id, 10);
    const currentPage = parseInt(page, 10);
    const size = parseInt(pageSize, 10);

    if (isNaN(templateId)) {
        return res.status(400).json({ message: 'Invalid template ID.' });
    }
    if (isNaN(currentPage) || currentPage <= 0 || isNaN(size) || size <= 0) {
        return res.status(400).json({ message: 'Invalid page or pageSize.' });
    }

    try {
        // Fetch the code template by ID
        const template = await prisma.codeTemplate.findUnique({
            where: { id: templateId },
            include: {
                tags: true, // Include tags for the template
            },
        });

        if (!template) {
            return res.status(404).json({ message: 'Template not found.' });
        }

        // Calculate the offset for pagination
        const skip = (currentPage - 1) * size;

        // Fetch paginated blog posts associated with the template
        const blogPosts = await prisma.blogPost.findMany({
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
        return res.status(200).json({
            template,
            blogPosts: {
                currentPage,
                pageSize: size,
                totalBlogPosts,
                totalPages,
                posts: blogPosts,
            },
        });
    } catch (error) {
        console.error('Error fetching template with associated blog posts:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the template.' });
    }
}
