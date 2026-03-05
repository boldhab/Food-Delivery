# Food Delivery - Driver Application

The dedicated application for delivery drivers on the Food Delivery platform. This application allows drivers to see available orders, manage their current deliveries, and view their delivery history. Built with performance and mobile responsiveness in mind.

## ✨ Features

- 📋 **Available Orders**: Real-time feed of orders waiting to be picked up.
- 🚚 **My Deliveries**: Manage and track active deliveries with status updates (e.g., "Picked Up", "Delivered").
- 📍 **Delivery Details**: View comprehensive order information, including pickup and drop-off locations, and customer instructions.
- 📜 **Delivery History**: Review past completed deliveries.
- 📱 **Mobile-First Design**: Optimized for use on the go, ensuring drivers can easily navigate the app while working.

## 🛠️ Tech Stack

- **Core**: React 18
- **Build Tool**: Vite 7
- **Styling**: Standard CSS Modules and global styles
- **Routing**: React Router 7
- **Data Fetching**: Axios
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the driver directory:
   ```bash
   cd Driver
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the `Driver` directory.
   - Configure the base API URL to point to the local server.
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Directory Structure

- `src/components`: Shared UI elements and layout components.
- `src/context`: React Context providers for managing global state (like driver authentication).
- `src/pages`: Main application views (e.g., Available Orders, My Deliveries, Delivery Details, Delivery History).
- `src/routes`: Application routing configuration.
- `src/services`: API communication logic using Axios for interacting with the backend server.

## 📄 License

This project is private and for internal use only.
