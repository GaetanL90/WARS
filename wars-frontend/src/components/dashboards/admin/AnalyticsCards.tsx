import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Case } from '../../../utils/mockData';

interface AnalyticsCardsProps {
  cases: Case[];
  onCardClick?: (filter?: { status?: string }) => void;
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ cases, onCardClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'pending').length,
    inProgress: cases.filter(c => c.status === 'in_progress').length,
    resolved: cases.filter(c => c.status === 'resolved').length,
  };

  const handleCardClick = (filter?: { status?: string }) => {
    if (onCardClick) {
      onCardClick(filter);
    } else {
      navigate('/cases/admin');
    }
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: number; 
    variant: string; 
    icon: string;
    onClick?: () => void;
  }> = ({ title, value, variant, icon, onClick }) => (
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
          title={t('dashboard.admin.totalCases')}
          value={stats.total}
          variant="primary"
          icon="📊"
          onClick={() => handleCardClick()}
        />
      </Col>
      <Col md={3}>
        <StatCard
          title={t('dashboard.admin.pending')}
          value={stats.pending}
          variant="warning"
          icon="⏳"
          onClick={() => handleCardClick({ status: 'pending' })}
        />
      </Col>
      <Col md={3}>
        <StatCard
          title={t('dashboard.admin.inProgress')}
          value={stats.inProgress}
          variant="info"
          icon="🔄"
          onClick={() => handleCardClick({ status: 'in_progress' })}
        />
      </Col>
      <Col md={3}>
        <StatCard
          title={t('dashboard.admin.resolved')}
          value={stats.resolved}
          variant="success"
          icon="✅"
          onClick={() => handleCardClick({ status: 'resolved' })}
        />
      </Col>
    </Row>
  );
};

export default AnalyticsCards;

