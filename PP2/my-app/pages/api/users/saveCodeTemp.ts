import prisma from '@lib/prisma';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const SECRET_KEY = process.env.JWT_SECRET as string;

interface DecodedToken {
    userId: number;
}

interface SaveTemplateBody {
    title: string;
    description: string;
    code: string;
    languageId: number;
    tags: string[];
}

export default async function saveTemplate(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
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

        // Validate required fields
        const { title, description, code, languageId, tags }: SaveTemplateBody = req.body;
        if (!title || !description || !code || !languageId) {
            console.log('Missing fields:', { title, description, code, languageId });
            res.status(400).json({ message: 'Missing required fields.' });
            return;
        }

        // Fetch the authenticated user from the database
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            console.log('User not found');
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        // Create a new code template
        const newTemplate = await prisma.codeTemplate.create({
            data: {
                title,
                description,
                code,
                language: {
                    connect: { id: languageId }, // Link to the programming language
                },
                user: {
                    connect: { id: user.id }, // Link to the user
                },
                tags: {
                    create: tags.map((tag) => ({ tag })), // Create tags
                },
            },
        });

        console.log('Created template:', newTemplate);
        res.status(201).json(newTemplate);
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json({ message: 'Invalid or expired token' });
            return;
        }
        console.error('Error saving template:', error);
        res.status(500).json({ error: 'An error occurred while saving the template.' });
    }
}
