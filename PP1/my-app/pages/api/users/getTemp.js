import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

// used chatGPT to replace previous authentication logic with new one

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;

        const { search } = req.query; // Capture the search term from query params

        // Find the authenticated user by userId from the JWT
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch templates by the user with optional search filters
        const templates = await prisma.codeTemplate.findMany({
            where: {
                userId: user.id,
                OR: search
                    ? [
                        { title: { contains: search, mode: 'insensitive' } },  // Search by title
                        { description: { contains: search, mode: 'insensitive' } },  // Search by description
                        { tags: {
                            some: {
                                tag: { contains: search, mode: 'insensitive' }  // Search by tag
                            }
                        }}
                    ]
                    : undefined,
            },
            include: {
                tags: true  // Include related tags for each template
            },
        });

        res.status(200).json({ templates });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'An error occurred while fetching the templates.' });
    }
}
