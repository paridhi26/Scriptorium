import { getSession } from 'next-auth/react';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;
    const session = await getSession({ req });

    if (req.method === 'GET') {
        // Viewing an existing template for modification (available to all visitors)
        try {
            // Fetch the template by ID
            const template = await prisma.codeTemplate.findUnique({
                where: { id: parseInt(id) },
                include: { tags: true, user: true }, // Include tags and user who created the template
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
        // Forking an existing template (only authenticated users can fork and save)
        const { title, description, code, tags } = req.body;

        if (!session) {
            return res.status(401).json({ message: 'Unauthorized. You must be logged in to fork and save a template.' });
        }

        // Validate the input
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
                    description: `${description} (Forked from template ID: ${originalTemplate.id})`,  // Add fork notification
                    code,
                    user: {
                        connect: { email: session.user.email },  // Link to the authenticated user
                    },
                    language: {
                        connect: { id: originalTemplate.langId },  // Use the same programming language
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