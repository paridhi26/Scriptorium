import prisma from '@lib/prisma';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
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

        const { search, page = 1, pageSize = 10 } = req.query; // Pagination parameters with defaults

        // Validate page and pageSize
        const currentPage = parseInt(page, 10);
        const size = parseInt(pageSize, 10);

        if (isNaN(currentPage) || currentPage <= 0 || isNaN(size) || size <= 0) {
            return res.status(400).json({ message: 'Invalid page or pageSize.' });
        }

        // Find the authenticated user by userId from the JWT
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Build the search filters only if `search` is defined
        const searchFilters = search
            ? [
                { title: { contains: search, mode: 'insensitive' } }, // Case-insensitive search
                { description: { contains: search, mode: 'insensitive' } },
                {
                    tags: {
                        some: { tag: { contains: search, mode: 'insensitive' } },
                    },
                },
            ]
            : undefined;

        // Calculate the offset for pagination
        const skip = (currentPage - 1) * size;

        // Fetch templates by the user with optional search filters and pagination
        const templates = await prisma.codeTemplate.findMany({
            where: {
                userId: user.id,
                OR: searchFilters, // Only include `OR` if searchFilters is defined
            },
            include: {
                tags: true, // Include related tags for each template
            },
            skip, // Skip results for pagination
            take: size, // Limit results for pagination
        });

        // Get the total count of matching templates for pagination metadata
        const totalTemplates = await prisma.codeTemplate.count({
            where: {
                userId: user.id,
                OR: searchFilters,
            },
        });

        const totalPages = Math.ceil(totalTemplates / size);

        res.status(200).json({
            currentPage,
            pageSize: size,
            totalTemplates,
            totalPages,
            templates,
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'An error occurred while fetching the templates.' });
    }
}
