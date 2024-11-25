import prisma from '@lib/prisma';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const SECRET_KEY = process.env.JWT_SECRET as string;

interface DecodedToken {
    userId: number;
}

interface SearchQuery {
    search?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY) as DecodedToken;
        const userId = decoded.userId;

        const { search }: SearchQuery = req.query as any; // Capture the search term from query params

        // Find the authenticated user by userId from the JWT
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        // Build the search filters only if `search` is defined
        const searchFilters = search
            ? [
                { title: { contains: search } }, // Search in title
                { description: { contains: search } }, // Search in description
                {
                    tags: {
                        some: { tag: { contains: search } }, // Search in tags
                    },
                },
            ]
            : undefined;

        // Fetch templates by the user with optional search filters
        const templates = await prisma.codeTemplate.findMany({
            where: {
                userId: user.id,
                OR: searchFilters, // Only include `OR` if searchFilters is defined
            },
            include: {
                tags: true, // Include related tags for each template
            },
        });

        res.status(200).json({ templates });
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json({ message: 'Invalid or expired token' });
            return;
        }
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'An error occurred while fetching the templates.' });
    }
}
