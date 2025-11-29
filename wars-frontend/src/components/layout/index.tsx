import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <Navbar />
      <Row className="flex-grow-1 m-0">
        {showSidebar && (
          <Col xs={12} md={3} lg={2} className="p-0">
            <Sidebar />
          </Col>
        )}
        <Col xs={12} md={showSidebar ? 9 : 12} lg={showSidebar ? 10 : 12} className="p-4">
          {children}
        </Col>
      </Row>
    </div>
  );
};

export default Layout;

