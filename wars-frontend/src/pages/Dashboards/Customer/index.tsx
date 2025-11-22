import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';

const CustomerDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const username = user?.name || user?.email || 'User';

  return (
    <Container fluid className="mt-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="mb-3">Customer Dashboard</h1>
          <p className="lead">
            Welcome, <strong>{username}</strong>, this is the <strong>{role || 'customer'}</strong> dashboard.
          </p>
          <p className="text-muted">
            This dashboard will display your reported cases, issue tracking, and service requests.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CustomerDashboard;

