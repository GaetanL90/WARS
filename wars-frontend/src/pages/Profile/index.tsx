import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Profile</h1>
      {user ? (
        <div>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      ) : (
        <p>Please log in to view your profile</p>
      )}
    </div>
  );
};

export default Profile;

