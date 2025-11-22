import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import api from '../../api/axios';

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await api.get(`/cases/${id}`);
        setCaseData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load case details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCase();
    }
  }, [id]);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3">
        ← Back
      </Button>
      
      <Card>
        <Card.Header>
          <h2>Case #{caseData?.id || id}</h2>
        </Card.Header>
        <Card.Body>
          {caseData ? (
            <div>
              <p><strong>Status:</strong> {caseData.status}</p>
              <p><strong>Description:</strong> {caseData.description}</p>
              <p><strong>Created:</strong> {new Date(caseData.createdAt).toLocaleString()}</p>
              {/* Add more case details as needed */}
            </div>
          ) : (
            <p>Case not found</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CaseDetail;

