import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';

// chatGPT

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return isAuthenticated(req, res, async () => {
        const { contentId, contentType, reason } = req.body;

        if (!contentId || !contentType || !reason) {
            return res.status(400).json({ message: 'Content ID, type, and reason are required.' });
        }

        // Check that req.user.id is defined
        console.log('Authenticated User ID:', req.user ? req.user.id : 'No user');

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User ID is missing in the authenticated request.' });
        }

        try {
            const data = {
                reason,
                userId: req.user.id, // Ensure userId is set
                createdAt: new Date(),
                ...(contentType === 'post' && { blogPostId: contentId }),
                ...(contentType === 'comment' && { commentId: contentId })
            };

            await prisma.inappropriateContentReport.create({
                data
            });

            res.status(201).json({ message: 'Report submitted successfully.' });
        } catch (error) {
            console.error('Error creating report:', error);
            res.status(500).json({ message: 'An error occurred while submitting the report.' });
        }
    });
}
