// File: backend/src/controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {sendEmail} from '../middleware/mail.js';

//POST /auth/signup
export async function signup(req, res) {
    const {firstname, lastname, email, password} = req.body;

    try {
        const existingUser = await User.findOne({email});

        if (existingUser) {
            return res.status(400).json({message: 'User already exists.'});
        }

        const hashed = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            firstname,
            lastname,
            email,
            password: hashed,
            isVerified: false,
          });
          
        //token for email verification, sent with the link
        const verificationToken = jwt.sign(
            { userId: newUser._id },            // Payload
            process.env.EMAIL_TOKEN_SECRET,    // Secret key
            { expiresIn: '1h' }                 // Token expires in 1 hour
        );

        newUser.verificationToken = verificationToken;
        newUser.registrationDate = new Date();
        await newUser.save()

        //send verif email, set base url in env
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const subject = 'Verify your email address';
        const text = `Hi ${firstname},\nThank you for signing up to OldPhoneDeals. Please verify your email: ${verificationLink}`;
        const html = `
                <p>Hi ${firstname},</p>
                <p>Thank you for signing up to OldPhoneDeals. Before you can use our services, please click the link below to verify your email address:</p>
                <a href="${verificationLink}">Verify Email</a>`;

        try {
            await sendEmail(email, subject, text, html);              
        
            res.status(201).json({ message: 'Signup successful. Please verify your email.' });
        } catch (error) {
            res.status(500).json({ message: 'Error sending verification email' });
        }


    }  catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Signup failed' });
      }
};


//GET auth/verify-email/?token=...
export async function verifyEmail(req, res) {
    const {token} = req.query;

    try {
        const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);

        const target = await User.findById(decoded.userId);
        if (!target) {
            return res.status(400).json({message: 'User not found in system.'})        
        }

        if (target.isVerified) {
            return res.status(200).json({message: 'User is already verified.'})
        }

        target.isVerified = true;
        await target.save();

        res.status(200).json({message: 'User has been verified successfully.'})

    } catch(error) {
        if (error.name == 'TokenExpiredError') {
            return res.status(400).json({ message: 'Verification link has expired' });
        } else {
            console.error(error);
            return res.status(400).json({ message: 'Invalid or malformed token' });
          }
    }
}
  

//POST /auth/login
export async function login(req, res) {
    const {email, password} = req.body;
    try{
        const existingUser = await User.findOne({email});

        if (!existingUser) {
            return res.status(400).json({message: 'Invalid email or password.'});
        }

        if (!existingUser.isVerified) {
            return res.status(400).json({message: 'Please verify your account before logging in.'});
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
            path: '/',
            maxAge: 60 * 60 * 1000
        })

        res.status(200).json({
            message: 'Login succesful.',
            user: {
                id: existingUser._id,
                firstname: existingUser.firstname,
                lastname: existingUser.lastname
            }
        });

    } catch(error) {
        return res.status(400).json({ message: 'Login error.' });
    }
}

//POST /auth/reset-password
export async function sendResetEmail(req, res) {
    const {email} = req.body;
    try {
        const existingUser = await User.findOne({email});

        if (!existingUser) {
            return res.status(400).json({message: 'User with provided email does not exist.'});
        }
        if (!existingUser.isVerified) {
            return res.status(400).json({message: 'Please verify your account before resetting your password.'});
        }

        const verificationToken = jwt.sign(
            { userId: existingUser._id },            // Payload
            process.env.EMAIL_TOKEN_SECRET,    // Secret key
            { expiresIn: '1h' }                 // Token expires in 1 hour
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password-confirm.html?token=${verificationToken}`;
        const subject = 'Reset your password';
        const text = `Hi ${existingUser.firstname},\nYou requested a password reset. Click the link to reset your password: ${resetLink}`;
        const html = `
            <p>Hi ${existingUser.firstname},</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetLink}">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>`;

        try {
            await sendEmail(email, subject, text, html);
            res.status(200).json({ message: 'Password reset link sent.' });
        } catch (error) {
            res.status(500).json({ message: 'Error sending reset email' });
        }

    } catch(error) {
        return res.status(400).json({ message: 'Reset password error.' });
    }
}

//GET auth/reset-password/:token
export async function resetPassword(req, res) {
    const {token} = req.params;
    const {newpassword, oldpassword} = req.body;
    try {
        const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);

        const target = await User.findById(decoded.userId);
        if (!target) {
            return res.status(400).json({message: 'User not found in system.'})        
        }

        const newHashedPassword = await bcrypt.hash(newpassword, 10);
        target.password = newHashedPassword;
        await target.save();

        res.status(200).json({ message: 'Password successfully updated.' });

    } catch (err) {
        console.error('Error resetting password:', err);

        if (err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset token has expired.' });
        }

        res.status(500).json({ message: 'Server error during password reset.' });
    }
}
