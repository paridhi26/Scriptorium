import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

// Extend NextApiRequest to include Multer file
interface MulterRequest extends NextApiRequest {
    file?: Express.Multer.File;
}

// Configure Multer to save images in the `public/avatars` directory
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(process.cwd(), 'public/avatars');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
});

// Helper function to convert Next.js request to Express-compatible request
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: Function) => {
    return new Promise<void>((resolve, reject) => {
        fn(req as any, res as any, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

export default async function signUp(req: MulterRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    try {
        // Run the Multer middleware
        await runMiddleware(req, res, upload.single('avatar'));

        const { email, password, firstName, lastName, phone } = req.body;

        // Check required fields
        if (!email || !password || !firstName || !lastName) {
            console.log('Missing fields:', { email, password, firstName, lastName });
            res.status(400).json({ message: 'Missing required fields.' });
            return;
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Define the avatar URL path
        const avatar = req.file ? `/avatars/${req.file.filename}` : null;

        // Create the user in the database
        const user = await prisma.user.create({
            data: {
                email,
                password: passwordHash,
                firstName,
                lastName,
                avatar,
                phone,
            },
        });

        console.log('Created user:', user);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ message: 'An error occurred.' });
    }
}

// Disable body parsing to allow file uploads in Next.js
export const config = {
    api: {
        bodyParser: false,
    },
};
