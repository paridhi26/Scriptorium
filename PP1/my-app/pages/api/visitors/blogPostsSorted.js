import prisma from '@lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Fetch blog posts sorted by ratings (e.g., most upvotes first)
        const blogPosts = await prisma.blogPost.findMany({
            orderBy: [
                { upvotes: 'desc' },  // Sort by upvotes descending
                { downvotes: 'asc' }  // Then by downvotes ascending (if upvotes are the same)
            ],
            include: {
                tags: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Return the sorted blog posts
        return res.status(200).json(blogPosts);

    } catch (error) {
        console.error('Error fetching top-rated blog posts:', error);
        return res.status(500).json({ message: 'An error occurred while fetching blog posts.' });
    }
}