import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma'; // Adjust the import based on your prisma setup

const blogDownvote = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { id } = req.body; // Blog ID from the request body

    if (!id) {
      return res.status(400).json({ error: 'Blog ID is required' });
    }

    try {
      // Find the blog post by ID
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      // Update the downvote count
      const updatedBlogPost = await prisma.blogPost.update({
        where: { id: parseInt(id, 10) },
        data: {
          downvotes: {
            increment: 1, // Increment the downvote count by 1
          },
        },
      });

      return res.status(200).json({ message: 'Downvoted successfully', blogPost: updatedBlogPost });
    } catch (error) {
      console.error('Error in blogDownvote API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

export default blogDownvote;






















