import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';
import { NextApiRequest, NextApiResponse } from 'next';

// Extend NextApiRequest to include user information
interface ExtendedNextApiRequest extends NextApiRequest {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === 'POST') {
    return isAuthenticated(req, res, async () => {
      const { title, description, content, tags = [], codeTemplateIds }: {
        title: string;
        description: string;
        content: string;
        tags?: string[];
        codeTemplateIds?: (string | number)[];
      } = req.body;

      const authorId = req.user?.id;

      if (!title || !description || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      try {
        // Validate and parse codeTemplateIds
        const validCodeTemplateIds = Array.isArray(codeTemplateIds)
          ? codeTemplateIds
              .map((id) => (typeof id === "string" ? parseInt(id, 10) : id))
              .filter((id) => !isNaN(id))
          : [];

        const codeTemplateConnections: { id: number }[] = [];

        if (validCodeTemplateIds.length > 0) {
          const existingCodeTemplates = await prisma.codeTemplate.findMany({
            where: { id: { in: validCodeTemplateIds } },
            select: { id: true },
          });

          const existingIds = existingCodeTemplates.map((ct) => ct.id);
          const missingIds = validCodeTemplateIds.filter((id) => !existingIds.includes(id));

          if (missingIds.length > 0) {
            return res.status(400).json({ message: 'Some CodeTemplate IDs do not exist', missingIds });
          }

          codeTemplateConnections.push(...existingIds.map((id) => ({ id })));
        }

        const post = await prisma.blogPost.create({
          data: {
            title,
            description,
            content,
            userId: authorId!,
            tags: {
              create: tags.map((tag) => ({ tag })),
            },
            ...(codeTemplateConnections.length > 0 && {
              codeTemplates: {
                connect: codeTemplateConnections,
              },
            }),
          },
        });

        res.status(201).json(post);
      } catch (error: any) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post', error: error.message });
      }
    });
  } else if (req.method === 'GET') {
    try {
      const authHeader = req.headers.authorization;
      const user = authHeader
        ? await isAuthenticated(req, res, async () => req.user) // Check if user is authenticated
        : null;

      const userId = user?.id;
      const isAdmin = user?.role === 'ADMIN';

      const posts = await prisma.blogPost.findMany({
        where: {
          OR: [
            { hidden: false }, // Publicly visible posts
            ...(userId ? [{ userId }] : []), // Posts authored by the logged-in user
            ...(isAdmin ? [{ hidden: true }] : []), // Admins can view all posts
          ],
        },
        include: {
          tags: true,
          codeTemplates: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      res.status(200).json(posts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
