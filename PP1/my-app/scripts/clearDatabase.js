// scripts/clearDatabase.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
    try {
        // Ensure the correct model names are used here as per your schema
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
    } catch (error) {
        console.error('Error clearing database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearDatabase();
