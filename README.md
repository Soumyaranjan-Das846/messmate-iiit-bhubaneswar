# 🍽️ MessMate – IIIT Bhubaneswar

### A Full-Stack Mess Management System

MessMate is a full-stack web application developed for IIIT Bhubaneswar to simplify and digitize daily mess operations. It provides dedicated Admin and Student portals for managing students, meals, payments, expenses, menus, and communication through a centralized platform.

## 🌐 Live Application

**Frontend:** https://messmate-frontend-xi.vercel.app

**Backend API:** https://messmate-iiit-bhubaneswar.onrender.com

> Note: The backend is hosted on Render's free tier, so the first request may take some time if the server has been inactive.

## ✨ Key Features

### 👨‍💼 Admin Portal

- Secure administrator registration and login
- Dashboard with mess-related statistics
- Student management
- Payment and collection tracking
- Expense management
- Meal management
- Mess menu management
- Financial reports and summaries
- Student feedback and communication

### 🎓 Student Portal

- Student registration and secure login
- Personalized student dashboard
- View mess menu and meal information
- View payment-related information
- Submit feedback
- Contact administrators

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT, bcryptjs |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Version Control | Git, GitHub |

## 🏗️ System Architecture

```text
Admin / Student
      |
      v
React + Vite Frontend
      |
      | REST API Requests
      v
Node.js + Express Backend
      |
      | Authentication & Business Logic
      v
MongoDB Atlas Database
```

The frontend communicates with the backend through REST APIs. The backend handles authentication, authorization, business logic, and database operations.

## 🔐 Authentication and Authorization

MessMate supports role-based access control for administrators and students.

- Passwords are securely hashed using bcryptjs.
- JWT is used for authenticated sessions.
- Administrator registration requires a server-side registration code.
- Protected backend routes restrict access according to user roles.

## 🚀 Running the Project Locally

### Prerequisites

- Node.js and npm
- MongoDB Atlas database
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

### 2. Backend Setup

Install backend dependencies:

```bash
npm install
```

Create a `.env` file and configure the required environment variables:

```env
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_REGISTRATION_CODE=your_admin_registration_code
PORT=3000
```

Start the backend using the start script configured in `package.json`.

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## ☁️ Deployment

- **Frontend:** Deployed using Vercel
- **Backend:** Deployed using Render
- **Database:** Hosted on MongoDB Atlas

Environment variables are configured securely on the respective hosting platforms.

## 🧪 Project Demonstration

The application includes separate Admin and Student interfaces to demonstrate role-specific functionality.

Demo login credentials can be provided separately to the project evaluator.

## 🎯 Project Objective

The primary objective of MessMate is to reduce manual mess administration, improve transparency in financial records, simplify meal and menu management, and provide an accessible digital platform for students and administrators.

## 👨‍💻 Developer

**Soumyaranjan Das**

B.Tech – Information Technology

International Institute of Information Technology, Bhubaneswar

## 📚 Academic Project

Developed as part of an academic laboratory project at IIIT Bhubaneswar.
