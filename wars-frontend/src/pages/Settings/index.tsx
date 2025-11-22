import React from 'react';
import { Container, Card } from 'react-bootstrap';

const Settings: React.FC = () => {
  return (
    <Container>
      <h1>Settings</h1>
      <Card>
        <Card.Body>
          <p>Settings page content will be displayed here.</p>
          <p>This page will include user preferences, account settings, etc.</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Settings;

