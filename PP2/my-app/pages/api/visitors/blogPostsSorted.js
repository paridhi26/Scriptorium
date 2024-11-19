import prisma from '@lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Fetch blog posts that are not hidden, including vote counts
        const blogPosts = await prisma.blogPost.findMany({
            where: { hidden: false },
            include: {
                tags: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                votes: true, // Include votes for aggregation
            },
        });

        // Sort blog posts based on the number of upvotes and downvotes
        const sortedBlogPosts = blogPosts
            .map(post => {
                const upvotes = post.votes.filter(vote => vote.value === 1).length;
                const downvotes = post.votes.filter(vote => vote.value === -1).length;
                return { ...post, upvotes, downvotes };
            })
            .sort((a, b) => b.upvotes - a.upvotes || a.downvotes - b.downvotes);

        return res.status(200).json(sortedBlogPosts);
    } catch (error) {
        console.error('Error fetching top-rated blog posts:', error);
        return res.status(500).json({ message: 'An error occurred while fetching blog posts.' });
    }
}
