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
  if (req.method === 'GET') {
    return isAuthenticated(req, res, async () => {
      try {
        const userId = req.user?.id;

        if (!userId) {
          return res.status(403).json({ message: 'Unauthorized' });
        }

        const posts = await prisma.blogPost.findMany({
          where: { userId }, // Fetch posts created by the authenticated user
          include: {
            tags: true,
            codeTemplates: true,
          },
          orderBy: {
            createdAt: 'desc', // Optional: Order posts by creation date
          },
        });

        res.status(200).json(posts);
      } catch (error: any) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: 'Failed to fetch user posts', error: error.message });
      }
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
