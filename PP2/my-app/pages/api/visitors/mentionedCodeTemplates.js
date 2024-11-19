import prisma from '@lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Fetch the code template by ID, including any blog posts that reference it
        const template = await prisma.codeTemplate.findUnique({
            where: { id: parseInt(id) },
            include: {
                tags: true,
                blogPosts: {
                    where: { hidden: false }, // Only include blog posts that are not hidden
                    include: {
                        tags: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!template) {
            return res.status(404).json({ message: 'Template not found.' });
        }

        // Return the template with associated blog posts that are not hidden
        return res.status(200).json(template);

    } catch (error) {
        console.error('Error fetching template with associated blog posts:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the template.' });
    }
}
