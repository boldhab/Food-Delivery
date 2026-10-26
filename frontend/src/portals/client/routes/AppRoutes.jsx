import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import MenuPage from '../pages/MenuPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import ProfilePage from '../pages/ProfilePage';
import FoodDetailPage from '../pages/FoodDetailPage';
import TrackOrderPage from '../pages/TrackOrderPage';
import FavoritesPage from '../pages/FavoritesPage';
import AboutPage from '../pages/AboutPage';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
                path="/favorites"
                element={
                    <ProtectedRoute>
                        <FavoritesPage />
                    </ProtectedRoute>
                }
            />
            <Route path="/food/:id" element={<FoodDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route
                path="/checkout"
                element={
                    <ProtectedRoute>
                        <CheckoutPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payment-success"
                element={
                    <ProtectedRoute>
                        <PaymentSuccessPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/orders"
                element={
                    <ProtectedRoute>
                        <OrdersPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/orders/track/:id"
                element={
                    <ProtectedRoute>
                        <TrackOrderPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/forgot-password"
                element={
                    <PublicRoute>
                        <ForgotPasswordPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/reset-password"
                element={
                    <PublicRoute>
                        <ResetPasswordPage />
                    </PublicRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
