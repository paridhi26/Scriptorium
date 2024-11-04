import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';

// chatGPT

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return isAuthenticated(req, res, async () => {
      const { title, description, content, tags = [], codeTemplateIds = [] } = req.body;
      const authorId = req.user.id;

      if (!title || !description || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      try {
        // Check if all `codeTemplateIds` exist
        const existingCodeTemplates = await prisma.codeTemplate.findMany({
          where: { id: { in: codeTemplateIds } },
          select: { id: true },
        });

        const existingIds = existingCodeTemplates.map(ct => ct.id);
        const missingIds = codeTemplateIds.filter(id => !existingIds.includes(id));

        if (missingIds.length > 0) {
          return res.status(400).json({
            message: 'Some CodeTemplate IDs do not exist',
            missingIds,
          });
        }

        // Create the BlogPost with related tags and code templates
        const post = await prisma.blogPost.create({
          data: {
            title,
            description,
            content,
            userId: authorId,
            tags: {
              create: tags.map(tag => ({ tag })),
            },
            codeTemplates: {
              connect: codeTemplateIds.map(id => ({ id })),
            },
          },
        });

        res.status(201).json(post);
      } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post', error: error.message });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}