import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Navbar from './Navbar';
import Sidenav from './Sidenav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * DashboardLayout - Main layout wrapper for dashboard pages
 * Contains Navbar at top, Sidenav on left, and main content area
 */
function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 992);
  const [showToggleButton, setShowToggleButton] = useState(true);

  // Handle window resize with debouncing
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const mobile = width < 768;
        const tablet = width >= 768 && width < 992;
        
        setIsMobile(mobile);
        setIsTablet(tablet);
        
        // Auto-collapse on mobile and tablet
        if (mobile || tablet) {
          setIsCollapsed(true);
        } else {
          // Restore previous state on desktop (or default to expanded)
          setIsCollapsed(false);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auto-hide toggle button on mobile after inactivity
  useEffect(() => {
    if (!isMobile) {
      setShowToggleButton(true);
      return;
    }

    let hideTimeout: ReturnType<typeof setTimeout>;
    const hideDelay = 3000; // Hide after 3 seconds of inactivity

    const resetTimer = () => {
      clearTimeout(hideTimeout);
      setShowToggleButton(true);
      
      hideTimeout = setTimeout(() => {
        setShowToggleButton(false);
      }, hideDelay);
    };

    // Initial timer
    hideTimeout = setTimeout(() => {
      setShowToggleButton(false);
    }, hideDelay);

    // Show button on user interaction
    const handleInteraction = () => {
      resetTimer();
    };

    // Listen to various interaction events
    const events = ['touchstart', 'touchmove', 'scroll', 'click', 'mousemove'];
    events.forEach(event => {
      window.addEventListener(event, handleInteraction, { passive: true });
    });

    return () => {
      clearTimeout(hideTimeout);
      events.forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, [isMobile]);

  // Responsive navbar height - match Navbar component
  const navbarHeight = isMobile ? 100 : 110;

  const toggleSidenav = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      {/* Navbar at top */}
      <Navbar />

      {/* Main content area with Sidenav */}
      <div className="d-flex flex-grow-1" style={{ overflow: 'hidden', position: 'relative' }}>
        {/* Mobile/Tablet menu toggle button */}
        {(isMobile || isTablet) && (
          <Button
            variant="light"
            onClick={toggleSidenav}
            style={{
              position: 'fixed',
              top: `${navbarHeight + 10}px`,
              left: isCollapsed ? '10px' : '260px',
              zIndex: 1001,
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'left 0.3s ease, transform 0.2s ease, opacity 0.3s ease, visibility 0.3s ease',
              fontSize: '1.2rem',
              backgroundColor: '#fff',
              border: '1px solid #dee2e6',
              opacity: showToggleButton ? 1 : 0,
              visibility: showToggleButton ? 'visible' : 'hidden',
              pointerEvents: showToggleButton ? 'auto' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
            onTouchStart={() => {
              // Keep button visible when touched
              setShowToggleButton(true);
            }}
          >
            {isCollapsed ? '☰' : '✕'}
          </Button>
        )}

        {/* Sidenav on left */}
        {!isMobile && !isTablet && (
          <Sidenav isCollapsed={isCollapsed} onToggle={toggleSidenav} />
        )}
        {(isMobile || isTablet) && (
          <div
            style={{
              position: 'fixed',
              zIndex: 1000,
              height: `calc(100vh - ${navbarHeight}px)`,
              top: `${navbarHeight}px`,
              left: isCollapsed ? '-280px' : '0',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isCollapsed ? 'none' : '2px 0 8px rgba(0,0,0,0.1)',
            }}
          >
            <Sidenav isCollapsed={false} onToggle={toggleSidenav} />
          </div>
        )}

        {/* Main content area */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? '15px' : isTablet ? '5px' : '5px',
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            
            minHeight: `calc(100vh - ${navbarHeight}px)`,
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile/Tablet overlay when sidenav is open */}
      {(isMobile || isTablet) && !isCollapsed && (
        <div
          onClick={toggleSidenav}
          style={{
            position: 'fixed',
            top: `${navbarHeight}px`,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            transition: 'opacity 0.3s ease',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
