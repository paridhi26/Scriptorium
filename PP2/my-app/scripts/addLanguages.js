const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const languages = [
    { id: 1, name: 'JavaScript' },
    { id: 2, name: 'Python' },
    { id: 3, name: 'Java' },
    { id: 4, name: 'C' },
    { id: 5, name: 'C++' },
];

async function addProgrammingLanguages() {
    try {
        for (const language of languages) {
            await prisma.programmingLanguage.upsert({
                where: { id: language.id },
                update: {}, // No update if it exists
                create: language,
            });
            console.log(`Added ${language.name}`);
        }
        console.log('All programming languages added successfully.');
    } catch (error) {
        console.error('Error adding programming languages:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addProgrammingLanguages();
