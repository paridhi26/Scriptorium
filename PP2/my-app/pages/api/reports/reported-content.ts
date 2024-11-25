import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';
import { NextApiRequest, NextApiResponse } from 'next';

// Extend NextApiRequest to include user information
interface ExtendedNextApiRequest extends NextApiRequest {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
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
        } catch (error: any) {
            console.error('Error fetching reported content:', error);
            res.status(500).json({ message: 'An error occurred while fetching reported content.' });
        }
    }, true); // `true` to require ADMIN role
}
