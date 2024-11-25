import jwt from 'jsonwebtoken';
import prisma from '@lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

// Define an extended type for NextApiRequest to include `user`
interface ExtendedNextApiRequest extends NextApiRequest {
    user?: {
        id: number;
        email: string;
    };
}

const SECRET_KEY = process.env.JWT_SECRET as string;

// Blacklisted tokens (logged out user tokens) will be stored here
const blacklist: string[] = [];

export default function logout(req: ExtendedNextApiRequest, res: NextApiResponse): void {
    const token = req.headers.authorization?.split(' ')[1];

    // If token does not exist
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    // Add token to blacklist
    blacklist.push(token);

    res.status(200).json({ message: 'Logged out successfully' });
}

// Middleware to check if the user is authenticated
export const isAuthenticated = async (
    req: ExtendedNextApiRequest,
    res: NextApiResponse,
    next: () => void,
    requireAdmin = false
): Promise<void> => {
    // Ensure the authorization header is present
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    // Extract token from the "Bearer <token>" format
    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: Token missing' });
        return;
    }

    // Check if the token is blacklisted
    if (blacklist.includes(token)) {
        res.status(401).json({ message: 'Token has been invalidated' });
        return;
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string; email: string };
        
        // Parse userId to a number if necessary
        const userId = parseInt(decoded.userId, 10);
        if (isNaN(userId)) {
            res.status(403).json({ message: 'Invalid token payload' });
            return;
        }

        req.user = { id: userId, email: decoded.email };

        // If requireAdmin is true, check for the admin role
        if (requireAdmin) {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
            });
            if (!user || user.role !== 'ADMIN') {
                res.status(403).json({ message: 'Forbidden: Admin access required' });
                return;
            }
        }

        // Call next middleware or handler
        next();
    } catch (err) {
        console.error('JWT Error:', err);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};
