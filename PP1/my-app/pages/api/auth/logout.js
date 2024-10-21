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
export const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];

    // if token does not exist
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // if token is blacklisted
    if (blacklist.includes(token)) {
        return res.status(401).json({ message: 'Token has been invalidated' });
    }

    // verify if token is valid
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    });
}