# clinicbook-pro
ClinicBook Pro - Application Project

# Backend Setup
📖 Project Overview

This backend provides:

User Registration (US-01)

Secure Login with JWT Authentication (US-02)

Role-based user system (user / admin)

MySQL database integration

Password hashing using bcrypt

# 🚀 How to Run the Backend Locally

Follow the steps below carefully.

1️⃣ Clone the Repository <br>
git clone https://github.com/victormreis/clinicbook-pro.git
<br>
cd clinicbook-pro

<br> 

2️⃣ Navigate to the Backend Folder 

cd backend

3️⃣ Install Dependencies


npm install or npm i

This will install:

express

sequelize

mysql2

bcrypt

jsonwebtoken

dotenv

4️⃣ Create Environment Variables File

.env

Inside the backend folder.

You can copy from the example file:

cp .env.example .env

5️⃣ Configure Your .env File

Open .env and fill with your local MySQL credentials:

PORT=3000

DB_HOST=localhost

DB_USER=root

DB_PASSWORD=your_mysql_password

DB_NAME=your_database_name

JWT_SECRET=your_super_secret_key

JWT_EXPIRES_IN=1h

# ⚠️ Important:

Do NOT commit .env ( make sure to add .env on your .gitignore file if you are commiting any changes)

Make sure MySQL is running locally

Database must already exist

6️⃣ Create the Database (If Not Created Yet)

Open MySQL Workbench and run:

CREATE DATABASE your_database_name;

Make sure the name matches DB_NAME in .env.

7️⃣ Run the Server

npm start

If everything is correct, you should see:

Backend running on port 3000
Database connected successfully

🧪 API Endpoints
🔹 Register User

POST

http://localhost:3000/api/users/register

Body (JSON):

{
  "name": "John Doe",
  "email": "john@test.com",
  "password": "123456"
}


🔹 Login

POST

http://localhost:3000/api/auth/login

Body (JSON):

{

  "email": "john@test.com",
  
  "password": "123456"
  
}

Response:

{

  "message": "Login successful",
  
  "token": "JWT_TOKEN_HERE"
  
}

Role System

All users are created as user by default.

Admin users must be created manually in the database.

Only admins will be able to manage roles in future features.

📂 Project Structure (Backend)

backend/


├── controllers/

├── models/

├── routes/

├── config/

├── app.js

├── server.js

├── package.json

├── .env

├── .env.example


⚠️ Common Issues
Database connection error

Check if MySQL is running

Check credentials in .env

Confirm database exists

JWT error

Make sure JWT_SECRET is set

Restart server after changing .env

Port already in use

Change PORT in .env

🛑 Security Notes

.env must never be committed

Use strong JWT_SECRET in production

Production environment variables must be configured in hosting platform

✅ Requirements

Node.js (v18 recommended)

MySQL installed locally

MySQL Workbench (optional but recommended)

When the frontend is implemented, this README will be updated to include full-stack integration instructions.

