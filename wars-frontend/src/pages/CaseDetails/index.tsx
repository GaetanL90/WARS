import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Card,
  Button,
  Badge,
  Form,
  Modal,
  Alert,
  Row,
  Col,
} from 'react-bootstrap';
import { getCaseById, updateCase, type Case } from '../../utils/mockData';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const CaseDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast, setLoading } = useApp();
  const { user, role } = useAuth();
  const { addNotification } = useNotifications();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Case['status']>('pending');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Mock technicians list (in real app, fetch from API)
  const mockTechnicians = [
    { id: 'tech1', name: 'John Technician' },
    { id: 'tech2', name: 'Jane Technician' },
    { id: 'tech3', name: 'Bob Technician' },
  ];

  useEffect(() => {
    if (id) {
      loadCase();
    }
  }, [id]);

  const loadCase = () => {
    if (!id) return;
    try {
      const case_ = getCaseById(id);
      if (case_) {
        setCaseData(case_);
        setSelectedStatus(case_.status);
        setResolutionNotes(case_.resolutionNotes || '');
      } else {
        showToast('Case not found', 'error');
        navigate(-1);
      }
    } catch (error) {
      showToast('Failed to load case', 'error');
    }
  };

  const handleAssignTechnician = async () => {
    if (!id || !selectedTechnician) {
      showToast('Please select a technician', 'warning');
      return;
    }

    setLoading(true);
    try {
      const updated = updateCase(id, {
        assignedTechnician: selectedTechnician,
        status: 'in_progress',
      });

      if (updated) {
        setCaseData(updated);
        setShowAssignModal(false);
        showToast('Technician assigned successfully', 'success');
        
        // Notify the assigned technician
        addNotification(
          `You have been assigned to case #${id.substring(0, 8)} (${updated.type})`,
          selectedTechnician
        );
      } else {
        showToast('Failed to assign technician', 'error');
      }
    } catch (error) {
      showToast('Failed to assign technician', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!id || !caseData) return;

    setLoading(true);
    try {
      const oldStatus = caseData.status;
      const updated = updateCase(id, { status: selectedStatus });

      if (updated) {
        setCaseData(updated);
        setShowStatusModal(false);
        showToast('Status updated successfully', 'success');
        
        // Notify user if status changed to resolved
        if (oldStatus !== selectedStatus) {
          const notificationKey = selectedStatus === 'resolved' 
            ? 'caseDetails.resolvedNotification'
            : 'caseDetails.inProgressNotification';
          
          if (updated.userId) {
            addNotification(
              t(notificationKey, { type: updated.type.toLowerCase(), caseId: id.substring(0, 8) }),
              updated.userId
            );
          }
        }
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!id || !caseData) return;

    if (!resolutionNotes.trim()) {
      showToast('Please add resolution notes', 'warning');
      return;
    }

    setLoading(true);
    try {
      const updated = updateCase(id, {
        status: 'resolved',
        resolutionNotes: resolutionNotes.trim(),
      });

      if (updated) {
        setCaseData(updated);
        setShowResolveModal(false);
        showToast('Case marked as resolved', 'success');
        
        // Notify the case owner
        if (updated.userId) {
          addNotification(
            t('caseDetails.resolvedNotification', { type: updated.type.toLowerCase(), caseId: id.substring(0, 8) }),
            updated.userId
          );
        }
      } else {
        showToast('Failed to resolve case', 'error');
      }
    } catch (error) {
      showToast('Failed to resolve case', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Case['status']) => {
    const variants: Record<Case['status'], { bg: string; text: string }> = {
      pending: { bg: 'warning', text: 'text-dark' }, // Yellow
      in_progress: { bg: 'info', text: 'text-white' }, // Blue
      resolved: { bg: 'success', text: 'text-white' }, // Green
    };
    const variant = variants[status] || variants.pending;
    return (
      <Badge bg={variant.bg} className={variant.text}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAdmin = role?.toLowerCase() === 'admin';
  const isTechnician = role?.toLowerCase() === 'technician';
  const isAssignedTechnician = caseData?.assignedTechnician === user?.id;

  if (!caseData) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="info">{t('caseDetails.loading')}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3">
        ← {t('common.back')}
      </Button>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h3>{t('caseDetails.title')}</h3>
              {getStatusBadge(caseData.status)}
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>{t('caseDetails.caseId')}:</strong>
                </Col>
                <Col sm={8}>
                  <small className="text-muted">{caseData.id}</small>
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
                <Col sm={8}>{caseData.description}</Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>{t('caseDetails.location')}:</strong>
                </Col>
                <Col sm={8}>{caseData.location}</Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>{t('caseDetails.status')}:</strong>
                </Col>
                <Col sm={8}>{getStatusBadge(caseData.status)}</Col>
              </Row>

              {caseData.assignedTechnician && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>{t('caseDetails.assignedTechnician')}:</strong>
                  </Col>
                  <Col sm={8}>
                    {mockTechnicians.find((tech) => tech.id === caseData.assignedTechnician)?.name ||
                      caseData.assignedTechnician}
                  </Col>
                </Row>
              )}

              {caseData.resolutionNotes && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>{t('caseDetails.resolutionNotes')}:</strong>
                  </Col>
                  <Col sm={8}>
                    <div className="p-3 bg-light rounded">{caseData.resolutionNotes}</div>
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

              {caseData.image && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>{t('caseDetails.image')}:</strong>
                  </Col>
                  <Col sm={8}>
                    <img
                      src={caseData.image}
                      alt={t('caseDetails.caseEvidence')}
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                    />
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>{t('common.actions')}</h5>
            </Card.Header>
            <Card.Body>
              {isAdmin && (
                <>
                  <Button
                    variant="primary"
                    className="w-100 mb-2"
                    onClick={() => setShowAssignModal(true)}
                    disabled={caseData.status === 'resolved'}
                  >
                    {t('caseDetails.assignTechnician')}
                  </Button>

                  <Button
                    variant="info"
                    className="w-100 mb-2"
                    onClick={() => setShowStatusModal(true)}
                  >
                    {t('caseDetails.changeStatus')}
                  </Button>
                </>
              )}

              {isTechnician && isAssignedTechnician && caseData.status !== 'resolved' && (
                <Button
                  variant="success"
                  className="w-100 mb-2"
                  onClick={() => setShowResolveModal(true)}
                >
                  {t('caseDetails.markAsResolved')}
                </Button>
              )}

              {!isAdmin && !isAssignedTechnician && (
                <p className="text-muted text-center">
                  {t('caseDetails.noActionsAvailable')}
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Assign Technician Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('caseDetails.assignTechnician')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>{t('caseDetails.selectTechnician')}</Form.Label>
            <Form.Select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
            >
              <option value="">{t('caseDetails.chooseTechnician')}</option>
              {mockTechnicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleAssignTechnician}>
            {t('common.assign')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('caseDetails.changeStatus')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>{t('caseDetails.selectStatus')}</Form.Label>
            <Form.Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Case['status'])}
            >
              <option value="pending">{t('status.pending')}</option>
              <option value="in_progress">{t('status.inProgress')}</option>
              <option value="resolved">{t('status.resolved')}</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleChangeStatus}>
            {t('caseDetails.updateStatus')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Mark as Resolved Modal */}
      <Modal show={showResolveModal} onHide={() => setShowResolveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('caseDetails.markAsResolved')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>{t('caseDetails.resolutionNotesLabel')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder={t('caseDetails.resolutionNotesPlaceholder')}
            />
            <Form.Text className="text-muted">
              {t('caseDetails.resolutionNotesHint')}
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResolveModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="success" onClick={handleMarkResolved}>
            {t('caseDetails.markAsResolved')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CaseDetails;

