import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(id) },
                select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    phone: true,
                    // Exclude password field
                },
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while fetching the user.' });
        }
    } else if (req.method === 'PUT') {
        return upload(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to upload file.' });
            }

            return isAuthenticated(req, res, async () => {
                const { email, password, firstName, lastName, phone } = req.body;
                const userId = req.user.id;

                if (userId !== parseInt(id)) {
                    return res.status(403).json({ message: 'Unauthorized to update this user.' });
                }

                try {
                    let updateData = {
                        ...(email && { email }),
                        ...(firstName && { firstName }),
                        ...(lastName && { lastName }),
                        ...(phone && { phone }),
                    };

                    if (password) {
                        const hashedPassword = await bcrypt.hash(password, 10);
                        updateData.password = hashedPassword;
                    }

                    if (req.file) {
                        updateData.avatar = `/avatars/${req.file.filename}`;
                    }

                    await prisma.user.update({
                        where: { id: parseInt(id) },
                        data: updateData,
                    });

                    // Fetch the updated user without the password field
                    const updatedUser = await prisma.user.findUnique({
                        where: { id: parseInt(id) },
                        select: {
                            email: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            phone: true,
                            // Exclude password field
                        },
                    });

                    res.status(200).json(updatedUser);
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'An error occurred while updating the user' });
                }
            });
        });
    } else if (req.method === 'DELETE') {
        return isAuthenticated(req, res, async () => {
            const userId = req.user.id;

            if (userId !== parseInt(id)) {
                return res.status(403).json({ message: 'Unauthorized to delete this user.' });
            }

            try {
                const user = await prisma.user.findUnique({
                    where: { id: parseInt(id) },
                    select: { avatar: true },
                });

                const deletedUser = await prisma.user.delete({
                    where: { id: parseInt(id) },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                });

                if (user.avatar) {
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
            } catch (error) {
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
