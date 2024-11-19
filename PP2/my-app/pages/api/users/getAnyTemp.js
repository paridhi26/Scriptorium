import prisma from '@lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { query } = req.query;

    // Ensure the search query is provided
    if (!query) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    try {
        // Perform search on the templates by title, tags, or content (code or description)
        const templates = await prisma.codeTemplate.findMany({
            where: {
                OR: [
                    { title: { contains: query } },  // Search by title
                    { description: { contains: query } },  // Search by description
                    { code: { contains: query } },  // Search by code content
                    {
                        tags: {
                            some: { tag: { contains: query } },  // Search by tags
                        },
                    },
                ],
            },
            include: {
                tags: true,  // Include tags in the result
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },  // Include user info who created the template
            },
        });

        // If no templates are found
        if (templates.length === 0) {
            return res.status(200).json({ message: 'No templates found for the search query.', templates: [] });
        }

        // Return the found templates
        return res.status(200).json(templates);

    } catch (error) {
        console.error('Error searching templates:', error);
        return res.status(500).json({ message: 'An error occurred while searching templates.' });
    }
}
