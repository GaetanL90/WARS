import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Badge, Pagination, Form, Row, Col, Card, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getCases, updateCase, type Case } from '../../../utils/mockData';
import { useApp } from '../../../contexts/AppContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { getAllStatuses } from '../../../utils/caseFilters';

// Helper function to get user name from userId
// In a real app, this would fetch from an API
const getUserName = (userId: string): string => {
  // Try to get from localStorage userData cookie or mock users
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

  // Mock user mapping based on seed data
  const mockUsers: Record<string, string> = {
    '1': 'Admin User',
    '2': 'Responsible User',
    '3': 'Technician User',
    '4': 'Customer User',
    '5': 'Wasac Manager',
  };

  return mockUsers[userId] || userId;
};

// Mock technicians list
const mockTechnicians = [
  { id: '3', name: 'Technician User' },
  { id: 'tech2', name: 'Jane Technician' },
  { id: 'tech3', name: 'Bob Technician' },
];

interface CaseTableProps {
  onRefresh?: () => void;
}

const CaseTable: React.FC<CaseTableProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast, setLoading } = useApp();
  const { addNotification } = useNotifications();
  
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = () => {
    try {
      const cases = getCases();
      // Sort by most recent first
      const sorted = cases.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllCases(sorted);
    } catch (error) {
      showToast(t('errors.failedToLoadCases'), 'error');
    }
  };

  // Filter cases
  const filteredCases = useMemo(() => {
    return allCases.filter((case_) => {
      // Status filter
      if (filters.status && case_.status !== filters.status) {
        return false;
      }

      // Date filters
      const caseDate = new Date(case_.createdAt);
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (caseDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (caseDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [allCases, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCases = filteredCases.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.dateFrom, filters.dateTo]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleAssignClick = (case_: Case, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCase(case_);
    setSelectedTechnician(case_.assignedTechnician || '');
    setShowAssignModal(true);
  };

  const handleAssignTechnician = async () => {
    if (!selectedCase || !selectedTechnician) {
      showToast(t('caseDetails.pleaseSelectTechnician'), 'warning');
      return;
    }

    setLoading(true);
    try {
      const updated = updateCase(selectedCase.id, {
        assignedTechnician: selectedTechnician,
        status: 'in_progress',
      });

      if (updated) {
        loadCases();
        if (onRefresh) onRefresh();
        setShowAssignModal(false);
        showToast(t('caseDetails.technicianAssigned'), 'success');
        
        // Notify the assigned technician
        addNotification(
          t('caseDetails.assignedNotification', { caseId: updated.id.substring(0, 8), type: updated.type }),
          selectedTechnician
        );
      } else {
        showToast(t('caseDetails.failedToAssign'), 'error');
      }
    } catch (error) {
      showToast(t('caseDetails.failedToAssign'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (case_: Case, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/cases/${case_.id}`);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        pages.push(<Pagination.Ellipsis key="ellipsis-start" />);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<Pagination.Ellipsis key="ellipsis-end" />);
      }
      pages.push(
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <small className="text-muted">
            {t('dataTable.showing', { 
              start: startIndex + 1, 
              end: Math.min(endIndex, filteredCases.length), 
              total: filteredCases.length 
            })}
          </small>
        </div>
        <Pagination className="mb-0">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          />
          {pages}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          />
        </Pagination>
      </div>
    );
  };

  return (
    <>
      {/* Filters */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{t('dataTable.filters')}</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('dataTable.status')}</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">{t('dataTable.allStatuses')}</option>
                  {getAllStatuses().map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('dataTable.dateFrom')}</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('dataTable.dateTo')}</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>{t('caseDetails.caseId')}</th>
              <th>{t('caseTable.reporterName')}</th>
              <th>{t('caseTable.category')}</th>
              <th>{t('cases.location')}</th>
              <th>{t('caseTable.dateSubmitted')}</th>
              <th>{t('cases.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCases.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-5">
                  <p className="text-muted mb-0">{t('dataTable.noDataFound')}</p>
                </td>
              </tr>
            ) : (
              paginatedCases.map((case_) => (
                <tr key={case_.id}>
                  <td>
                    <small className="text-muted">{case_.id.substring(0, 8)}...</small>
                  </td>
                  <td>{getUserName(case_.userId)}</td>
                  <td>{case_.type}</td>
                  <td>
                    <small>{case_.location}</small>
                  </td>
                  <td>
                    <small>{formatDate(case_.createdAt)}</small>
                  </td>
                  <td>{getStatusBadge(case_.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => handleAssignClick(case_, e)}
                        disabled={case_.status === 'resolved'}
                      >
                        {t('caseDetails.assignTechnician')}
                      </Button>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={(e) => handleViewDetails(case_, e)}
                      >
                        {t('common.view')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Assign Technician Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
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
    </>
  );
};

export default CaseTable;

