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
    if (req.method !== 'PUT') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    // Ensure the user is authenticated and is an admin
    isAuthenticated(req, res, async () => {
        const { contentId, contentType }: { contentId: number; contentType: string } = req.body;

        if (!contentId || !contentType) {
            res.status(400).json({ message: 'Content ID and type are required.' });
            return;
        }

        try {
            if (contentType === 'post') {
                await prisma.blogPost.update({
                    where: { id: contentId },
                    data: { hidden: true },
                });
            } else if (contentType === 'comment') {
                await prisma.comment.update({
                    where: { id: contentId },
                    data: { hidden: true },
                });
            } else {
                res.status(400).json({ message: 'Invalid content type.' });
                return;
            }

            res.status(200).json({ message: 'Content hidden successfully.' });
        } catch (error: any) {
            console.error('Error hiding content:', error);
            res.status(500).json({ message: 'An error occurred while hiding the content.' });
        }
    }, true); // `true` for requireAdmin to ensure admin-only access
}
