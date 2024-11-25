import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';
import { NextApiRequest, NextApiResponse } from 'next';

// Extend NextApiRequest to include user information
interface ExtendedNextApiRequest extends NextApiRequest {
    user?: {
        id: number;
        email: string;
    };
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    return isAuthenticated(req, res, async () => {
        const { contentId, contentType, reason }: { contentId: number; contentType: string; reason: string } = req.body;

        if (!contentId || !contentType || !reason) {
            res.status(400).json({ message: 'Content ID, type, and reason are required.' });
            return;
        }

        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'User ID is missing in the authenticated request.' });
            return;
        }

        console.log('Authenticated User ID:', req.user.id);

        try {
            const data: {
                reason: string;
                userId: number;
                createdAt: Date;
                blogPostId?: number;
                commentId?: number;
            } = {
                reason,
                userId: req.user.id,
                createdAt: new Date(),
                ...(contentType === 'post' && { blogPostId: contentId }),
                ...(contentType === 'comment' && { commentId: contentId }),
            };

            await prisma.inappropriateContentReport.create({
                data,
            });

            res.status(201).json({ message: 'Report submitted successfully.' });
        } catch (error: any) {
            console.error('Error creating report:', error);
            res.status(500).json({ message: 'An error occurred while submitting the report.' });
        }
    });
}
