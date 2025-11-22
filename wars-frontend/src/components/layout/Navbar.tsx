import React, { useState, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import warsLogo from '../../assets/WARS_logo_1.png';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Responsive navbar height - increased to accommodate larger logo
  const navbarHeight = isMobile ? '100px' : '110px';

  return (
    <BootstrapNavbar 
      bg="light" 
      expand="lg" 
      className="border-bottom"
      style={{ 
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: navbarHeight,
        minHeight: navbarHeight,
        maxHeight: navbarHeight,
        transition: 'height 0.3s ease',
        padding: 0,
        margin: 0
      }}
    >
      <Container 
        fluid 
        className="px-3 px-md-4"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          paddingTop: 0,
          paddingBottom: 0,
          margin: 0
        }}
      >
        <BootstrapNavbar.Brand 
          as={Link} 
          to="/" 
          className="d-flex align-items-center"
          style={{ 
            padding: 0,
            margin: 0,
            marginRight: isMobile ? '0.5rem' : '1rem',
            height: '100%',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <img 
            src={warsLogo} 
            alt="WARS Logo" 
            style={{ 
              height: isMobile ? '85px' : isTablet ? '95px' : '105px',
              width: 'auto',
              maxHeight: navbarHeight,
              objectFit: 'contain',
              transition: 'height 0.3s ease'
            }} 
          />
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          style={{
            border: 'none',
            padding: '0.25rem 0.5rem'
          }}
        />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {isAuthenticated ? (
              <NavDropdown 
                title={
                  <span style={{ 
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    maxWidth: isMobile ? '120px' : '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {isMobile ? (user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User') : (user?.name || user?.email || 'User')}
                  </span>
                }
                id="user-nav-dropdown"
                align="end"
                style={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
              >
                <NavDropdown.Item as={Link} to="/profile" style={{ fontSize: '0.95rem' }}>
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/settings" style={{ fontSize: '0.95rem' }}>
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} style={{ fontSize: '0.95rem' }}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link 
                as={Link} 
                to="/login"
                style={{ 
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  padding: '0.5rem 1rem'
                }}
              >
                Login
              </Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;

