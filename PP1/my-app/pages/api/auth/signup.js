import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
}).single('avatar');

export default async function signUp(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: 'File upload error' });
        }

        const { email, password, firstName, lastName, phone } = req.body;

        // Check required fields
        if (!email || !password || !firstName || !lastName) {
            console.log('Missing fields:', { email, password, firstName, lastName });
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        try {
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
    });
}

// Disable body parsing to allow file uploads in Next.js
export const config = {
    api: {
        bodyParser: false,
    },
};
