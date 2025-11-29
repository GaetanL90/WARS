import React from 'react';
import { Container, Card } from 'react-bootstrap';

interface FormContainerProps {
  title: string;
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ title, children }) => {
  return (
    <Container fluid className="mt-4">
      <Card>
        <Card.Header as="div">
          <h3>{title}</h3>
        </Card.Header>
        <Card.Body as="div">
          {children}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FormContainer;

