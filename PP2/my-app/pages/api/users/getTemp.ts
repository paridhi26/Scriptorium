import prisma from '@lib/prisma';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const SECRET_KEY = process.env.JWT_SECRET as string;

interface DecodedToken {
    userId: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { id } = req.query as { id: string };
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    // Authenticate user
    let userId: number | undefined;

    if (token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY) as DecodedToken;
            userId = decoded.userId;
        } catch (error) {
            res.status(403).json({ message: 'Invalid or expired token' });
            return;
        }
    }

    if (req.method === 'GET') {
        try {
            const template = await prisma.codeTemplate.findUnique({
                where: { id: parseInt(id, 10) },
                include: { tags: true, user: false },
            });

            if (!template) {
                res.status(404).json({ message: 'Template not found.' });
                return;
            }

            res.status(200).json(template);
        } catch (error: any) {
            console.error('Error fetching template:', error);
            res.status(500).json({ message: 'An error occurred while fetching the template.' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed.' });
    }
}
