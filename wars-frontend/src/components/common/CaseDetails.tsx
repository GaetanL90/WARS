import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Row, Col, Card, Alert, Image } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getCaseById, type Case } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import AssignTechnicianModal from '../dashboards/admin/AssignTechnicianModal';

// Helper function to get user name from userId
const getUserName = (userId: string): string => {
  try {
    const userDataCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='));
    if (userDataCookie) {
      const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
      if (userData.id === userId) {
        return userData.name || userData.email || userId;
      }
    }
  } catch (error) {
    // Ignore errors
  }

  // Mock user mapping
  const mockUsers: Record<string, string> = {
    '1': 'Admin User',
    '2': 'Responsible User',
    '3': 'Technician User',
    '4': 'Customer User',
    '5': 'Wasac Manager',
  };

  return mockUsers[userId] || userId;
};

interface CaseDetailsProps {
  show: boolean;
  onHide: () => void;
  caseId: string;
  onUpdate?: () => void;
  onAssignTechnician?: () => void;
  onUpdateStatus?: () => void;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({
  show,
  onHide,
  caseId,
  onUpdate,
  onAssignTechnician,
  onUpdateStatus,
}) => {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    if (show && caseId) {
      loadCase();
    }
  }, [show, caseId]);

  const loadCase = () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      const case_ = getCaseById(caseId);
      if (case_) {
        setCaseData(case_);
      } else {
        setCaseData(null);
      }
    } catch (error) {
      console.error('Error loading case:', error);
      setCaseData(null);
    } finally {
      setLoading(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAssignSuccess = () => {
    loadCase();
    if (onAssignTechnician) {
      onAssignTechnician();
    }
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleUpdateStatusClick = () => {
    if (onUpdateStatus) {
      onUpdateStatus();
    }
    // In a real app, this might open a modal or navigate to a page
    // For now, we'll just call the callback
  };

  const isAdmin = role === 'admin';
  const isTechnician = role === 'technician';

  if (loading) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Body className="text-center py-5">
          <Alert variant="info">{t('caseDetails.loading')}</Alert>
        </Modal.Body>
      </Modal>
    );
  }

  if (!caseData) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Body className="text-center py-5">
          <Alert variant="danger">{t('caseDetails.caseNotFound')}</Alert>
          <Button variant="secondary" onClick={onHide} className="mt-3">
            {t('common.close')}
          </Button>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>
            {t('caseDetails.title')} - {caseData.id.substring(0, 8)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{t('caseDetails.caseId')}</h5>
              {getStatusBadge(caseData.status)}
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Reported By:</strong>
                </Col>
                <Col sm={8}>
                  {getUserName(caseData.userId)}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>{t('caseDetails.type')}:</strong>
                </Col>
                <Col sm={8}>{caseData.type}</Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>{t('caseDetails.description')}:</strong>
                </Col>
                <Col sm={8}>
                  <div className="p-2 bg-light rounded">
                    {caseData.description}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>{t('caseDetails.location')}:</strong>
                </Col>
                <Col sm={8}>
                  <small>{caseData.location}</small>
                </Col>
              </Row>

              {caseData.assignedTechnician && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>{t('caseDetails.assignedTechnician')}:</strong>
                  </Col>
                  <Col sm={8}>
                    {getUserName(caseData.assignedTechnician)}
                  </Col>
                </Row>
              )}

              {caseData.resolutionNotes && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>{t('caseDetails.resolutionNotes')}:</strong>
                  </Col>
                  <Col sm={8}>
                    <div className="p-3 bg-light rounded">
                      {caseData.resolutionNotes}
                    </div>
                  </Col>
                </Row>
              )}

              {caseData.image && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>{t('caseDetails.image')}:</strong>
                  </Col>
                  <Col sm={8}>
                    <Image
                      src={caseData.image}
                      alt={t('caseDetails.caseEvidence')}
                      fluid
                      rounded
                      style={{ maxHeight: '300px', objectFit: 'contain' }}
                    />
                  </Col>
                </Row>
              )}

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>{t('caseDetails.created')}:</strong>
                </Col>
                <Col sm={8}>
                  <small>{formatDate(caseData.createdAt)}</small>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>{t('caseDetails.lastUpdated')}:</strong>
                </Col>
                <Col sm={8}>
                  <small>{formatDate(caseData.updatedAt)}</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <div>
              {(isAdmin || isTechnician) && (
                <>
                  {isAdmin && (
                    <Button
                      variant="primary"
                      onClick={() => setShowAssignModal(true)}
                      disabled={caseData.status === 'resolved'}
                    >
                      {t('caseDetails.assignTechnician')}
                    </Button>
                  )}
                  {isTechnician && (
                    <Button
                      variant="info"
                      onClick={handleUpdateStatusClick}
                      className="ms-2"
                    >
                      {t('caseDetails.changeStatus')}
                    </Button>
                  )}
                </>
              )}
            </div>
            <Button variant="secondary" onClick={onHide}>
              {t('common.close')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Assign Technician Modal */}
      {isAdmin && (
        <AssignTechnicianModal
          show={showAssignModal}
          onHide={() => setShowAssignModal(false)}
          caseId={caseId}
          caseType={caseData.type}
          currentTechnicianId={caseData.assignedTechnician}
          onSuccess={handleAssignSuccess}
        />
      )}
    </>
  );
};

export default CaseDetails;

