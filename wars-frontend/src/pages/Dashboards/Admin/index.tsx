import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { getCases, type Case } from '../../../utils/mockData';
import AnalyticsCards from '../../../components/dashboards/admin/AnalyticsCards';
import CasesByCategoryChart from '../../../components/dashboards/admin/CasesByCategoryChart';
import CasesByStatusChart from '../../../components/dashboards/admin/CasesByStatusChart';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const username = user?.name || user?.email || 'User';
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const allCases = getCases();
    setCases(allCases);
    setStats({
      total: allCases.length,
      pending: allCases.filter(c => c.status === 'pending').length,
      inProgress: allCases.filter(c => c.status === 'in_progress').length,
      resolved: allCases.filter(c => c.status === 'resolved').length,
    });
  };

  return (
    <Container fluid className="mt-4">
      <div className="mb-4">
        <h1>{t('dashboard.admin.title')}</h1>
        <p className="text-muted">
          {t('common.welcome')}, <strong>{username}</strong>
        </p>
      </div>

      <AnalyticsCards 
        cases={cases} 
        onCardClick={() => navigate('/cases/admin')}
      />

      <Row className="mt-4">
        <Col md={6}>
          <CasesByCategoryChart cases={cases} />
        </Col>
        <Col md={6}>
          <CasesByStatusChart cases={cases} />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">{t('dashboard.admin.quickActions')}</h5>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/cases/admin')}
                >
                  📋 {t('dashboard.admin.manageCases')}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/users')}
                >
                  👥 {t('dashboard.admin.manageUsers')}
                </button>
                <button
                  className="btn btn-outline-info"
                  onClick={() => navigate('/reports')}
                >
                  📊 {t('analytics.viewReports')}
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">{t('dashboard.admin.systemOverview')}</h5>
              <p className="text-muted">
                {stats.total === 0 
                  ? t('dashboard.admin.noCases')
                  : t('dashboard.admin.casesSummary', {
                      total: stats.total,
                      pending: stats.pending,
                      inProgress: stats.inProgress,
                      resolved: stats.resolved,
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

export default AdminDashboard;

