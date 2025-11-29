import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getCases, type Case } from '../../utils/mockData';
import AnalyticsCards from '../../components/dashboards/admin/AnalyticsCards';
import CasesByCategoryChart from '../../components/dashboards/admin/CasesByCategoryChart';
import CasesByStatusChart from '../../components/dashboards/admin/CasesByStatusChart';

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = () => {
    const allCases = getCases();
    setCases(allCases);
  };

  return (
    <Container fluid className="mt-4">
      <div className="mb-4">
        <h1>{t('analytics.reportsAndAnalytics')}</h1>
        <p className="text-muted">{t('analytics.reportsDescription')}</p>
      </div>
      
      <AnalyticsCards cases={cases} />

      <Row className="mt-4">
        <Col md={6}>
          <CasesByCategoryChart cases={cases} />
        </Col>
        <Col md={6}>
          <CasesByStatusChart cases={cases} />
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;

