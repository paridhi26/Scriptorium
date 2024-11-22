import prisma from '@lib/prisma';

export default async function handler(req, res) {
    const { id, page = 1, pageSize = 10 } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Validate `id`, `page`, and `pageSize`
    const blogPostId = parseInt(id, 10);
    const currentPage = parseInt(page, 10);
    const size = parseInt(pageSize, 10);

    if (isNaN(blogPostId)) {
        return res.status(400).json({ message: 'Invalid blog post ID.' });
    }
    if (isNaN(currentPage) || currentPage <= 0 || isNaN(size) || size <= 0) {
        return res.status(400).json({ message: 'Invalid page or pageSize.' });
    }

    try {
        // Calculate the offset for pagination
        const skip = (currentPage - 1) * size;

        // Fetch paginated comments for the specific blog post, including votes
        const comments = await prisma.comment.findMany({
            where: { blogPostId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                votes: true, // Include votes for aggregation
            },
            skip, // Skip results for pagination
            take: size, // Limit results for pagination
        });

        // Count total comments for pagination metadata
        const totalComments = await prisma.comment.count({
            where: { blogPostId },
        });

        // Sort comments by calculated upvotes and downvotes
        const sortedComments = comments
            .map(comment => {
                const upvotes = comment.votes.filter(vote => vote.value === 1).length;
                const downvotes = comment.votes.filter(vote => vote.value === -1).length;
                return { ...comment, upvotes, downvotes };
            })
            .sort((a, b) => b.upvotes - a.upvotes || a.downvotes - b.downvotes);

        const totalPages = Math.ceil(totalComments / size);

        // Return sorted comments with pagination metadata
        return res.status(200).json({
            currentPage,
            pageSize: size,
            totalComments,
            totalPages,
            comments: sortedComments,
        });
    } catch (error) {
        console.error('Error fetching top-rated comments:', error);
        return res.status(500).json({ message: 'An error occurred while fetching comments.' });
    }
}
