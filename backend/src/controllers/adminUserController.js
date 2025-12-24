// File: backend/src/controllers/adminController.js

import { Query } from 'mongoose';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import e from 'express';


// GET /admin/users

export async function getAllUsers(req, res) {
    try {
        const {page = 1, limit = 10} = req.query;

        const parsePage = parseInt(page, 10);
        const parseLimit = parseInt(limit, 10);
        const skip = (parsePage - 1) * parseLimit;

        const [totalUsers, users] = await Promise.all([
            User.countDocuments(),
            User.find().skip(skip).limit(parseLimit),
            ]);
        
        const totalPages = Math.ceil(totalUsers / parseLimit);

        return res.json({
            users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: parsePage,
                pageSize: parseLimit
            }
        });


    } catch(err) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

//GET /search/users

export async function searchUsers(req, res) {
    try {
        const { q, page = 1, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({message: 'Missing search query.'});
        }

        const parsePage = parseInt(page, 10);
        const parseLimit = parseInt(limit, 10);
        const skip = (parsePage - 1) * parseLimit;

        const regex = new RegExp(q, 'i') //case insensitive
        
        const filter = {
            $or : [
                { firstname: regex },
                { lastname: regex },
                { email: regex },
            ]
        };
        const [totalUsers, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter).skip(skip).limit(parseLimit),
        ]);

        const totalPages = Math.ceil(totalUsers / parseLimit);

        return res.json({
            users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: parsePage,
                pageSize: parseLimit
            }
        });
    } catch(err) {
        res.status(500).json({ message: 'Error retrieving user.' });
        console.log(err)
    }
}

export async function editUser(req, res) {
    try{
        const {id} = req.params
        const {firstname, lastname, email}= req.body;

        const user = await User.findById(id);
        user.firstname = firstname;
        user.lastname = lastname;

        if (user.email !== email) {
            const verificationToken = jwt.sign(
                { userId: user._id },
                process.env.EMAIL_TOKEN_SECRET,
                { expiresIn: '1h' }
            );
            user.verificationToken = verificationToken;
            user.isVerified = false;
            const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
            const subject = 'Verify your email address';
            const text = `Hi ${user.firstname},\nYour email has recently been changed by an administrator. Please verify your email again: ${verificationLink}`;
            const html = `
                    <p>Hi ${user.firstname},</p>
                    <p>Your email has recently been changed by an administrator. Please verify your email again:</p>
                    <a href="${verificationLink}">Verify Email</a>`;
            
            await sendEmail(email, subject, text, html);  
        }
        user.email = email;
        await user.save();
        res.json({ message: 'Profile updated' });
    } catch(err){
        res.status(500).json({message: 'Error editing user information.'});
    }
}

export async function deleteUser(req, res){
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ message: 'User deleted successfully' });
        
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};