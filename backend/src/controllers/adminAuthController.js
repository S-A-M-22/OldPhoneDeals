import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function login(req, res) {
    const {email, password} = req.body;
    try{
        const existingUser = await User.findOne({email});

        if (!existingUser) {
            return res.status(400).json({message: 'Invalid email or password.'});
        }

        if (existingUser.role !== 'admin') {
            return res.status(403).json({message: "Account is not an administrator."})
        }

        const passMatch = await bcrypt.compare(password, existingUser.password)
        if (!passMatch) {
            return res.status(400).json({message: 'Invalid email or password.'});
        }

        existingUser.lastLogin = new Date();
        existingUser.save();

        //frontend to store token in HttpOnly cookies
        const jwtToken = jwt.sign( 
            {userId: existingUser._id, email: existingUser.email, role: existingUser.role}, 
            process.env.JWT_SECRET, 
            {expiresIn: '1h'}
        );

        res.cookie('token', jwtToken, {
            httpOnly: true, //no js
            secure: false, //dev
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        })

        res.status(200).json({
            message: 'Login succesful.',
            user: {
                id: existingUser._id,
                firstname: existingUser.firstname,
                lastname: existingUser.lastname,
                role: existingUser.role
            }
        });

    } catch(error) {
        return res.status(400).json({ message: 'Login error.' });
    }
}
