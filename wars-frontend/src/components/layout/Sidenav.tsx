import React, { useState, useEffect } from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMenuItemsForRole } from '../../utils/menuConfig';

interface SidenavProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const Sidenav: React.FC<SidenavProps> = ({ isCollapsed = false, onToggle }) => {
  const { role } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 992);

  // Handle window resize with debouncing
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        setIsMobile(width < 768);
        setIsTablet(width >= 768 && width < 992);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Responsive navbar height - match Navbar component
  const navbarHeight = isMobile ? 100 : 110;

  // Get menu items based on role
  const menuItems = getMenuItemsForRole(role);

  // Auto-collapse on mobile/tablet after navigation
  const handleLinkClick = () => {
    if ((isMobile || isTablet) && onToggle) {
      // Small delay to allow navigation to complete
      setTimeout(() => {
        onToggle?.();
      }, 150);
    }
  };

  // Responsive sidenav width
  const sidenavWidth = (isMobile || isTablet) 
    ? '280px' 
    : (isCollapsed ? '80px' : '250px');

  return (
    <div
      style={{
        width: sidenavWidth,
        minHeight: `calc(100vh - ${navbarHeight}px)`,
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'sticky',
        top: `${navbarHeight}px`,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: (isMobile || isTablet) ? '2px 0 8px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {/* Toggle button (desktop only) */}
      {!isMobile && (
        <div className="p-2 border-bottom">
          <Button
            variant="link"
            onClick={onToggle}
            className="w-100 text-start p-2"
            style={{
              textDecoration: 'none',
              color: '#212529',
              fontSize: '0.9rem',
            }}
          >
            {isCollapsed ? '☰' : '✕'}
          </Button>
        </div>
      )}

      <Nav className="flex-column p-2 p-md-3 flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              onClick={handleLinkClick}
              className={`mb-1 mb-md-2 d-flex align-items-center ${
                isActive ? 'active fw-bold' : ''
              }`}
              style={{
                borderRadius: '8px',
                padding: isMobile ? '12px 15px' : '10px 15px',
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? '#e7f3ff' : 'transparent',
                color: isActive ? '#0d6efd' : '#212529',
                textDecoration: 'none',
                minHeight: isMobile ? '48px' : '44px',
                touchAction: 'manipulation', // Better touch handling on mobile
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isMobile) {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <span 
                className="me-2 d-flex align-items-center justify-content-center" 
                style={{ 
                  fontSize: isMobile ? '1.3rem' : '1.2rem', 
                  minWidth: isMobile ? '28px' : '24px',
                  width: isMobile ? '28px' : '24px'
                }}
              >
                {item.icon}
              </span>
              {(!isCollapsed || isMobile || isTablet) && (
                <span style={{ 
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.3s ease',
                  opacity: isCollapsed && !isMobile && !isTablet ? 0 : 1,
                  fontSize: isMobile ? '0.95rem' : '0.9rem',
                }}>
                  {item.label}
                </span>
              )}
            </Nav.Link>
          );
        })}
      </Nav>
    </div>
  );
};

export default Sidenav;

