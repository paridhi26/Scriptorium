import jwt from 'jsonwebtoken';
import prisma from '@lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

// blacklisted tokens (logged out user tokens) will be stored here
const blacklist = [];

export default function logout(req, res) {  
    const token = req.headers.authorization?.split(' ')[1];

    // if token does not exist
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // add token to blacklist
    blacklist.push(token);

    return res.status(200).json({ message: 'Logged out successfully' });
}


// Middleware to check if user is authenticated
// import this function to check if user is authenticated when needed
// fixed with chatGPT
export const isAuthenticated = async (req, res, next, requireAdmin = false) => {
    // Ensure the authorization header is present
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Extract token from the "Bearer <token>" format
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    // Check if the token is blacklisted
    if (blacklist.includes(token)) {
        return res.status(401).json({ message: 'Token has been invalidated' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = { id: decoded.userId, email: decoded.email };

        // If requireAdmin is true, check for the admin role
        if (requireAdmin) {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
            });
            if (!user || user.role !== 'ADMIN') {
                return res.status(403).json({ message: 'Forbidden: Admin access required' });
            }
        }

        // Call next middleware or handler
        return next();
    } catch (err) {
        console.error('JWT Error:', err);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};