# Food Delivery - Customer Application

A beautiful, responsive, and feature-rich front-end application for the Food Delivery platform. This customer-facing application provides a seamless experience for discovering restaurants, browsing menus, placing orders, and tracking deliveries in real-time.

## ✨ Features

- 🍔 **Menu Discovery**: Browse a wide variety of food items with smart search and category filtering.
- 🛒 **Cart & Checkout**: Intuitive cart management and a smooth, multi-step checkout process.
- 💳 **Secure Payments**: Integrated with Stripe for safe and reliable transaction processing.
- 📍 **Real-time Tracking**: Monitor order status from preparation to delivery.
- 👤 **User Profiles**: Manage personal information, saved addresses, and order history.
- 🎁 **Promotions**: Support for discount codes and promotional banners on the homepage.
- 📱 **Responsive Design**: Flawless experience across desktop, tablet, and mobile devices.
- 🎨 **Modern UI**: Built with Tailwind CSS 4 and enhanced with Framer Motion animations.

## 🛠️ Tech Stack

- **Core**: React 18
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit & React Context
- **Routing**: React Router 7
- **Data Fetching**: Axios
- **Form Handling**: React Hook Form
- **Payments**: Stripe React Elements
- **Animations**: Framer Motion
- **SEO Elements**: React Helmet Async
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Stripe account (for processing payments during development)

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the `client` directory.
   - Add your Stripe public key and API base URL.
    ```env
    VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
    VITE_API_URL=http://localhost:5000/api
    ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Directory Structure

- `src/app`: Redux store configuration.
- `src/components`: Reusable UI components organized by feature (auth, cart, checkout, menu, etc.).
- `src/context`: React Context providers (e.g., Theme Context).
- `src/hooks`: Custom React hooks for shared logic.
- `src/pages`: Top-level page components (HomePage, MenuPage, CheckoutPage, etc.).
- `src/routes`: Application routing configuration.
- `src/services`: API communication layer using Axios.
- `src/utils`: Helper functions and utilities.

## 📄 License

This project is private and for internal use only.
