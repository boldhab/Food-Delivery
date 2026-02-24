import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const { cart } = useCart();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="brand">
                    FoodDash
                </Link>

                <div className="nav-links">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/menu">Menu</NavLink>
                    {isAuthenticated ? <NavLink to="/orders">Orders</NavLink> : null}
                </div>

                <div className="nav-actions">
                    {isAuthenticated ? (
                        <>
                            <NavLink to="/cart" className="cart-link">
                                <FiShoppingCart />
                                <span>Cart</span>
                                <b>{cart.totalItems || 0}</b>
                            </NavLink>
                            <NavLink to="/profile">{user?.name || 'Profile'}</NavLink>
                            <button className="link-button" type="button" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login">Login</NavLink>
                            <NavLink to="/register">Register</NavLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
