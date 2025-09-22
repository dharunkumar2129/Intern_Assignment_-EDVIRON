# INTERN_ASSIGNMENT_-EDVIRON

<p align="center"><em>Empowering Future Innovators Through Seamless Learning Experiences</em></p>

---

<p align="center">
  <img src="https://img.shields.io/badge/last%20commit-today-brightgreen" alt="Last Commit" />
  <img src="https://img.shields.io/badge/javascript-98.9%25-yellow" alt="JavaScript" />
  <img src="https://img.shields.io/badge/languages-3-blue" alt="Languages" />
</p>

---

**INTERN_ASSIGNMENT_-EDVIRON - School Payment System**

A full-stack **MERN** (MongoDB, Express.js, React, Node.js) application designed as a comprehensive **School Payment System**. This portal provides distinct user roles so students can manage their details and pay fees while administrators monitor and filter transactions.

## ✨ Key Features

- **Role-Based Authentication**: Secure login & registration with separate views and permissions for Students and Admins.
- **Student Portal**: Students can update personal details (Student ID, Class, Section) and initiate fee payments.
- **Admin Dashboard**: Private admin dashboard to view all payment transactions and filter by status (Success, Pending, Failed).
- **Payment Gateway Integration**: Integrates with an external payment API to process transactions (test environment).
- **Secure API**: Endpoints protected using JSON Web Tokens (JWT) and passwords hashed with bcrypt.

## 🛠️ Built With

<p>
  <img src="https://img.shields.io/badge/Express-black?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/JSON-black?logo=json&logoColor=white" alt="JSON" />
  <img src="https://img.shields.io/badge/Markdown-000000?logo=markdown&logoColor=white" alt="Markdown" />
  <img src="https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white" alt="npm" />
  <img src="https://img.shields.io/badge/Mongoose-880000?logo=mongoose&logoColor=white" alt="Mongoose" />
  <img src="https://img.shields.io/badge/TOML-black" alt="TOML" />
  <img src="https://img.shields.io/badge/.ENV-yellowgreen" alt=".ENV" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Razorpay-02042B?logo=razorpay&logoColor=3395FF" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white" alt="ESLint" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white" alt="Axios" />
</p>

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT, bcrypt.js
- **API Communication:** Axios

---

## 🚀 Getting Started

Follow these steps to run a local copy of the project.

### Prerequisites

- Node.js (v16 or later recommended)
- npm (bundled with Node.js)
- MongoDB Atlas account (you can use a local MongoDB instance but Atlas is recommended for ease)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/dharunkumar2129/Intern_Assignment_-EDVIRON.git
```

2. **Navigate to the project directory**

```bash
cd Intern_Assignment_-EDVIRON
```

3. **Install backend dependencies**

Navigate to the backend folder (where `server.js` is) and run:

```bash
npm install
```

4. **Install frontend dependencies**

```bash
cd frontend/my-school-app
npm install
```

---

## Backend Configuration (.env)

Create a `.env` file in the backend root (next to `server.js`) and add the following (replace placeholders):

```env
# MongoDB Connection String
MONGO_URI=your_mongodb_connection_string

# JWT Secret for User Authentication
JWT_SECRET=your_super_secret_random_string

# Payment Gateway Credentials
SCHOOL_ID=65b0e6293e9f76a9694d84b4
PG_KEY=edvtest01
API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfsAdt0

# Frontend URL for callbacks
FRONTEND_URL=http://localhost:5173
```

> **Note:** Replace `MONGO_URI` and `JWT_SECRET` with secure values for production.

---

## Usage

You must run both backend and frontend servers in separate terminals.

1. **Run Backend Server** (from project root or backend folder):

```bash
node server.js
```

Server will run on `http://localhost:5000` (unless configured otherwise).

2. **Run Frontend** (from `frontend/my-school-app`):

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`.

---

## Test Credentials

**Admin Access**

- **Role:** Admin
- **Email:** `admin@school.com`
- **Password:** `SecureAdminPassword123!`

---

## ⚠️ Disclaimer

- **Payment Gateway:** The payment gateway used is a **test environment**. It may occasionally fail to return callback redirects (showing an "Internal Server Error") despite successful payment simulation. The backend marks such transactions as successful when appropriate.
- **Hosting:** If deployed on a free hosting tier, expect occasional cold starts and slower response times on the first request.

---

▲ [Back to Top](#intern_assignment_-edviron)

