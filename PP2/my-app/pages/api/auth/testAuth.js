import { isAuthenticated } from './logout';

// This is a test file to check authentication APIs

export default function testAuth(req, res) {
    // use GET method to check user by token
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Check if user is authenticated
    return isAuthenticated(req, res, async () => {
        res.status(200).json({ message: 'Authenticated!' });
    });
}
