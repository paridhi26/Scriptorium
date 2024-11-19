import prisma from '@lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Fetch comments for the specific blog post, including votes
        const comments = await prisma.comment.findMany({
            where: { blogPostId: parseInt(id) },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                votes: true // Include votes for aggregation
            }
        });

        // Sort comments by calculated upvotes and downvotes
        const sortedComments = comments
            .map(comment => {
                const upvotes = comment.votes.filter(vote => vote.value === 1).length;
                const downvotes = comment.votes.filter(vote => vote.value === -1).length;
                return { ...comment, upvotes, downvotes };
            })
            .sort((a, b) => b.upvotes - a.upvotes || a.downvotes - b.downvotes);

        return res.status(200).json(sortedComments);
    } catch (error) {
        console.error('Error fetching top-rated comments:', error);
        return res.status(500).json({ message: 'An error occurred while fetching comments.' });
    }
}
