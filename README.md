# clinicbook-pro
ClinicBook Pro - Application Project

# Backend Setup
📖 Project Overview

This backend provides:

- **US-01:** User registration (create account to access the appointment system)  
- **US-02:** Secure login (access personal appointments)  
- **US-03:** Logout (keep account secure on shared devices)  
- **US-04:** Update user profile (keep account details accurate)  
- **US-05:** Admin user management (maintain system integrity)  

All endpoints are fully implemented, tested via Postman, and documented with **Swagger** for easy exploration.

---


## 🚀 How to Run the Backend Locally

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/victormreis/clinicbook-pro.git
cd clinicbook-pro


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

swagger-ui-express

swagger-jsdoc

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

npm run dev

If everything is correct, you should see:

Backend running on port 3000
Database connected successfully

# 🧪 Explore the API with Swagger

Swagger is available at: http://localhost:3000/api-docs

From here you can:

View all available endpoints

See request/response schemas

Test routes directly from the browser

Explore authentication, profile management, and admin features

No need to manually check each route; Swagger provides full API documentation dynamically.



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

