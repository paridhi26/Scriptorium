import prisma from '@lib/prisma';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const SECRET_KEY = process.env.JWT_SECRET as string;

interface DecodedToken {
    userId: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const id = parseInt(req.query.id as string, 10);
    const { title, description, code, tags }: { title?: string; description?: string; code?: string; tags?: string[] } = req.body;

    if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid template ID.' });
        return;
    }

    // Allow only PUT and DELETE methods
    if (req.method !== 'PUT' && req.method !== 'DELETE') {
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
        const decoded = jwt.verify(token, SECRET_KEY) as DecodedToken;
        userId = decoded.userId;
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
    }

    try {
        // Fetch the template to ensure it belongs to the authenticated user
        const template = await prisma.codeTemplate.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!template) {
            res.status(404).json({ message: 'Template not found.' });
            return;
        }

        // Ensure the user owns the template
        if (template.user.id !== userId) {
            res.status(403).json({ message: 'You do not have permission to edit or delete this template.' });
            return;
        }

        // Handle updating (PUT)
        if (req.method === 'PUT') {
            const updatedTemplate = await prisma.codeTemplate.update({
                where: { id },
                data: {
                    title: title ?? template.title,
                    description: description ?? template.description,
                    code: code ?? template.code,
                    tags: {
                        deleteMany: {}, // Remove existing tags
                        create: tags?.map((tag) => ({ tag })) ?? [], // Add new tags
                    },
                },
                include: { tags: true },
            });

            res.status(200).json({ message: 'Template updated successfully', template: updatedTemplate });
            return;
        }

        // Handle deleting (DELETE)
        if (req.method === 'DELETE') {
            await prisma.codeTemplate.delete({
                where: { id },
            });

            res.status(200).json({ message: 'Template deleted successfully' });
            return;
        }
    } catch (error: any) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'An error occurred while processing the request.' });
    }
}
