import bcrypt from 'bcrypt';
import prisma from '../../../lib/prisma';

export default async function signUp(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    
    const { email, password, firstName, lastName, avatar, phone } = req.body;

    // check required fields (email, password, firstName, lastName)
    if (!email || !password || !firstName || !lastName) {
        console.log('Missing fields:', { email, password, firstName, lastName });
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10); // chatGPT 

        // avatar would be an image URL
        const user = await prisma.user.create({
            data: {
              email,
              password: passwordHash,
              firstName,
              lastName,
              avatar,
              phone,
            },
        });
        console.log('Created user:', user);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: 'An error occurred.'});
    } 
}

