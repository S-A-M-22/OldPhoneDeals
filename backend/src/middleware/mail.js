// File: backend/src/middleware/mail.js

import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv';
dotenv.config();


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to, subject, text, html) {
  const msg = {
    to,
    from: process.env.SENDER_EMAIL,
    subject,
    text,
    html,
  };

  try {
    const response = await sgMail.send(msg);
    console.log('Email sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}