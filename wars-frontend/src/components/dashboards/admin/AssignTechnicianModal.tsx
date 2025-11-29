import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { assignTechnician } from '../../../api/cases';
import { useApp } from '../../../contexts/AppContext';
import { useNotifications } from '../../../contexts/NotificationContext';

export interface Technician {
  id: string;
  name: string;
  email?: string;
}

interface AssignTechnicianModalProps {
  show: boolean;
  onHide: () => void;
  caseId: string;
  caseType?: string;
  currentTechnicianId?: string;
  onSuccess?: () => void;
}

/**
 * Get list of technicians from mock data
 * In a real app, this would fetch from an API
 */
const getTechnicians = (): Technician[] => {
  // Try to get from localStorage or use mock data
  // For now, return mock technicians based on the mock auth data
  const mockTechnicians: Technician[] = [
    { id: '2', name: 'Technician User', email: 'technician@example.com' },
    { id: 'tech2', name: 'Jane Technician', email: 'jane.technician@example.com' },
    { id: 'tech3', name: 'Bob Technician', email: 'bob.technician@example.com' },
  ];

  // In a real app, you would:
  // 1. Fetch from API: GET /api/users?role=technician
  // 2. Or filter from a users list stored in context/state
  // 3. Or use a dedicated getTechnicians() function from utils

  return mockTechnicians;
};

const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  show,
  onHide,
  caseId,
  caseType,
  currentTechnicianId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast, setLoading } = useApp();
  const { addNotification } = useNotifications();
  
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>(
    currentTechnicianId || ''
  );
  const [loading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (show) {
      loadTechnicians();
      setSelectedTechnicianId(currentTechnicianId || '');
    }
  }, [show, currentTechnicianId]);

  const loadTechnicians = () => {
    try {
      const techs = getTechnicians();
      setTechnicians(techs);
    } catch (error) {
      console.error('Error loading technicians:', error);
      showToast(t('errors.loadFailed'), 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTechnicianId) {
      showToast(t('cases.chooseTechnician'), 'warning');
      return;
    }

    setLocalLoading(true);
    setLoading(true);

    try {
      const result = await assignTechnician(caseId, selectedTechnicianId);

      if (result) {
        showToast(t('cases.technicianAssignedSuccessfully'), 'success');
        
        // Notify the assigned technician
        const technician = technicians.find((t) => t.id === selectedTechnicianId);
        if (technician) {
          addNotification(
            t('cases.assignedNotification', {
              caseId: caseId.substring(0, 8),
              type: caseType || 'case',
            }),
            selectedTechnicianId
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
      console.error('Error assigning technician:', error);
      showToast(
        error?.message || t('cases.failedToAssignTechnician'),
        'error'
      );
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedTechnicianId(currentTechnicianId || '');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('cases.assignTechnician')}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t('cases.selectTechnician')}</Form.Label>
            <Form.Select
              value={selectedTechnicianId}
              onChange={(e) => setSelectedTechnicianId(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">{t('cases.chooseTechnician')}</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name}
                  {technician.email && ` (${technician.email})`}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              {t('cases.selectTechnicianHint')}
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
            disabled={loading || !selectedTechnicianId}
          >
            {loading ? t('common.loading') : t('common.assign')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AssignTechnicianModal;

