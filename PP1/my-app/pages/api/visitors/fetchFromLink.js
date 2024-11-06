import prisma from '@lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Fetch the blog post by ID, including associated tags and code templates
        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
            include: {
                tags: true,
                codeTemplates: true,
            },
        });

        // If no blog post is found or if it is hidden, return a 404 error
        if (!blogPost || blogPost.hidden) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }

        // Return the blog post with associated tags and code templates if it is not hidden
        return res.status(200).json(blogPost);

    } catch (error) {
        console.error('Error fetching blog post:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the blog post.' });
    }
}
