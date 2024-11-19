import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';

// chatGPT

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return isAuthenticated(req, res, async () => {
        try {
            const reportedPosts = await prisma.blogPost.findMany({
                where: { reports: { some: {} } },
                include: { reports: true },
                orderBy: { reports: { _count: 'desc' } },
            });

            const reportedComments = await prisma.comment.findMany({
                where: { reports: { some: {} } },
                include: { reports: true },
                orderBy: { reports: { _count: 'desc' } },
            });

            res.status(200).json({ reportedPosts, reportedComments });
        } catch (error) {
            console.error('Error fetching reported content:', error);
            res.status(500).json({ message: 'An error occurred while fetching reported content.' });
        }
    }, true); // Pass `true` to require ADMIN role
}
