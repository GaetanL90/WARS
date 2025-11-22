import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setEmail(stateEmail);
    } else {
      // If no email in state, redirect to register
      navigate('/signup');
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // DUMMY DATA - Check OTP from sessionStorage
      // In production, this would be: await api.post('/auth/verify-otp', { email, otp });
      
      const storedOTP = sessionStorage.getItem('pendingOTP');
      const storedEmail = sessionStorage.getItem('pendingEmail');
      
      if (storedOTP && storedEmail === email && otp === storedOTP) {
        // OTP verified successfully
        sessionStorage.removeItem('pendingOTP');
        sessionStorage.removeItem('pendingEmail');
        navigate('/login', { state: { message: 'Email verified successfully. Please login.' } });
      } else {
        throw new Error('Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setResendLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // DUMMY DATA - Generate new OTP
      // In production, this would be: await api.post('/auth/resend-otp', { email });
      
      const newOTP = '123456'; // For testing, always use this
      sessionStorage.setItem('pendingOTP', newOTP);
      sessionStorage.setItem('pendingEmail', email);
      
      alert('OTP has been resent to your email. Use: 123456');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">OTP Verification</Card.Title>
              
              <Alert variant="info" className="text-center">
                Please enter the OTP sent to {email}
              </Alert>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>OTP Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </div>

                <div className="text-center mb-2">
                  <Button
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="p-0"
                  >
                    {resendLoading ? 'Resending...' : "Didn't receive OTP? Resend"}
                  </Button>
                </div>

                <div className="text-center">
                  <Link to="/login">Back to Login</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyOTP;

