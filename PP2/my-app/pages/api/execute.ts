import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { NextApiRequest, NextApiResponse } from 'next';

const execAsync = promisify(exec);

// Define the structure of supported languages
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

    const { language, code, input } = req.body;

    if (!language || !code) {
        res.status(400).json({ message: 'Language and code are required.' });
        return;
    }

    if (!supportedLanguages[language]) {
        res.status(400).json({ message: `Unsupported language: ${language}` });
        return;
    }

    const { fileExtension, dockerImage, command } = supportedLanguages[language];

    try {
        const tempDir = os.tmpdir();
        const fileName = language === 'java' ? 'Main.java' : `code${fileExtension}`;
        const filePath = path.join(tempDir, fileName);

        // Write the user-provided code to a temporary file
        await fs.writeFile(filePath, code);

        // Construct the Docker command
        const dockerCommand = input
            ? `docker run --rm -v ${filePath}:/app/${fileName} ${dockerImage} sh -c "echo '${input}' | ${command}"`
            : `docker run --rm -v ${filePath}:/app/${fileName} ${dockerImage} sh -c "${command}"`;

        const { stdout, stderr } = await execAsync(dockerCommand, { shell: true });

        res.status(200).json({
            stdout: stdout.trim(),
            stderr: stderr.trim() || null,
        });
    } catch (error: any) {
        // Capture stdout and stderr even when there's an error
        const stdout = error.stdout ? error.stdout.trim() : null;
        const stderr = error.stderr ? error.stderr.trim() : null;

        res.status(500).json({
            message: 'Server error',
            stdout: stdout || null,
            stderr: stderr || error.message,
        });
    }
}
