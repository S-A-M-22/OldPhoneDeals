# 📦 OldPhoneDeals
A COMP5347/COMP4347 Group Project

_OldPhoneDeals is a full‑stack eCommerce web application built using the MERN stack (MongoDB, Express, React, Node.js). The platform allows users to browse, search, review, and purchase second‑hand mobile phones, while providing a dedicated admin interface for managing users, listings, reviews, and sales logs._


## 🚀 Features

### 👥 User Features
- Browse and search second‑hand phone listings.
- View detailed product information and reviews.
- Add items to cart and complete purchases.
- Manage profile, listings, and comments.
- Authentication with email verification and secure login.
---

### 👥Admin Features
- Access admin console via /admin route.
- Manage users, listings, and reviews.
- View sales logs and system activity.
- Moderate hidden comments and audit logs.
---

## 🛠 Tech Stack

### Backend
  - **Node.js** – Server runtime
  - **Express.js** – Backend framework
  - **MongoDB** – Database
  - **JWT** – Authentication and authorization

### Frontend
  - **React** – Frontend UI library
  - **Node.js** – Development/build tooling
  - **npm** – Package manager

## 📂 Project Structure

```
  project-root/
  │
  ├── backend/
  │ ├── .env.example
  │ └── ...
  │
  ├── frontend/
  │ ├── .env.example
  │ └── ...
  │
  └── README.md
```
---

# ⚙️ Setup Guide

## 1️⃣Edit backend/.env:

```
# MongoDB
MONGODB_URI=mongodb://localhost:27017/yourdbname

# JWT
JWT_SECRET=your_jwt_secret
PORT=5001

# Email
EMAIL_TOKEN_SECRET=your_email_token
SENDGRID_API_KEY=your_sendgrid_key
SENDER_EMAIL=your_email@example.com

# Misc
FRONTEND_URL=http://localhost:3000
```


## 2️⃣Seeding the Database
Run these commands in the backend folder after setting up mongodb:

```
cd backend
npm i
npm run seed
```

## 3️⃣Running the Backend

Run these commands in the backend folder:
```
cd backend
npm i
npm run dev
```

## 4️⃣Running the Frontend

Run this command in the frontend folder:
```
cd frontend
npm i
npm start
```

### 🧩 Important: Port Conflict (macOS)

Make sure to add the following to your `.env` files:

_In the backend directory:_
- `PORT=5001` (or your desired port)
- `FRONTEND_URL=` with your frontend url

_In the frontend directory:_
- `REACT_APP_API_PORT=5001` (should match the PORT in backend .env)

**Note:** _On macOS, port 5001 is often used by AirPlay Receiver. If you encounter port conflicts, try using a different port (like 5001, 5005, etc.) and make sure to update both .env files with the same port number. Chrome is reccomended._

---

## 🔑 Accessing Admin Features

To access the admin login page:
1. Navigate to `http://localhost:3000/admin` in your browser
2. Log in with your admin credentials
3. After successful login, you'll be redirected to the home page
4. Click the "Admin" button in the header to access the admin console

**Note:** _The admin login page is only accessible through the `/admin` URL. Regular users cannot access admin features through the standard login page._

---
#### 🌐 Local URLs

  - Frontend: http://localhost:3000
  - Backend API: http://localhost:5001
---

#### AI Acknowledgement 
We hereby declare and acknowledge the usage of artificial intelligence as assistance in the preparation of work for this assignment. All responsibility for architectural choices, code quality, and deliverable rests with the group.


_(This project was developed as part of the Web Application Development unit at the University of Sydney, demonstrating end‑to‑end design and implementation of a scalable three‑tier web application.)_

