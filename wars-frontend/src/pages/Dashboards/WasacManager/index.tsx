import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';

const WasacManagerDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const username = user?.name || user?.email || 'User';
  const displayRole = role === 'wasac' || role === 'wasac_manager' ? 'wasac manager' : (role || 'wasac manager');

  return (
    <Container fluid className="mt-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="mb-3">WASAC Manager Dashboard</h1>
          <p className="lead">
            Welcome, <strong>{username}</strong>, this is the <strong>{displayRole}</strong> dashboard.
          </p>
          <p className="text-muted">
            This dashboard will display case reviews, approvals, analytics, and management overview.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WasacManagerDashboard;

