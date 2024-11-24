import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const templates = await prisma.codeTemplate.findMany();
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'An error occurred while fetching templates.' });
  }
}