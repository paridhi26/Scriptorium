import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { exec } from 'child_process';
import { NextApiRequest, NextApiResponse } from 'next';

const execAsync = promisify(exec);

const execWithTimeout = (cmd: string, timeout = 10000): Promise<{ stdout: string; stderr: string }> => {
    return new Promise((resolve, reject) => {
        const process = exec(cmd, (error, stdout, stderr) => {
            if (error) return reject(error);
            resolve({ stdout, stderr });
        });

        setTimeout(() => {
            process.kill();
            reject(new Error('Execution timeout exceeded.'));
        }, timeout);
    });
};

// Supported languages and their corresponding file extensions
const fileExtensionMap: Record<string, string> = {
    python: '.py',
    javascript: '.js',
    java: '.java',
    c: '.c',
    'c++': '.cpp',
};

// Supported Docker images for each language
const dockerImageMap: Record<string, string> = {
    python: 'sandbox-python',
    javascript: 'sandbox-node',
    java: 'sandbox-java',
    c: 'sandbox-c',
    'c++': 'sandbox-cpp',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { language, code, input }: { language?: string; code?: string; input?: string } = req.body;

    if (!language || !code) {
        res.status(400).json({ message: 'Language and code are required.' });
        return;
    }

    const fileExtension = fileExtensionMap[language.toLowerCase()];
    if (!fileExtension) {
        res.status(400).json({ message: 'Unsupported language.' });
        return;
    }

    const dockerImage = dockerImageMap[language.toLowerCase()];
    if (!dockerImage) {
        res.status(400).json({ message: 'Unsupported language.' });
        return;
    }

    const tempDir = `/tmp/${uuidv4()}`;
    const fileName = `Main${fileExtension}`;
    const filePath = path.join(tempDir, fileName);

    try {
        // Create temporary directory and write the code to a file
        await fs.mkdir(tempDir, { recursive: true });
        await fs.writeFile(filePath, code);

        const dockerCommand = input
            ? `echo "${input}" | docker run --rm -i -v ${tempDir}:/usr/src/app ${dockerImage} ${fileName}`
            : `docker run --rm -v ${tempDir}:/usr/src/app ${dockerImage} ${fileName}`;

        console.log(`Docker command: ${dockerCommand}`);

        const { stdout, stderr } = await execWithTimeout(dockerCommand);

        if (stderr) {
            console.error('Docker stderr:', stderr);
            res.status(400).json({ output: null, errors: stderr });
            return;
        }

        res.status(200).json({ output: stdout || 'No output', errors: null });
    } catch (err: any) {
        console.error('Execution error:', err);
        if (err.message.includes('OCI runtime create failed')) {
            res.status(500).json({ message: 'Docker runtime error. Please check your container setup.', error: err.message });
            return;
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    } finally {
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
        }
    }
}
