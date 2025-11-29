import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { getCases } from '../../../utils/mockData';
import AnalyticsCards from '../../../components/dashboards/manager/AnalyticsCards';
import RegionStatistics from '../../../components/dashboards/manager/RegionStatistics';
import CaseTrendChart from '../../../components/dashboards/manager/CaseTrendChart';
import ReadOnlyCaseTable from '../../../components/dashboards/manager/ReadOnlyCaseTable';
import type { Case } from '../../../utils/mockData';

const WasacManagerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const username = user?.name || user?.email || 'User';
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = () => {
    try {
      const allCases = getCases();
      setCases(allCases);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  return (
    <Container fluid className="mt-4">
      <div className="mb-4">
        <h1 className="mb-2">{t('dashboard.manager.title')}</h1>
        <p className="text-muted">
          {t('dashboard.manager.welcome', { name: username })}
        </p>
      </div>

      {/* Overview Analytics */}
      <div className="mb-4">
        <AnalyticsCards cases={cases} />
      </div>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col lg={6}>
          <CaseTrendChart cases={cases} />
        </Col>
        <Col lg={6}>
          <RegionStatistics cases={cases} />
        </Col>
      </Row>

      {/* Cases Table */}
      <div className="mb-4">
        <ReadOnlyCaseTable onRefresh={loadCases} />
      </div>
    </Container>
  );
};

export default WasacManagerDashboard;

