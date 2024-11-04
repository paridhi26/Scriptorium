import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';

// chatGPT

export default async function handler(req, res) {
  const postId = parseInt(req.query.id);

  if (req.method === 'PUT') {
    // update post by id
    return isAuthenticated(req, res, async () => {
      const { title, description, content, tags } = req.body;
      const userId = req.user.id;

      try {
        // check if post exists and user is the author
        const existingPost = await prisma.blogPost.findUnique({
          where: { id: postId },
        });

        if (!existingPost || existingPost.userId !== userId) {
          return res.status(403).json({ error: 'Unauthorized' });
        }

        // update post
        const updatedPost = await prisma.blogPost.update({
          where: { id: postId },
          data: {
            title,
            description,
            content,
            tags: {
              deleteMany: {},
              create: tags.map(tag => ({ tag })),
            },
          },
          include: { tags: true },  
        });
        res.status(200).json(updatedPost);
      } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
      }
    });
  } 
  
  if (req.method === 'DELETE') {
    // delete post by id
    return isAuthenticated(req, res, async () => {
      const userId = req.user.id;

      try {
        // check if post exists and user is the author
        const existingPost = await prisma.blogPost.findUnique({
          where: { id: postId },
        });

        if (!existingPost || existingPost.userId !== userId) {
          return res.status(403).json({ error: 'Unauthorized' });
        }

        // delete post
        await prisma.blogPost.delete({
          where: { id: postId },
        });
        res.status(200).json({ message: 'Post deleted successfully' });
      } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
      }
    });
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
