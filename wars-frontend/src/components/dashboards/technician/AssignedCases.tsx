import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getCasesByTechnician, type Case } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';
import { useApp } from '../../../contexts/AppContext';
import UpdateStatusModal from './UpdateStatusModal';

interface AssignedCasesProps {
  onUpdate?: () => void;
}

const AssignedCases: React.FC<AssignedCasesProps> = ({ onUpdate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useApp();
  const [cases, setCases] = useState<Case[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadCases();
    }
  }, [user]);

  const loadCases = () => {
    try {
      if (!user?.id) return;
      
      const assignedCases = getCasesByTechnician(user.id);
      // Sort by newest → oldest
      const sorted = assignedCases.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setCases(sorted);
    } catch (error) {
      showToast(t('errors.failedToLoadAssignedCases'), 'error');
    }
  };

  const getStatusBadge = (status: Case['status']) => {
    const variants: Record<Case['status'], { bg: string; text: string }> = {
      pending: { bg: 'warning', text: 'text-dark' },
      in_progress: { bg: 'info', text: 'text-white' },
      resolved: { bg: 'success', text: 'text-white' },
    };
    const variant = variants[status] || variants.pending;
    return (
      <Badge bg={variant.bg} className={variant.text}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateClick = (case_: Case, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCase(case_);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = () => {
    loadCases();
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleViewDetails = (case_: Case, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/cases/${case_.id}`);
  };

  if (cases.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <p className="text-muted mb-0">{t('cases.noAssignedCasesFound')}</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Row className="g-3">
        {cases.map((case_) => (
          <Col key={case_.id} md={6} lg={4}>
            <Card 
              className="h-100 shadow-sm"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/cases/${case_.id}`)}
            >
              <Card.Header className="d-flex justify-content-between align-items-center">
                <small className="text-muted">#{case_.id.substring(0, 8)}</small>
                {getStatusBadge(case_.status)}
              </Card.Header>
              <Card.Body>
                <h6 className="mb-2">{case_.type}</h6>
                <p className="text-muted small mb-2" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {case_.description}
                </p>
                <div className="mb-2">
                  <small className="text-muted">
                    <strong>{t('cases.location')}:</strong> {case_.location.split(',')[0]}
                  </small>
                </div>
                <div className="mb-3">
                  <small className="text-muted">
                    <strong>{t('cases.date')}:</strong> {formatDate(case_.createdAt)}
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => handleUpdateClick(case_, e)}
                    disabled={case_.status === 'resolved'}
                  >
                    {t('cases.updateStatus')}
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={(e) => handleViewDetails(case_, e)}
                  >
                    {t('common.view')}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedCase && (
        <UpdateStatusModal
          show={showUpdateModal}
          onHide={() => {
            setShowUpdateModal(false);
            setSelectedCase(null);
          }}
          caseId={selectedCase.id}
          currentStatus={selectedCase.status}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
};

export default AssignedCases;

