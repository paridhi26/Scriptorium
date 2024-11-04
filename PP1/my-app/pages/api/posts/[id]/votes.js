import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';

// chatGPT

export default async function handler(req, res) {
    const postId = parseInt(req.query.id);

    if (req.method === 'GET') {
        // Fetch the total votes (upvotes and downvotes) for the given blog post ID
        try {
            const votes = await prisma.vote.groupBy({
                by: ['blogPostId'],
                _sum: {
                    value: true,
                },
                where: { blogPostId: postId },
            });

            const totalVotes = votes.length > 0 ? votes[0]._sum.value : 0;
            res.status(200).json({ totalVotes });
        } catch (error) {
            console.error('Error fetching votes:', error);
            res.status(500).json({ message: 'An error occurred while fetching votes.' });
        }
    } else if (req.method === 'POST') {
        // Add or update a vote for the blog post
        return isAuthenticated(req, res, async () => {
            const { value } = req.body; // +1 for upvote, -1 for downvote
            const userId = req.user.id;

            if (![1, -1].includes(value)) {
                return res.status(400).json({ message: 'Invalid vote value. Must be +1 or -1.' });
            }

            try {
                // Check if the user has already voted on this post
                const existingVote = await prisma.vote.findFirst({
                    where: { blogPostId: postId, userId },
                });

                let vote;
                if (existingVote) {
                    // Update the existing vote
                    vote = await prisma.vote.update({
                        where: { id: existingVote.id },
                        data: { value },
                    });
                } else {
                    // Create a new vote
                    vote = await prisma.vote.create({
                        data: {
                            value,
                            userId,
                            blogPostId: postId,
                        },
                    });
                }

                res.status(201).json({ message: 'Vote registered successfully', vote });
            } catch (error) {
                console.error('Error saving vote:', error);
                res.status(500).json({ message: 'An error occurred while saving the vote.' });
            }
        });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}
