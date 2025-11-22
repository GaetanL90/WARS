import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const UpdatePassword: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // For password reset flow

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // DUMMY DATA - Simulate password update
      // In production, this would be:
      // if (token) {
      //   await api.post('/auth/update-password', { token, newPassword: formData.newPassword });
      // } else {
      //   await api.post('/auth/change-password', { currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      // }
      
      setSuccess('Password updated successfully');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">
                {token ? 'Update Password' : 'Change Password'}
              </Card.Title>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                {!token && (
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      placeholder="Enter current password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>

                <div className="text-center">
                  <Button variant="link" onClick={() => navigate(-1)} className="p-0">
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdatePassword;

