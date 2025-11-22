import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';

const TechnicianDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const username = user?.name || user?.email || 'User';

  return (
    <Container fluid className="mt-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="mb-3">Technician Dashboard</h1>
          <p className="lead">
            Welcome, <strong>{username}</strong>, this is the <strong>{role || 'technician'}</strong> dashboard.
          </p>
          <p className="text-muted">
            This dashboard will display your assigned cases, work progress, and task management tools.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TechnicianDashboard;

