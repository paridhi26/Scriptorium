import prisma from '@lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { page = 1, pageSize = 10 } = req.query;

    // Validate pagination parameters
    const currentPage = parseInt(page, 10);
    const size = parseInt(pageSize, 10);

    if (isNaN(currentPage) || currentPage <= 0 || isNaN(size) || size <= 0) {
        return res.status(400).json({ message: 'Invalid page or pageSize.' });
    }

    try {
        // Calculate the offset for pagination
        const skip = (currentPage - 1) * size;

        // Fetch blog posts that are not hidden, including votes
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
            skip, // Skip results for pagination
            take: size, // Limit results for pagination
        });

        // Get the total count of matching blog posts for pagination metadata
        const totalBlogPosts = await prisma.blogPost.count({
            where: { hidden: false },
        });

        // Sort blog posts based on the number of upvotes and downvotes
        const sortedBlogPosts = blogPosts
            .map(post => {
                const upvotes = post.votes.filter(vote => vote.value === 1).length;
                const downvotes = post.votes.filter(vote => vote.value === -1).length;
                return { ...post, upvotes, downvotes };
            })
            .sort((a, b) => b.upvotes - a.upvotes || a.downvotes - b.downvotes);

        // Calculate total pages
        const totalPages = Math.ceil(totalBlogPosts / size);

        return res.status(200).json({
            currentPage,
            pageSize: size,
            totalBlogPosts,
            totalPages,
            blogPosts: sortedBlogPosts,
        });
    } catch (error) {
        console.error('Error fetching top-rated blog posts:', error);
        return res.status(500).json({ message: 'An error occurred while fetching blog posts.' });
    }
}
