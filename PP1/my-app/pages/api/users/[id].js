import prisma from '@lib/prisma';
import { isAuthenticated } from '@auth/logout';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
    const { id } = req.query; // user id from the query params

    // GET request (fetch user by id)
    if (req.method === 'GET') {
        try {
            // find user in the database
            const user = await prisma.user.findUnique({
                where: { id: parseInt(id) },
            });

            // if user does not exist return 404
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json(user);

        } catch (error) {
            res.status(500).json({ error: 'An error occurred while fetching the user.' });
        }
    }

    // PUT request (update user by id)
    else if (req.method === 'PUT') {
        return isAuthenticated(req, res, async () => {
            const { email, password, firstName, lastName, avatar, phone } = req.body;
            const userId = req.user.id;

            // Check if authenticated user is updating their own profile
            if (userId !== parseInt(id)) {
                return res.status(403).json({ message: 'Unauthorized to update this user.' });
            }

            try {
                let updateData = {
                    ...(email && { email }),
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(avatar && { avatar }),
                    ...(phone && { phone }),
                };

                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    updateData.password = hashedPassword;
                }

                const updatedUser = await prisma.user.update({
                    where: { id: parseInt(id) },
                    data: updateData,
                });

                res.status(200).json(updatedUser);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'An error occurred while updating the user' });
            }
        });
    }

    // DELETE request (delete user by id)
    else if (req.method === 'DELETE') {
        return isAuthenticated(req, res, async () => {
            const userId = req.user.id;

            // Check if authenticated user is deleting their own profile
            if (userId !== parseInt(id)) {
                return res.status(403).json({ message: 'Unauthorized to delete this user.' });
            }

            try {
                const deletedUser = await prisma.user.delete({
                    where: { id: parseInt(id) },
                });

                res.status(200).json({ message: 'User deleted successfully.', user: deletedUser });
            } catch (error) {
                res.status(500).json({ error: 'An error occurred while deleting the user.' });
            }
        });
    } else {
        res.status(405).json({ message: 'Method not allowed.' });
    }
} 