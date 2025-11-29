import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // DUMMY DATA - Simulate backend response
      // In production, this would be: const response = await api.post('/auth/login', { email, password });
      
      // Mock user database
      const dummyUsers: Record<string, { password: string; user: any; accessToken: string; refreshToken: string }> = {
        'admin@example.com': {
          password: 'admin123',
          user: { id: '1', email: 'admin@example.com', role: 'admin', name: 'Admin User' },
          accessToken: 'dummy-jwt-access-token-admin-' + Date.now(),
          refreshToken: 'dummy-refresh-token-admin-' + Date.now(),
        },
        'responsible@example.com': {
          password: 'responsible123',
          user: { id: '2', email: 'responsible@example.com', role: 'responsible', name: 'Responsible User' },
          accessToken: 'dummy-jwt-access-token-responsible-' + Date.now(),
          refreshToken: 'dummy-refresh-token-responsible-' + Date.now(),
        },
        'technician@example.com': {
          password: 'technician123',
          user: { id: '3', email: 'technician@example.com', role: 'technician', name: 'Technician User' },
          accessToken: 'dummy-jwt-access-token-technician-' + Date.now(),
          refreshToken: 'dummy-refresh-token-technician-' + Date.now(),
        },
        'customer@example.com': {
          password: 'customer123',
          user: { id: '4', email: 'customer@example.com', role: 'customer', name: 'Customer User' },
          accessToken: 'dummy-jwt-access-token-customer-' + Date.now(),
          refreshToken: 'dummy-refresh-token-customer-' + Date.now(),
        },
        'wasac@example.com': {
          password: 'wasac123',
          user: { id: '5', email: 'wasac@example.com', role: 'wasac', name: 'Wasac Manager' },
          accessToken: 'dummy-jwt-access-token-wasac-' + Date.now(),
          refreshToken: 'dummy-refresh-token-wasac-' + Date.now(),
        },
      };

      const userData = dummyUsers[email.toLowerCase()];

      if (!userData || userData.password !== password) {
        throw new Error(t('auth.login.invalidCredentials'));
      }

      // Simulate successful login
      // For dummy data, create a JWT-like token with user data in payload
      const { user, refreshToken } = userData;
      
      // Create a dummy JWT token with user data encoded
      // Format: header.payload.signature (we only need payload for decoding)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        user_id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days expiry to match cookie expiry
        iat: Math.floor(Date.now() / 1000),
      }));
      const signature = 'dummy-signature';
      const dummyJWT = `${header}.${payload}.${signature}`;
      
      // Login will decode JWT and extract user role automatically
      login(dummyJWT, refreshToken);
      
      // Redirect to /dashboard - DashboardRedirect will route to role-specific dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || t('errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">{t('auth.login.title')}</Card.Title>
              
              <Alert variant="info" className="mb-3">
                <strong>{t('auth.login.testCredentials')}</strong><br />
                Admin: admin@example.com / admin123<br />
                Responsible: responsible@example.com / responsible123<br />
                Technician: technician@example.com / technician123<br />
                Customer: customer@example.com / customer123<br />
                Wasac: wasac@example.com / wasac123
              </Alert>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('auth.login.email')}</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder={t('auth.login.enterEmail')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t('auth.login.password')}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={t('auth.login.enterPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? t('auth.login.loggingIn') : t('common.login')}
                  </Button>
                </div>

                <div className="text-center">
                  <Link to="/reset-password">{t('auth.login.forgotPassword')}</Link>
                </div>
                <div className="text-center mt-2">
                  <Link to="/signup">{t('auth.login.noAccount')}</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;

