import prisma from '@lib/prisma';
import jwt from 'jsonwebtoken';

// used chatGPT to replace previous authentication logic with new one

const SECRET_KEY = process.env.JWT_SECRET;

export default async function saveTemplate(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;

        // Validate required fields
        const { title, description, code, languageId, tags } = req.body;
        if (!title || !description || !code || !languageId) {
            console.log('Missing fields:', { title, description, code, languageId });
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // Fetch the authenticated user from the database
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        console.error('Error saving template:', error);
        res.status(500).json({ error: 'An error occurred while saving the template.' });
    }
}