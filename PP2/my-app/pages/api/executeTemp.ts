import { exec } from 'child_process';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@lib/prisma'; // Assuming Prisma is set up to access the database

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { templateId, input }: { templateId?: number; input?: string } = req.body;

    // Validate input data
    if (!templateId) {
        res.status(400).json({ message: 'Template ID is required.' });
        return;
    }

    try {
        // Fetch the code template from the database
        const template = await prisma.codeTemplate.findUnique({
            where: { id: templateId },
            select: { code: true, language: true },
        });

        if (!template) {
            res.status(404).json({ message: 'Code template not found.' });
            return;
        }

        const { code, language } = template;

        // Get the system's temporary directory
        const tempDir = os.tmpdir();
        const fileId = uuidv4();
        const filePath = path.join(tempDir, fileId);

        let fileExtension: string | undefined;
        let compileCommand: string | undefined;
        let runCommand: string;

        // Prepare commands for different languages
        switch (language.toLowerCase()) {
            case 'c':
                fileExtension = '.c';
                await fs.writeFile(filePath + fileExtension, code);
                compileCommand = `gcc ${filePath}.c -o ${filePath}.out`;
                runCommand = `${filePath}.out`;
                break;
            case 'c++':
                fileExtension = '.cpp';
                await fs.writeFile(filePath + fileExtension, code);
                compileCommand = `g++ ${filePath}.cpp -o ${filePath}.out`;
                runCommand = `${filePath}.out`;
                break;
            case 'java':
                fileExtension = '.java';
                const javaFilePath = path.join(tempDir, 'Main.java');
                await fs.writeFile(javaFilePath, code);
                compileCommand = `javac ${javaFilePath}`;
                runCommand = `java -cp ${tempDir} Main`;
                break;
            case 'python':
                fileExtension = '.py';
                await fs.writeFile(filePath + fileExtension, code);
                try {
                    await execAsync('python3 --version');
                    runCommand = `python3 ${filePath}.py`;
                } catch {
                    await execAsync('python --version');
                    runCommand = `python ${filePath}.py`;
                }
                break;
            case 'javascript':
                fileExtension = '.js';
                await fs.writeFile(filePath + fileExtension, code);
                runCommand = `node ${filePath}.js`;
                break;
            default:
                res.status(400).json({ message: 'Unsupported language.' });
                return;
        }

        // Compile if needed
        if (compileCommand) {
            await execAsync(compileCommand);
        }

        // Run the program
        const process = spawn(runCommand, { shell: true });

        if (input) {
            process.stdin.write(input);
            process.stdin.end();
        }

        let output = '';
        let error = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            error += data.toString();
        });

        process.on('close', (code) => {
            if (code !== 0) {
                res.status(400).json({ output: null, errors: error || 'Execution failed.' });
                return;
            }
            res.status(200).json({ output: output || 'No output', errors: null });
        });

        process.on('error', (err) => {
            res.status(500).json({ output: null, errors: 'Process execution error.' });
        });
    } catch (err: any) {
        console.error('Execution error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}
