import prisma from '../../../lib/prisma';
import { getSession } from 'next-auth/react';

export default async function saveTemplate(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getSession({ req });

    // Ensure user is authenticated
    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, description, code, languageId, tags } = req.body;

    // Validate required fields
    if (!title || !description || !code || !languageId) {
        console.log('Missing fields:', { title, description, code, languageId });
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        // Get the authenticated user from the session
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found.' });
        }

        // Create a new code template
        const newTemplate = await prisma.codeTemplate.create({
            data: {
                title,
                description,
                code,
                language: {
                    connect: { id: languageId },  // Link to the programming language
                },
                user: {
                    connect: { id: user.id },  // Link to the user
                },
                tags: {
                    create: tags.map((tag) => ({ tag })),  // Create tags
                },
            },
        });

        console.log('Created template:', newTemplate);
        res.status(201).json(newTemplate);

    } catch (error) {
        console.error('Error saving template:', error);
        res.status(500).json({ error: 'An error occurred while saving the template.' });
    }
}