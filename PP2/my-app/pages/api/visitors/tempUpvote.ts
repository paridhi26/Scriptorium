import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma'; // Adjust the path to your Prisma client

const tempUpvote = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { id } = req.body; // Template ID from the request body

    if (!id) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    try {
      // Find the template by ID
      const template = await prisma.codeTemplate.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Update the upvote count
      const updatedTemplate = await prisma.codeTemplate.update({
        where: { id: parseInt(id, 10) },
        data: {
          upvotes: {
            increment: 1, // Increment the upvote count by 1
          },
        },
      });

      return res.status(200).json({ message: 'Upvoted successfully', template: updatedTemplate });
    } catch (error) {
      console.error('Error in tempUpvote API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

export default tempUpvote;






















































