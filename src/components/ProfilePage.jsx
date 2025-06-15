import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setNewDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!currentUser) {
      setError("No user is currently signed in.");
      return;
    }
    // Prevent unnecessary updates if the name hasn't changed
    if (newDisplayName === (currentUser.displayName || '')) {
      setMessage("Display name is already up to date or has not been changed.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(currentUser, {
        displayName: newDisplayName
      });
      setDisplayName(newDisplayName); // Update local state to reflect change immediately
      setMessage('Profile updated successfully! The changes will be reflected across the app shortly.');
      // onAuthStateChanged in App.jsx will eventually pick up this change.
    } catch (err) {
      console.error("Error updating profile: ", err);
      setError('Failed to update profile. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <p>Loading user profile or no user signed in...</p>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleProfileUpdate} className="profile-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            readOnly
          />
        </div>
        <div className="form-group">
          <label htmlFor="displayName">Display Name:</label>
          <input
            type="text"
            id="displayName"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            placeholder="Enter your display name"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Display Name'}
        </button>
      </form>
    </div>
  );
}
