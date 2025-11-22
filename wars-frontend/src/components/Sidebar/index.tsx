import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getDashboardPath = () => {
    if (!user) return '/';
    const role = user.role.toLowerCase();
    // Map role to dashboard path
    const roleMap: Record<string, string> = {
      'admin': '/dashboard/admin',
      'technician': '/dashboard/technician',
      'responsible': '/dashboard/responsible',
      'customer': '/dashboard/customer',
      'wasac_manager': '/dashboard/wasac-manager',
      'wasac': '/dashboard/wasac-manager',
    };
    return roleMap[role] || '/dashboard/customer';
  };

  const menuItems = [
    { path: getDashboardPath(), label: 'Dashboard', icon: '📊' },
    { path: '/cases', label: 'Cases', icon: '📋' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  if (!isOpen) return null;

  return (
    <Nav className="flex-column bg-light p-3" style={{ minHeight: '100vh', width: '250px' }}>
      {menuItems.map((item) => (
        <Nav.Link
          key={item.path}
          as={Link}
          to={item.path}
          active={location.pathname === item.path}
          className="mb-2"
        >
          <span className="me-2">{item.icon}</span>
          {item.label}
        </Nav.Link>
      ))}
    </Nav>
  );
};

export default Sidebar;

