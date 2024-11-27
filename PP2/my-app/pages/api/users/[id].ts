import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

// Extend NextApiRequest to include user information and file
interface ExtendedNextApiRequest extends NextApiRequest {
    user?: {
        id: number;
        email: string;
    };
    file?: Express.Multer.File;
}

// Configure Multer for avatar uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(process.cwd(), 'public', 'avatars');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
    }),
}).single('avatar');

// Multer middleware wrapper for Next.js
const runMiddleware = (req: ExtendedNextApiRequest, res: NextApiResponse, fn: Function) => {
    return new Promise<void>((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse): Promise<void> {
    const id = parseInt(req.query.id as string, 10);

    if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid user ID.' });
        return;
    }

    if (req.method === 'GET') {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    phone: true,
                    role: true,
                },
            });

            if (!user) {
                res.status(404).json({ message: 'User not found.' });
                return;
            }

            res.status(200).json(user);
        } catch (error: any) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'An error occurred while fetching the user.' });
        }
    } else if (req.method === 'PUT') {
        await runMiddleware(req, res, upload);

        return isAuthenticated(req, res, async () => {
            const { email, password, firstName, lastName, phone }: Partial<{
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                phone: string;
            }> = req.body;

            const userId = req.user?.id;

            if (userId !== id) {
                res.status(403).json({ message: 'Unauthorized to update this user.' });
                return;
            }

            try {
                const updateData: any = {
                    ...(email && { email }),
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(phone && { phone }),
                };

                if (password) {
                    updateData.password = await bcrypt.hash(password, 10);
                }

                if (req.file) {
                    updateData.avatar = `/avatars/${req.file.filename}`;
                }

                await prisma.user.update({
                    where: { id },
                    data: updateData,
                });

                const updatedUser = await prisma.user.findUnique({
                    where: { id },
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        phone: true,
                    },
                });

                res.status(200).json(updatedUser);
            } catch (error: any) {
                console.error('Error updating user:', error);
                res.status(500).json({ error: 'An error occurred while updating the user.' });
            }
        });
    } else if (req.method === 'DELETE') {
        return isAuthenticated(req, res, async () => {
            const userId = req.user?.id;

            if (userId !== id) {
                res.status(403).json({ message: 'Unauthorized to delete this user.' });
                return;
            }

            try {
                const user = await prisma.user.findUnique({
                    where: { id },
                    select: { avatar: true },
                });

                const deletedUser = await prisma.user.delete({
                    where: { id },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                });

                if (user?.avatar) {
                    const avatarPath = path.join(process.cwd(), 'public', user.avatar);
                    fs.unlink(avatarPath, (err) => {
                        if (err) {
                            console.error('Error deleting avatar:', err);
                        } else {
                            console.log('Avatar deleted:', avatarPath);
                        }
                    });
                }

                res.status(200).json({ message: 'User deleted successfully.', user: deletedUser });
            } catch (error: any) {
                console.error('Error deleting user:', error);
                res.status(500).json({ error: 'An error occurred while deleting the user.' });
            }
        });
    } else {
        res.status(405).json({ message: 'Method not allowed.' });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
