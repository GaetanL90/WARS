/**
 * Menu Configuration
 * Centralized menu items based on user roles
 */

export interface MenuItem {
  path: string;
  label: string;
  icon: string;
  roles?: string[]; // If undefined, available to all roles
}

// Common menu items available to all roles
const commonMenuItems: MenuItem[] = [
  {
    path: '/profile',
    label: 'Profile',
    icon: '👤',
  },
];

// Role-specific menu items
const roleMenuItems: Record<string, MenuItem[]> = {
  admin: [
    {
      path: '/dashboard/admin',
      label: 'Admin Dashboard',
      icon: '🏠',
    },
    {
      path: '/cases',
      label: 'All Cases',
      icon: '📋',
    },
    {
      path: '/users',
      label: 'User Management',
      icon: '👥',
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: '📈',
    },
    {
      path: '/settings',
      label: 'System Settings',
      icon: '⚙️',
    },
  ],
  technician: [
    {
      path: '/dashboard/technician',
      label: 'My Dashboard',
      icon: '🏠',
    },
    {
      path: '/cases',
      label: 'My Cases',
      icon: '📋',
    },
    {
      path: '/cases/assigned',
      label: 'Assigned Cases',
      icon: '✅',
    },
    {
      path: '/reports',
      label: 'My Reports',
      icon: '📈',
    },
  ],
  customer: [
    {
      path: '/dashboard/customer',
      label: 'My Dashboard',
      icon: '🏠',
    },
    {
      path: '/cases',
      label: 'My Cases',
      icon: '📋',
    },
    {
      path: '/cases/new',
      label: 'Report Issue',
      icon: '➕',
    },
    {
      path: '/reports',
      label: 'My Reports',
      icon: '📈',
    },
  ],
  responsible: [
    {
      path: '/dashboard/responsible',
      label: 'My Dashboard',
      icon: '🏠',
    },
    {
      path: '/cases',
      label: 'My Cases',
      icon: '📋',
    },
    {
      path: '/cases/pending',
      label: 'Pending Cases',
      icon: '⏳',
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: '📈',
    },
  ],
  wasac_manager: [
    {
      path: '/dashboard/wasac-manager',
      label: 'Manager Dashboard',
      icon: '🏠',
    },
    {
      path: '/cases',
      label: 'All Cases',
      icon: '📋',
    },
    {
      path: '/cases/pending-review',
      label: 'Pending Review',
      icon: '🔍',
    },
    {
      path: '/reports',
      label: 'Analytics',
      icon: '📈',
    },
    {
      path: '/approvals',
      label: 'Approvals',
      icon: '✅',
    },
  ],
  wasac: [
    {
      path: '/dashboard/wasac-manager',
      label: 'Manager Dashboard',
      icon: '🏠',
    },
    {
      path: '/cases',
      label: 'All Cases',
      icon: '📋',
    },
    {
      path: '/cases/pending-review',
      label: 'Pending Review',
      icon: '🔍',
    },
    {
      path: '/reports',
      label: 'Analytics',
      icon: '📈',
    },
    {
      path: '/approvals',
      label: 'Approvals',
      icon: '✅',
    },
  ],
};

/**
 * Get menu items for a specific role
 */
export const getMenuItemsForRole = (role: string | null): MenuItem[] => {
  if (!role) return commonMenuItems;

  const normalizedRole = role.toLowerCase().replace('_', '');
  const roleSpecificItems = roleMenuItems[normalizedRole] || roleMenuItems[role.toLowerCase()] || [];

  // Combine common items with role-specific items
  return [...commonMenuItems, ...roleSpecificItems];
};

export default {
  commonMenuItems,
  roleMenuItems,
  getMenuItemsForRole,
};

