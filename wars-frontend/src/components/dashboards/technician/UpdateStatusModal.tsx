import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { updateCaseStatus, addTechnicianNote } from '../../../api/cases';
import { useApp } from '../../../contexts/AppContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { getCaseById } from '../../../utils/mockData';
import type { Case } from '../../../utils/mockData';

interface UpdateStatusModalProps {
  show: boolean;
  onHide: () => void;
  caseId: string;
  currentStatus: Case['status'];
  onSuccess?: () => void;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  show,
  onHide,
  caseId,
  currentStatus,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast, setLoading } = useApp();
  const { addNotification } = useNotifications();
  
  const [status, setStatus] = useState<Case['status']>(currentStatus);
  const [notes, setNotes] = useState('');
  const [loading, setLocalLoading] = useState(false);

  // Reset form when modal opens/closes or currentStatus changes
  React.useEffect(() => {
    if (show) {
      setStatus(currentStatus);
      setNotes('');
    }
  }, [show, currentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that status is not 'pending' (technicians can only set in_progress or resolved)
    if (status === 'pending') {
      showToast(t('cases.cannotSetToPending'), 'warning');
      return;
    }

    setLocalLoading(true);
    setLoading(true);

    try {
      const result = await updateCaseStatus(caseId, status);
      // Add notes separately if needed
      if (notes.trim()) {
        await addTechnicianNote(caseId, notes.trim());
      }

      if (result) {
        showToast(t('cases.statusUpdatedSuccessfully'), 'success');
        
        // Get case details for notification
        const case_ = getCaseById(caseId);
        if (case_ && case_.userId) {
          // Notify the case owner
          const notificationKey = status === 'resolved' 
            ? 'cases.caseResolved'
            : 'cases.caseInProgress';
          
          addNotification(
            t(notificationKey, {
              caseId: caseId.substring(0, 8),
              type: case_.type,
            }),
            case_.userId
          );
        }

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        // Close modal
        onHide();
      }
    } catch (error: any) {
      console.error('Error updating case status:', error);
      showToast(
        error?.message || t('cases.failedToUpdateStatus'),
        'error'
      );
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStatus(currentStatus);
      setNotes('');
      onHide();
    }
  };

  // Available statuses for technicians (cannot set to pending)
  const availableStatuses: Case['status'][] = ['in_progress', 'resolved'];

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('cases.updateStatus')}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t('cases.selectNewStatus')}</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value as Case['status'])}
              disabled={loading}
              required
            >
              {availableStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              {t('cases.statusUpdateHint', {
                defaultValue: 'Select the new status for this case.',
              })}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('cases.technicianNotes')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('cases.technicianNotesPlaceholder', {
                defaultValue: 'Add any notes or comments about this case...',
              })}
              disabled={loading}
            />
            <Form.Text className="text-muted">
              {t('cases.technicianNotesHint', {
                defaultValue: 'Optional: Add notes about the case status update.',
              })}
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || status === 'pending'}
          >
            {loading ? t('common.loading') : t('common.update')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateStatusModal;

