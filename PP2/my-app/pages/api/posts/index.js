import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';

export default async function handler(req, res) {
  // Handle creating a new post
  if (req.method === 'POST') {
    return isAuthenticated(req, res, async () => {
      const { title, description, content, tags = [], codeTemplateIds } = req.body; // Optional `codeTemplateIds`
      const authorId = req.user.id;
  
      if (!title || !description || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      try {
        // Initialize codeTemplateConnections array
        let codeTemplateConnections = [];
  
        // Process `codeTemplateIds` only if it's provided and is a non-empty array
        if (Array.isArray(codeTemplateIds) && codeTemplateIds.length > 0) {
          // Convert all `codeTemplateIds` to integers
          const codeTemplateIdsInt = codeTemplateIds.map((id) => {
            const parsedId = parseInt(id, 10);
            if (isNaN(parsedId)) {
              throw new Error('codeTemplateIds must contain valid integers.');
            }
            return parsedId;
          });
  
          // Fetch existing code templates for the provided IDs
          const existingCodeTemplates = await prisma.codeTemplate.findMany({
            where: { id: { in: codeTemplateIdsInt } },
            select: { id: true },
          });
  
          const existingIds = existingCodeTemplates.map((ct) => ct.id);
          const missingIds = codeTemplateIdsInt.filter((id) => !existingIds.includes(id));
  
          // If some IDs are invalid, return an error
          if (missingIds.length > 0) {
            return res.status(400).json({
              message: 'Some CodeTemplate IDs do not exist',
              missingIds,
            });
          }
  
          // Prepare `connect` objects for valid IDs
          codeTemplateConnections = existingIds.map((id) => ({ id }));
        }
  
        // Create the BlogPost with related tags and optional code templates
        const post = await prisma.blogPost.create({
          data: {
            title,
            description,
            content,
            userId: authorId,
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
      } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post', error: error.message });
      }
    });
  }
  
  
  // Handle fetching all posts for the authenticated user
  else if (req.method === 'GET') {
    return isAuthenticated(req, res, async () => {
      const authorId = req.user.id;

      try {
        const posts = await prisma.blogPost.findMany({
          where: { userId: authorId },
          include: {
            tags: true,
            codeTemplates: true,
          },
        });

        res.status(200).json(posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
      }
    });
  }
  
  // Method not allowed
  else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
