import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';

// chatGPT

export default async function handler(req, res) {
  const postId = parseInt(req.query.id);

  // GET request (fetch post by ID)
  if (req.method === 'GET') {
    return isAuthenticated(req, res, async () => {
      const userId = req.user.id;

      try {
        // Fetch the post by ID, including the hidden status and author
        const post = await prisma.blogPost.findUnique({
          where: { id: postId },
          include: { tags: true },
        });

        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }

        // If the post is hidden by an admin, only the author can view it
        if (post.hidden && post.userId !== userId) {
          return res.status(403).json({ error: 'Unauthorized: This post is hidden' });
        }

        res.status(200).json(post);
      } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
      }
    });
  }

  // PUT request (update post by ID)
  if (req.method === 'PUT') {
    return isAuthenticated(req, res, async () => {
      const { title, description, content, tags } = req.body;
      const userId = req.user.id;

      try {
        // Check if the post exists, is authored by the user, and is not hidden
        const existingPost = await prisma.blogPost.findUnique({
          where: { id: postId },
          select: { userId: true, hidden: true },
        });

        if (!existingPost || existingPost.userId !== userId) {
          return res.status(403).json({ error: 'Unauthorized' });
        }

        if (existingPost.hidden) {
          return res.status(403).json({ error: 'You cannot edit a post that has been hidden by an admin' });
        }

        // Update post
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

  // DELETE request (delete post by ID)
  if (req.method === 'DELETE') {
    return isAuthenticated(req, res, async () => {
      const userId = req.user.id;

      try {
        // Check if the post exists, is authored by the user, and is not hidden
        const existingPost = await prisma.blogPost.findUnique({
          where: { id: postId },
          select: { userId: true, hidden: true },
        });

        if (!existingPost || existingPost.userId !== userId) {
          return res.status(403).json({ error: 'Unauthorized' });
        }

        if (existingPost.hidden) {
          return res.status(403).json({ error: 'You cannot delete a post that has been hidden by an admin' });
        }

        // Delete post
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

  // Method not allowed
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
