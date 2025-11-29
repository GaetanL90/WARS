import React, { useState, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Notification } from '../../utils/notifications';
import warsLogo from '../../assets/WARS_logo_1.png';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // Get notifications (context is always available, but will be empty if not authenticated)
  const notificationsContext = useNotifications();
  const notifications: Notification[] = isAuthenticated ? notificationsContext.notifications : [];
  const unreadCount: number = isAuthenticated ? notificationsContext.unreadCount : 0;
  const markNotificationAsRead = notificationsContext.markNotificationAsRead;
  const markAllNotificationsAsRead = notificationsContext.markAllNotificationsAsRead;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 992);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

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
              <>
                {/* Notifications Dropdown */}
                <NavDropdown
                  title={
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <span style={{ fontSize: '1.2rem' }}>🔔</span>
                      {unreadCount > 0 && (
                        <Badge
                          bg="danger"
                          pill
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            fontSize: '0.7rem',
                            minWidth: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 4px',
                          }}
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                  }
                  id="notifications-dropdown"
                  align="end"
                  style={{ marginRight: '0.5rem' }}
                >
                  <NavDropdown.Header>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          className="btn btn-sm btn-link text-decoration-none p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllNotificationsAsRead();
                          }}
                          style={{ fontSize: '0.85rem' }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </NavDropdown.Header>
                  {notifications.length === 0 ? (
                    <NavDropdown.ItemText style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                      No notifications
                    </NavDropdown.ItemText>
                  ) : (
                    <>
                      {notifications.slice(0, 10).map((notification) => (
                        <NavDropdown.Item
                          key={notification.id}
                          onClick={() => {
                            if (!notification.read) {
                              markNotificationAsRead(notification.id);
                            }
                          }}
                          style={{
                            fontSize: '0.9rem',
                            backgroundColor: notification.read ? 'transparent' : '#f8f9fa',
                            whiteSpace: 'normal',
                            maxWidth: '300px',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: notification.read ? 'normal' : 'bold',
                                }}
                              >
                                {notification.message}
                              </div>
                              <small className="text-muted">
                                {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </small>
                            </div>
                            {!notification.read && (
                              <span
                                className="badge bg-primary rounded-circle"
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  marginLeft: '8px',
                                  marginTop: '4px',
                                }}
                              />
                            )}
                          </div>
                        </NavDropdown.Item>
                      ))}
                      {notifications.length > 10 && (
                        <NavDropdown.ItemText style={{ fontSize: '0.85rem', color: '#6c757d', textAlign: 'center' }}>
                          {notifications.length - 10} more notification{notifications.length - 10 !== 1 ? 's' : ''}
                        </NavDropdown.ItemText>
                      )}
                    </>
                  )}
                </NavDropdown>

                {/* User Dropdown */}
                <NavDropdown 
                  title={
                    <div className="d-flex align-items-center gap-2">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <span style={{ 
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        maxWidth: isMobile ? '120px' : '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {isMobile ? (user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User') : (user?.name || user?.email || 'User')}
                      </span>
                    </div>
                  }
                  id="user-nav-dropdown"
                  align="end"
                  style={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
                >
                  <NavDropdown.Item as={Link} to="/profile" style={{ fontSize: '0.95rem' }}>
                    {t('menu.profile')}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/profile/settings" style={{ fontSize: '0.95rem' }}>
                    {t('menu.profileSettings')}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/settings" style={{ fontSize: '0.95rem' }}>
                    {t('common.settings')}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  {/* Language Switcher */}
                  <NavDropdown.Header>{t('language.english')} / {t('language.french')} / {t('language.kinyarwanda')}</NavDropdown.Header>
                  <NavDropdown.Item onClick={() => changeLanguage('en')} style={{ fontSize: '0.95rem' }}>
                    🇬🇧 {t('language.english')}
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => changeLanguage('fr')} style={{ fontSize: '0.95rem' }}>
                    🇫🇷 {t('language.french')}
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => changeLanguage('rw')} style={{ fontSize: '0.95rem' }}>
                    🇷🇼 {t('language.kinyarwanda')}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} style={{ fontSize: '0.95rem' }}>
                    {t('common.logout')}
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <Nav.Link 
                as={Link} 
                to="/login"
                style={{ 
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  padding: '0.5rem 1rem'
                }}
              >
                {t('common.login')}
              </Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;

