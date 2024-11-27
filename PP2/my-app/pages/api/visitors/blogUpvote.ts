import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma'; // Adjust the import path based on your project setup

const blogUpvote = async (req: NextApiRequest, res: NextApiResponse) => {
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

      // Update the upvote count
      const updatedBlogPost = await prisma.blogPost.update({
        where: { id: parseInt(id, 10) },
        data: {
          upvotes: {
            increment: 1, // Increment the upvote count by 1
          },
        },
      });

      return res.status(200).json({ message: 'Upvoted successfully', blogPost: updatedBlogPost });
    } catch (error) {
      console.error('Error in blogUpvote API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

export default blogUpvote;























