const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function clearDatabase() {
    try {
        // Delete all records from the database
        await prisma.vote.deleteMany();
        await prisma.inappropriateContentReport.deleteMany();
        await prisma.comment.deleteMany();
        await prisma.blogPost.deleteMany();
        await prisma.codeTemplate.deleteMany();
        await prisma.programmingLanguage.deleteMany();
        await prisma.user.deleteMany();

        console.log('Database cleared successfully.');

        // Reset ID counters for each table
        await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name = 'Vote'`;
        await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name = 'InappropriateContentReport'`;
        await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name = 'Comment'`;
        await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name = 'BlogPost'`;
        await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name = 'CodeTemplate'`;
        await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name = 'ProgrammingLanguage'`;
        await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name = 'User'`;

        console.log('ID counters reset successfully.');

        // Delete all images in the public/avatars directory
        const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
        
        if (fs.existsSync(avatarsDir)) {
            fs.readdirSync(avatarsDir).forEach(file => {
                const filePath = path.join(avatarsDir, file);
                fs.unlinkSync(filePath);
            });
            console.log('All images in the avatars directory have been deleted.');
        } else {
            console.log('Avatars directory does not exist.');
        }
    } catch (error) {
        console.error('Error clearing database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearDatabase();
