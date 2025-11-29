import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { getCasesByUserId } from '../../../utils/mockData';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const username = user?.name || user?.email || 'User';
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user]);

  const loadStats = () => {
    if (!user?.id) return;
    
    const cases = getCasesByUserId(user.id);
    setStats({
      total: cases.length,
      pending: cases.filter(c => c.status === 'pending').length,
      inProgress: cases.filter(c => c.status === 'in_progress').length,
      resolved: cases.filter(c => c.status === 'resolved').length,
    });
  };

  const StatCard: React.FC<{ title: string; value: number; variant: string; onClick?: () => void }> = ({ 
    title, 
    value, 
    variant,
    onClick 
  }) => (
    <Card 
      className="shadow-sm h-100" 
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted mb-2">{title}</h6>
            <h2 className="mb-0">{value}</h2>
          </div>
          <Badge bg={variant} style={{ fontSize: '2rem', padding: '0.5rem' }}>
            {variant === 'warning' && '⏳'}
            {variant === 'info' && '🔄'}
            {variant === 'success' && '✅'}
            {variant === 'secondary' && '🔒'}
            {variant === 'primary' && '📊'}
          </Badge>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="mt-4">
      <div className="mb-4">
        <h1>{t('dashboard.customer.title')}</h1>
        <p className="text-muted">
          {t('common.welcome')}, <strong>{username}</strong>
        </p>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <StatCard
            title={t('dashboard.customer.totalCases')}
            value={stats.total}
            variant="primary"
            onClick={() => navigate('/cases')}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title={t('dashboard.customer.pending')}
            value={stats.pending}
            variant="warning"
            onClick={() => navigate('/cases')}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title={t('dashboard.customer.inProgress')}
            value={stats.inProgress}
            variant="info"
            onClick={() => navigate('/cases')}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title={t('dashboard.customer.resolved')}
            value={stats.resolved}
            variant="success"
            onClick={() => navigate('/cases')}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">{t('dashboard.customer.quickActions')}</h5>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/cases/new')}
                >
                  ➕ {t('dashboard.customer.reportNewIssue')}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/cases')}
                >
                  📋 {t('dashboard.customer.viewMyCases')}
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">{t('dashboard.customer.recentActivity')}</h5>
              <p className="text-muted">
                {stats.total === 0 
                  ? t('dashboard.customer.noCasesYet')
                  : t('dashboard.customer.casesSummary', {
                      count: stats.total,
                      plural: stats.total !== 1 ? 's' : '',
                      pending: stats.pending > 0 ? `${stats.pending} ` : '',
                      resolved: stats.resolved > 0 ? `${stats.resolved} ` : '',
                    })
                }
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerDashboard;

