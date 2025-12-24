OldPhoneDeals Setup Instructions
A COMP5347/COMP4347 Group Project

OldPhoneDeals is a full‑stack eCommerce web application built using the MERN stack (MongoDB, Express, React, Node.js). The platform allows users to browse, search, review, and purchase second‑hand mobile phones, while providing a dedicated admin interface for managing users, listings, reviews, and sales logs.

Seeding the Database
Run these commands in the backend folder after setting up mongodb:

cd backend
npm i
npm run seed
Running the Backend
Run these commands in the backend folder:

cd backend
npm i
npm run dev
Running the Frontend
Run this command in the frontend folder:

cd frontend
npm i
npm start
Important
Make sure to add the following to your .env files:

In the backend directory:

PORT=5001 (or your desired port)
FRONTEND_URL= with your frontend url
In the frontend directory:

REACT_APP_API_PORT=5001 (should match the PORT in backend .env)
Note: On macOS, port 5001 is often used by AirPlay Receiver. If you encounter port conflicts, try using a different port (like 5001, 5005, etc.) and make sure to update both .env files with the same port number. Chrome is reccomended.

Accessing Admin Features
To access the admin login page:

Navigate to http://localhost:3000/admin in your browser
Log in with your admin credentials
After successful login, you'll be redirected to the home page
Click the "Admin" button in the header to access the admin console
Note: The admin login page is only accessible through the /admin URL. Regular users cannot access admin features through the standard login page.

AI Acknowledgement
We hereby declare and acknowledge the usage of artificial intelligence as assistance in the preparation of work for this assignment. All responsibility for architectural choices, code quality, and deliverable rests with the group.

(This project was developed as part of the Web Application Development unit at the University of Sydney, demonstrating end‑to‑end design and implementation of a scalable three‑tier web application.)

