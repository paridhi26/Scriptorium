import prisma from '@lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Fetch comments for a specific blog post, sorted by ratings
        const comments = await prisma.comment.findMany({
            where: { blogPostId: parseInt(id) },
            orderBy: [
                { upvotes: 'desc' },  // Sort by upvotes descending
                { downvotes: 'asc' }  // Then by downvotes ascending
            ],
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Return the sorted comments
        return res.status(200).json(comments);

    } catch (error) {
        console.error('Error fetching top-rated comments:', error);
        return res.status(500).json({ message: 'An error occurred while fetching comments.' });
    }
}