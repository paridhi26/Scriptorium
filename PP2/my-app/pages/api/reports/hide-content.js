import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';

// chatGPT

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Ensure the user is authenticated and is an admin
    isAuthenticated(req, res, async () => {
        const { contentId, contentType } = req.body;

        if (!contentId || !contentType) {
            return res.status(400).json({ message: 'Content ID and type are required.' });
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
                return res.status(400).json({ message: 'Invalid content type.' });
            }

            res.status(200).json({ message: 'Content hidden successfully.' });
        } catch (error) {
            console.error('Error hiding content:', error);
            res.status(500).json({ message: 'An error occurred while hiding the content.' });
        }
    }, true); // `true` for requireAdmin to ensure admin-only access
}