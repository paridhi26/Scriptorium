import prisma from '@lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Fetch the code template by ID
        const template = await prisma.codeTemplate.findUnique({
            where: { id: parseInt(id) },
            include: { tags: true, user: true }, // Include tags and user who created the template
        });

        if (!template) {
            return res.status(404).json({ message: 'Template not found.' });
        }

        // Return the code template details
        return res.status(200).json(template);

    } catch (error) {
        console.error('Error fetching template:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the template.' });
    }
}
