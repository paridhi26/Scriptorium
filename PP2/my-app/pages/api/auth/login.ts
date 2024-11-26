import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

const SECRET_KEY = process.env.JWT_SECRET as string;

export default async function login(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { email, password } = req.body as { email: string; password: string };

    // Check if email and password are provided
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // If user is not found
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        // Check if the password matches
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            SECRET_KEY,
            { expiresIn: '1h' } // Token expiration time
        );

        // Return the token and userId
        res.status(200).json({ token, userId: user.id });
    } catch (error) {
        console.error('Login error:', error); // Log the error for debugging
        res.status(500).json({ error: 'An error occurred during login.' });
    }
}
