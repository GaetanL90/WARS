import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { getMenuItemsForRole } from '../../utils/menuConfig';

interface SidebarProps {
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const { role } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = getMenuItemsForRole(role);

  // Translation map for menu items
  const menuTranslations: Record<string, string> = {
    'Report Issue': t('menu.reportIssue'),
    'My Cases': t('menu.myCases'),
    'Assigned Cases': t('menu.assignedCases'),
    'Cases': t('menu.cases'),
    'Users': t('menu.users'),
    'Profile': t('menu.profile'),
    'Dashboard': t('common.dashboard'),
    'Sensor Monitoring': t('menu.sensorMonitoring'),
  };

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
          {menuTranslations[item.label] || item.label}
        </Nav.Link>
      ))}
    </Nav>
  );
};

export default Sidebar;

