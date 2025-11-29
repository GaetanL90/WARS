import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Case } from '../../../utils/mockData';

interface AnalyticsCardsProps {
  cases: Case[];
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ cases }) => {
  const { t } = useTranslation();

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'pending').length,
    inProgress: cases.filter(c => c.status === 'in_progress').length,
    resolved: cases.filter(c => c.status === 'resolved').length,
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: number; 
    variant: string; 
    icon: string;
  }> = ({ title, value, variant, icon }) => (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted mb-2">{title}</h6>
            <h2 className="mb-0">{value}</h2>
          </div>
          <Badge bg={variant} style={{ fontSize: '2rem', padding: '0.5rem' }}>
            {icon}
          </Badge>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Row className="g-4">
      <Col md={3}>
        <StatCard
          title={t('dashboard.manager.totalCases')}
          value={stats.total}
          variant="primary"
          icon="📊"
        />
      </Col>
      <Col md={3}>
        <StatCard
          title={t('dashboard.manager.pending')}
          value={stats.pending}
          variant="warning"
          icon="⏳"
        />
      </Col>
      <Col md={3}>
        <StatCard
          title={t('dashboard.manager.inProgress')}
          value={stats.inProgress}
          variant="info"
          icon="🔄"
        />
      </Col>
      <Col md={3}>
        <StatCard
          title={t('dashboard.manager.resolved')}
          value={stats.resolved}
          variant="success"
          icon="✅"
        />
      </Col>
    </Row>
  );
};

export default AnalyticsCards;

