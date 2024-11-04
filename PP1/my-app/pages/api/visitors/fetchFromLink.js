import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Fetch the blog post by ID, including associated code templates
        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
            include: {
                tags: true,
                codeTemplates: true, // Include associated code templates
            },
        });

        if (!blogPost) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }

        // Return the blog post with associated code templates
        return res.status(200).json(blogPost);

    } catch (error) {
        console.error('Error fetching blog post:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the blog post.' });
    }
}