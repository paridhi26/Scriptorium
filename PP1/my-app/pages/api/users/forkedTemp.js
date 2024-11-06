import prisma from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
    const { id } = req.query;
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    let userId;

    // Verify JWT if provided to check if the user is authenticated
    if (token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            userId = decoded.userId;
        } catch (error) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
    }

    if (req.method === 'GET') {
        // Viewing an existing template for modification (available to all visitors)
        try {
            const template = await prisma.codeTemplate.findUnique({
                where: { id: parseInt(id) },
                include: { tags: true, user: true },
            });

            if (!template) {
                return res.status(404).json({ message: 'Template not found.' });
            }

            // Return the template
            return res.status(200).json(template);
        } catch (error) {
            console.error('Error fetching template:', error);
            return res.status(500).json({ message: 'An error occurred while fetching the template.' });
        }

    } else if (req.method === 'POST') {
        // Only authenticated users can fork and save the template
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. You must be logged in to fork and save a template.' });
        }

        const { title, description, code, tags } = req.body;

        // Validate input for the forked template
        if (!title || !description || !code) {
            return res.status(400).json({ message: 'Missing required fields: title, description, or code.' });
        }

        try {
            // Fetch the original template to verify it exists
            const originalTemplate = await prisma.codeTemplate.findUnique({
                where: { id: parseInt(id) },
            });

            if (!originalTemplate) {
                return res.status(404).json({ message: 'Original template not found.' });
            }

            // Create a new forked template
            const forkedTemplate = await prisma.codeTemplate.create({
                data: {
                    title,
                    description: `${description} (Forked from template ID: ${originalTemplate.id})`,
                    code,
                    user: {
                        connect: { id: userId },
                    },
                    language: {
                        connect: { id: originalTemplate.langId },
                    },
                    tags: {
                        create: tags.map((tag) => ({ tag })),  // Add new tags if provided
                    },
                },
            });

            // Return the newly created forked template
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
