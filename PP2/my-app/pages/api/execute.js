import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

const execWithTimeout = (cmd, timeout = 10000) => {
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

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { language, code, input } = req.body;

    if (!language || !code) {
        return res.status(400).json({ message: 'Language and code are required.' });
    }

    const tempDir = `/tmp/${uuidv4()}`;
    const fileExtensionMap = {
        python: '.py',
        javascript: '.js',
        java: '.java',
        c: '.c',
        'c++': '.cpp',
    };
    const fileExtension = fileExtensionMap[language.toLowerCase()];

    if (!fileExtension) {
        return res.status(400).json({ message: 'Unsupported language.' });
    }

    const fileName = `Main${fileExtension}`;
    const filePath = path.join(tempDir, fileName);

    try {
        // Create temporary directory and write code
        await fs.mkdir(tempDir, { recursive: true });
        await fs.writeFile(filePath, code);

        const dockerImageMap = {
            python: 'sandbox-python',
            javascript: 'sandbox-node',
            java: 'sandbox-java',
            c: 'sandbox-c',
            'c++': 'sandbox-cpp',
        };

        const dockerImage = dockerImageMap[language.toLowerCase()];
        if (!dockerImage) {
            return res.status(400).json({ message: 'Unsupported language.' });
        }

        const dockerCommand = input
            ? `echo "${input}" | docker run --rm -i -v ${tempDir}:/usr/src/app ${dockerImage} ${fileName}`
            : `docker run --rm -v ${tempDir}:/usr/src/app ${dockerImage} ${fileName}`;

        console.log(`Docker command: ${dockerCommand}`);

        const { stdout, stderr } = await execWithTimeout(dockerCommand);

        if (stderr) {
            console.error('Docker stderr:', stderr);
            return res.status(400).json({ output: null, errors: stderr });
        }

        return res.status(200).json({ output: stdout || 'No output', errors: null });
    } catch (err) {
        console.error('Execution error:', err);
        if (err.message.includes('OCI runtime create failed')) {
            return res.status(500).json({ message: 'Docker runtime error. Please check your container setup.', error: err.message });
        }
        return res.status(500).json({ message: 'Server error', error: err.message });
    } finally {
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
        }
    }
}
