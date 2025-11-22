import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const ResetPassword: React.FC = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // DUMMY DATA - Simulate sending reset OTP
      // In production, this would be: await api.post('/auth/request-reset', { email });
      
      // Store reset OTP in sessionStorage
      const resetOTP = '123456'; // For testing, use this OTP
      sessionStorage.setItem('resetOTP', resetOTP);
      sessionStorage.setItem('resetEmail', email);
      
      setStep('reset');
      alert('OTP has been sent to your email. Use: 123456');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // DUMMY DATA - Verify OTP and reset password
      // In production, this would be: await api.post('/auth/reset-password', { email, otp, newPassword });
      
      const storedOTP = sessionStorage.getItem('resetOTP');
      const storedEmail = sessionStorage.getItem('resetEmail');
      
      if (storedOTP && storedEmail === email && otp === storedOTP) {
        // Password reset successful
        sessionStorage.removeItem('resetOTP');
        sessionStorage.removeItem('resetEmail');
        navigate('/login', { state: { message: 'Password reset successfully. Please login.' } });
      } else {
        throw new Error('Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'request') {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card>
              <Card.Body>
                <Card.Title className="text-center mb-4">Reset Password</Card.Title>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleRequestReset}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <div className="d-grid mb-3">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Reset OTP'}
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
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Reset Password</Card.Title>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleResetPassword}>
                <Form.Group className="mb-3">
                  <Form.Label>OTP Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>

                <div className="text-center">
                  <Button variant="link" onClick={() => setStep('request')} className="p-0">
                    Back
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

export default ResetPassword;

