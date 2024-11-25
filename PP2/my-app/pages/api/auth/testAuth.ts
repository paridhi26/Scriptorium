import { isAuthenticated } from './logout';
import { NextApiRequest, NextApiResponse } from 'next';

interface ExtendedNextApiRequest extends NextApiRequest {
    user?: {
        id: number;
        email: string;
    };
}

export default function testAuth(req: ExtendedNextApiRequest, res: NextApiResponse): void {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    isAuthenticated(req, res, async () => {
        res.status(200).json({ message: 'Authenticated!' });
    });
}
