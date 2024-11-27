import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@lib/prisma';

const execAsync = promisify(exec);

interface LanguageConfig {
    fileExtension: string;
    dockerImage: string;
    command: string;
}

const supportedLanguages: Record<string, LanguageConfig> = {
    python: {
        fileExtension: '.py',
        dockerImage: 'python-executor',
        command: 'python3 /app/code.py',
    },
    javascript: {
        fileExtension: '.js',
        dockerImage: 'node-executor',
        command: 'node /app/code.js',
    },
    java: {
        fileExtension: '.java',
        dockerImage: 'java-executor',
        command: 'javac /app/Main.java && java -cp /app Main',
    },
    c: {
        fileExtension: '.c',
        dockerImage: 'c-executor',
        command: 'gcc /app/code.c -o /app/code && /app/code',
    },
    cpp: {
        fileExtension: '.cpp',
        dockerImage: 'cpp-executor',
        command: 'g++ /app/code.cpp -o /app/code && /app/code',
    },
    ruby: {
        fileExtension: '.rb',
        dockerImage: 'ruby-executor',
        command: 'ruby /app/code.rb',
    },
    go: {
        fileExtension: '.go',
        dockerImage: 'go-executor',
        command: 'go run /app/code.go',
    },
    php: {
        fileExtension: '.php',
        dockerImage: 'php-executor',
        command: 'php /app/code.php',
    },
    perl: {
        fileExtension: '.pl',
        dockerImage: 'perl-executor',
        command: 'perl /app/code.pl',
    },
    rust: {
        fileExtension: '.rs',
        dockerImage: 'rust-executor',
        command: 'rustc /app/code.rs && /app/code',
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { templateId, input }: { templateId?: number | string; input?: string } = req.body;

    if (!templateId) {
        res.status(400).json({ message: 'Template ID is required.' });
        return;
    }

    const parsedTemplateId = typeof templateId === 'string' ? parseInt(templateId, 10) : templateId;

    if (isNaN(parsedTemplateId)) {
        res.status(400).json({ message: 'Invalid Template ID.' });
        return;
    }

    try {
        const template = await prisma.codeTemplate.findUnique({
            where: { id: parsedTemplateId },
            select: { code: true, language: true },
        });

        if (!template) {
            res.status(404).json({ message: 'Code template not found.' });
            return;
        }

        const { code, language } = template;
        let languageName = typeof language === 'string' ? language.toLowerCase() : language?.name?.toLowerCase();

        // change C++ to cpp
        if (languageName === 'c++') {
            languageName = 'cpp';
        }

        if (!languageName || !supportedLanguages[languageName]) {
            res.status(400).json({ message: `Unsupported language: ${JSON.stringify(language)}` });
            return;
        }

        const { fileExtension, dockerImage, command } = supportedLanguages[languageName];

        const tempDir = os.tmpdir();
        const fileName = languageName === 'java' ? 'Main.java' : `code${fileExtension}`;
        const filePath = path.join(tempDir, fileName);

        await fs.writeFile(filePath, code);

        const dockerCommand = input
            ? `docker run --rm -v ${filePath}:/app/${fileName} ${dockerImage} sh -c "echo '${input}' | ${command}"`
            : `docker run --rm -v ${filePath}:/app/${fileName} ${dockerImage} sh -c "${command}"`;

        try {
            const { stdout, stderr } = await execAsync(dockerCommand);

            res.status(200).json({
                stdout: stdout.trim(),
                stderr: stderr.trim() || null,
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Execution failed',
                stdout: error.stdout ? error.stdout.trim() : null,
                stderr: error.stderr ? error.stderr.trim() : error.message,
            });
        }
    } catch (err: any) {
        console.error('Execution error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}
