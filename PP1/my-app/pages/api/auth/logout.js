import jwt from 'jsonwebtoken';

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
export const isAuthenticated = (req, res, next) => {
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

    // Verify the token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('JWT Error:', err);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        // Attach decoded user information to the request object
        req.user = { id: decoded.userId, email: decoded.email };
        next();
    });
};