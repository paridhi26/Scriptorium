import prisma from '@lib/prisma';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function forkTemplate(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    let userId;
    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);
        userId = decoded.userId;
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }

    const { templateId } = req.body;
    if (!templateId) {
        return res.status(400).json({ message: 'Template ID is required.' });
    }

    try {
        // Fetch the original template details
        const originalTemplate = await prisma.codeTemplate.findUnique({
            where: { id: parseInt(templateId) },
            include: { tags: true, language: true },
        });

        if (!originalTemplate) {
            return res.status(404).json({ message: 'Original template not found.' });
        }

        // Prepare the data for the new template
        const templateData = {
            title: `${originalTemplate.title} (Fork)`,
            description: `${originalTemplate.description} (Forked from template ID: ${originalTemplate.id})`,
            code: originalTemplate.code,
            languageId: originalTemplate.langId,
            tags: originalTemplate.tags.map(tag => tag.tag),
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
            return res.status(response.status).json({ message: 'Failed to fork template', error: errorData });
        }

        const newTemplate = await response.json();
        return res.status(201).json(newTemplate);

    } catch (error) {
        console.error('Error forking template:', error);
        return res.status(500).json({ message: 'An error occurred while forking the template.' });
    }
}
