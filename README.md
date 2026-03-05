# Food Delivery Platform

A robust, full-stack food ordering and delivery ecosystem built with the MERN stack (MongoDB, Express, React, Node.js). This platform consists of four distinct applications working together to provide a seamless experience for customers, restaurant admins, and delivery drivers.

## 🌟 Ecosystem Overview

The platform is divided into four main directories:

1. **[📱 Client Application](./client)**: The customer-facing frontend where users can browse menus, place orders, track deliveries, and manage their profiles.
2. **[👨‍💼 Admin Dashboard](./admin)**: The administrative interface for managing the food catalog, monitoring orders, managing users, and overseeing business performance.
3. **[🚚 Driver Application](./Driver)**: A dedicated mobile-responsive app for delivery personnel to view available orders and manage active deliveries.
4. **[⚙️ Backend API Server](./server)**: The core REST API that serves data to all frontend applications, handles authentication, processes Stripe payments, and interacts with the MongoDB database.

## 🚀 Key Features

- **Comprehensive User Roles**: Distinct experiences tailored for Customers, Admins, and Drivers.
- **Real-Time Data**: Live order tracking and availability updates.
- **Secure Transactions**: Integrated with Stripe for safe processing of customer payments.
- **Modern UI**: Interfaces built with React 18, Vite, and Tailwind CSS 4 for performance and aesthetics.
- **Scalable Backend**: An Express.js server connected to MongoDB, featuring robust routing, middleware, and data validation.

## 🛠️ Global Tech Stack

- **Frontend**: React 18, Vite 7, Tailwind CSS 4, React Router 7, Redux Toolkit, Framer Motion
- **Backend**: Node.js, Express 5.x, Mongoose (MongoDB)
- **Authentication**: Custom JWT (JSON Web Tokens) implementation
- **Payments**: Stripe Integrations
- **Styling**: Tailwind CSS & standard CSS modules

## 🏁 Getting Started

To run the entire ecosystem locally, you will need to set up and start each component individually. 

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (local or Atlas)
- Stripe Account (for payment processing keys)

### Installation & Setup

1. **Clone the repository** (if applicable).
2. **Setup the Server**:
   ```bash
   cd server
   npm install
   # Create a .env file with your MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY, etc.
   npm run dev
   ```
3. **Setup the Admin Dashboard**:
   ```bash
   cd admin
   npm install
   npm run dev
   ```
4. **Setup the Client Application**:
   ```bash
   cd client
   npm install
   # Create a .env file with VITE_STRIPE_PUBLIC_KEY and VITE_API_URL
   npm run dev
   ```
5. **Setup the Driver Application**:
   ```bash
   cd Driver
   npm install
   # Create a .env file with VITE_API_URL
   npm run dev
   ```

> **Note**: For detailed instructions on each specific application, please refer to their individual `README.md` files located in their respective directories.

## 📄 License

This project is private and for internal use only.
