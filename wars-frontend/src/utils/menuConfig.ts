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
      label: 'Dashboard',
      icon: '🏠',
    },
    {
      path: '/cases/admin',
      label: 'Cases',
      icon: '📋',
    },
    {
      path: '/sensors',
      label: 'Sensor Monitoring',
      icon: '📡',
    },
    {
      path: '/users',
      label: 'Users',
      icon: '👥',
    },
  ],
  technician: [
    {
      path: '/cases/assigned',
      label: 'Assigned Cases',
      icon: '✅',
    },
    {
      path: '/sensors',
      label: 'Sensor Monitoring',
      icon: '📡',
    },
  ],
  customer: [
    {
      path: '/cases/new',
      label: 'Report Issue',
      icon: '➕',
    },
    {
      path: '/cases',
      label: 'My Cases',
      icon: '📋',
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
      path: '/sensors',
      label: 'Sensor Monitoring',
      icon: '📡',
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
      path: '/sensors',
      label: 'Sensor Monitoring',
      icon: '📡',
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

  // For customers and technicians, replace Profile with Dashboard
  if (normalizedRole === 'customer') {
    const customerCommonItems: MenuItem[] = [
      {
        path: '/dashboard/customer',
        label: 'Dashboard',
        icon: '🏠',
      },
    ];
    return [...customerCommonItems, ...roleSpecificItems];
  }

  if (normalizedRole === 'technician') {
    const technicianCommonItems: MenuItem[] = [
      {
        path: '/dashboard/technician',
        label: 'Dashboard',
        icon: '🏠',
      },
    ];
    return [...technicianCommonItems, ...roleSpecificItems];
  }

  // For other roles, combine common items with role-specific items
  return [...commonMenuItems, ...roleSpecificItems];
};

export default {
  commonMenuItems,
  roleMenuItems,
  getMenuItemsForRole,
};

