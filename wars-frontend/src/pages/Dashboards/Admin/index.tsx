import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const username = user?.name || user?.email || 'User';

  return (
    <Container fluid className="mt-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="mb-3">Admin Dashboard</h1>
          <p className="lead">
            Welcome, <strong>{username}</strong>, this is the <strong>{role || 'admin'}</strong> dashboard.
          </p>
          <p className="text-muted">
            This dashboard will display administrative controls, system statistics, and management tools.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;

