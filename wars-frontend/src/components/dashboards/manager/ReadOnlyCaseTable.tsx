import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Badge, Pagination, Form, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getCases, type Case } from '../../../utils/mockData';
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

interface ReadOnlyCaseTableProps {
  onRefresh?: () => void;
}

const ReadOnlyCaseTable: React.FC<ReadOnlyCaseTableProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
  });

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
      console.error('Failed to load cases:', error);
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
        {status === 'pending' ? t('status.pending') :
         status === 'in_progress' ? t('status.inProgress') :
         t('status.resolved')}
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
                      {status === 'pending' ? t('status.pending') :
                       status === 'in_progress' ? t('status.inProgress') :
                       t('status.resolved')}
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
                    <Button
                      variant="info"
                      size="sm"
                      onClick={(e) => handleViewDetails(case_, e)}
                    >
                      {t('common.view')}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </>
  );
};

export default ReadOnlyCaseTable;

