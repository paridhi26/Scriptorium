import prisma from '@lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { query }: { query?: string } = req.query;

    // Ensure the search query is provided
    if (!query || typeof query !== 'string') {
        res.status(400).json({ message: 'Search query is required.' });
        return;
    }

    try {
        // Use raw SQL to perform case-insensitive search for SQLite
        const templates = await prisma.$queryRawUnsafe<any[]>(`
            SELECT ct.*, 
                   json_group_array(ctt.tag) AS tags, 
                   u.firstName AS userFirstName, 
                   u.lastName AS userLastName, 
                   u.email AS userEmail
            FROM CodeTemplate ct
            LEFT JOIN CodeTemplateTag ctt ON ct.id = ctt.codeTemplateId
            LEFT JOIN User u ON ct.userId = u.id
            WHERE LOWER(ct.title) LIKE LOWER(?) 
               OR LOWER(ct.description) LIKE LOWER(?) 
               OR LOWER(ct.code) LIKE LOWER(?) 
               OR LOWER(ctt.tag) LIKE LOWER(?)
            GROUP BY ct.id
        `, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);

        // If no templates are found
        if (templates.length === 0) {
            res.status(200).json({ message: 'No templates found for the search query.', templates: [] });
            return;
        }

        // Return the found templates
        res.status(200).json(templates);
    } catch (error: any) {
        console.error('Error searching templates:', error);
        res.status(500).json({ message: 'An error occurred while searching templates.' });
    }
}
