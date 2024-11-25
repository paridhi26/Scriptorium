import prisma from '@lib/prisma';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const SECRET_KEY = process.env.JWT_SECRET as string;

interface DecodedToken {
    userId: number;
}

export default async function forkTemplate(req: NextApiRequest, res: NextApiResponse): Promise<void> {
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
    let userId: number;

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY) as DecodedToken;
        userId = decoded.userId;
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
    }

    const { templateId }: { templateId: number } = req.body;

    if (!templateId) {
        res.status(400).json({ message: 'Template ID is required.' });
        return;
    }

    try {
        // Fetch the original template details
        const originalTemplate = await prisma.codeTemplate.findUnique({
            where: { id: templateId },
            include: { tags: true, language: true },
        });

        if (!originalTemplate) {
            res.status(404).json({ message: 'Original template not found.' });
            return;
        }

        // Prepare the data for the new template
        const templateData = {
            title: `${originalTemplate.title} (Fork)`,
            description: `${originalTemplate.description} (Forked from template ID: ${originalTemplate.id})`,
            code: originalTemplate.code,
            languageId: originalTemplate.language?.id,
            tags: originalTemplate.tags.map((tag) => tag.tag),
        };

        // Make internal request to saveCodeTemp to create the new forked template
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/saveCodeTemp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(templateData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            res.status(response.status).json({ message: 'Failed to fork template', error: errorData });
            return;
        }

        const newTemplate = await response.json();
        res.status(201).json(newTemplate);
    } catch (error: any) {
        console.error('Error forking template:', error);
        res.status(500).json({ message: 'An error occurred while forking the template.' });
    }
}
