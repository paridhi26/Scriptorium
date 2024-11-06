import prisma from '@lib/prisma';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
    const { id } = req.query;
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    // Authenticate user
    let userId;
    if (token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            userId = decoded.userId;
        } catch (error) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
    }

    if (req.method === 'GET') {
        try {
            const template = await prisma.codeTemplate.findUnique({
                where: { id: parseInt(id) },
                include: { tags: true, user: false },
            });

            if (!template) {
                return res.status(404).json({ message: 'Template not found.' });
            }

            return res.status(200).json(template);
        } catch (error) {
            console.error('Error fetching template:', error);
            return res.status(500).json({ message: 'An error occurred while fetching the template.' });
        }
    } else if (req.method === 'POST') {
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. You must be logged in to fork and save a template.' });
        }

        try {
            const originalTemplate = await prisma.codeTemplate.findUnique({
                where: { id: parseInt(id) },
                include: { tags: true, language: true }
            });

            if (!originalTemplate) {
                return res.status(404).json({ message: 'Original template not found.' });
            }

            console.log('Forking template with:', {
                title: originalTemplate.title,
                langId: originalTemplate.langId,
                tags: originalTemplate.tags
            });

            const forkedTemplate = await prisma.codeTemplate.create({
                data: {
                    title: originalTemplate.title,
                    description: `${originalTemplate.description} (Forked from template ID: ${originalTemplate.id})`,
                    code: originalTemplate.code,
                    user: {
                        connect: { id: userId },
                    },
                    language: {
                        connect: { id: originalTemplate.langId },
                    },
                    tags: {
                        create: originalTemplate.tags.map((tag) => ({ tag: tag.tag })),
                    },
                },
            });

            return res.status(201).json({
                message: 'Template forked and saved successfully.',
                template: forkedTemplate,
            });
        } catch (error) {
            console.error('Error forking and saving template:', error);
            return res.status(500).json({ message: 'An error occurred while forking and saving the template.' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed.' });
    }
}
