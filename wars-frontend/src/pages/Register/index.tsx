import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.register.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);

    try {
      // DUMMY DATA - Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would be:
      // await api.post('/auth/register', { name, email, password, phone });
      
      // Simulate successful registration
      // Store OTP in sessionStorage for verification (in real app, backend sends this)
      const dummyOTP = '123456'; // For testing, use this OTP
      sessionStorage.setItem('pendingOTP', dummyOTP);
      sessionStorage.setItem('pendingEmail', formData.email);
      
      // Redirect to OTP verification
      navigate('/otp', { state: { email: formData.email } });
    } catch (err: any) {
      setError(err.message || t('auth.register.registrationFailed'));
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
              <Card.Title className="text-center mb-4">{t('auth.register.title')}</Card.Title>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('auth.register.fullName')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder={t('auth.register.enterFullName')}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t('auth.register.email')}</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder={t('auth.register.enterEmail')}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t('auth.register.phone')}</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder={t('auth.register.enterPhone')}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t('auth.register.password')}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder={t('auth.register.enterPassword')}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t('auth.register.confirmPassword')}</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder={t('auth.register.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? t('auth.register.registering') : t('auth.register.register')}
                  </Button>
                </div>

                <div className="text-center">
                  <Link to="/login">{t('auth.register.haveAccount')}</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;

