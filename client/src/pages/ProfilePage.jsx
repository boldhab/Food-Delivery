import React from 'react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import authService from '../services/auth.service';

const ProfilePage = () => {
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
    });
    const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });

    const updateProfile = async (event) => {
        event.preventDefault();
        try {
            await authService.updateProfile({
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                address: {
                    street: profile.street,
                    city: profile.city,
                    state: profile.state,
                    zipCode: profile.zipCode,
                },
            });
            await refreshUser();
            toast.success('Profile updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update profile');
        }
    };

    const updatePassword = async (event) => {
        event.preventDefault();
        try {
            await authService.changePassword(password);
            setPassword({ currentPassword: '', newPassword: '' });
            toast.success('Password changed');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to change password');
        }
    };

    return (
        <div className="profile-page">
            <h1>Profile</h1>
            <div className="profile-grid">
                <form onSubmit={updateProfile} className="card-form">
                    <h2>Account details</h2>
                    <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
                    <input
                        type="email"
                        value={profile.email}
                        onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                        required
                    />
                    <input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} required />
                    <input value={profile.street} onChange={(event) => setProfile({ ...profile, street: event.target.value })} placeholder="Street" />
                    <input value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })} placeholder="City" />
                    <input value={profile.state} onChange={(event) => setProfile({ ...profile, state: event.target.value })} placeholder="State" />
                    <input value={profile.zipCode} onChange={(event) => setProfile({ ...profile, zipCode: event.target.value })} placeholder="ZIP Code" />
                    <button type="submit">Save profile</button>
                </form>

                <form onSubmit={updatePassword} className="card-form">
                    <h2>Change password</h2>
                    <input
                        type="password"
                        placeholder="Current password"
                        value={password.currentPassword}
                        onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="New password"
                        value={password.newPassword}
                        onChange={(event) => setPassword({ ...password, newPassword: event.target.value })}
                        minLength={6}
                        required
                    />
                    <button type="submit">Update password</button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
