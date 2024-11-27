import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const searchTemplatePaginated = async (req: NextApiRequest, res: NextApiResponse) => {
  const { page = 1, pageSize = 10, query = '' } = req.query;

  // Ensure `page` and `pageSize` are integers
  const pageInt = parseInt(page as string, 10);
  const pageSizeInt = parseInt(pageSize as string, 10);

  if (isNaN(pageInt) || isNaN(pageSizeInt)) {
    return res.status(400).json({ error: 'Invalid page or pageSize parameter' });
  }

  try {
    // Perform the search query in the database (use Prisma to filter based on `query`)
    const codeTemplates = await prisma.codeTemplate.findMany({
      where: {
        title: {
          contains: query, // Use `query` to search for templates that contain the string
          // Remove `mode: 'insensitive'` and instead use a lowercased comparison
        },
      },
      skip: (pageInt - 1) * pageSizeInt, // Paginate by skipping a number of results
      take: pageSizeInt, // Limit the results per page
      orderBy: {
        createdAt: 'desc', // Order by most recent template first
      },
      include: {
        tags: true, // Include the tags in the response (if needed)
      },
    });

    // Count the total number of templates matching the query
    const totalTemplates = await prisma.codeTemplate.count({
      where: {
        title: {
          contains: query,
        },
      },
    });

    const totalPages = Math.ceil(totalTemplates / pageSizeInt);

    return res.status(200).json({
      codeTemplates,
      totalPages, // Return total pages for pagination
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default searchTemplatePaginated;