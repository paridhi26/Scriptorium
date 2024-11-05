const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
    const passwordHash = await bcrypt.hash('admin', 10);

    try {
        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@scriptorium.com',
                password: passwordHash,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
            },
        });
        console.log('Admin user created:', adminUser);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
