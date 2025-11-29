import React, { useState, useEffect, useMemo } from 'react';
import { Container, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCases, type Case } from '../../utils/mockData';
import { useApp } from '../../contexts/AppContext';
import { DataTable, type Column } from '../../components/common';
import { filterCases, getUniqueTypes, getAllStatuses, type CaseFilters } from '../../utils/caseFilters';

const AdminCases: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [filters, setFilters] = useState<CaseFilters>({
    status: '',
    type: '',
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
      showToast(t('errors.failedToLoadCases'), 'error');
    }
  };

  // Filter cases
  const filteredCases = useMemo(() => {
    return filterCases(allCases, filters);
  }, [allCases, filters]);

  // Get unique types for filter dropdown
  const uniqueTypes = useMemo(() => {
    return getUniqueTypes(allCases);
  }, [allCases]);

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: Column<Case>[] = [
    {
      header: t('cases.id'),
      accessor: (row) => <small className="text-muted">{row.id.substring(0, 8)}...</small>,
    },
    {
      header: t('cases.user'),
      accessor: (row) => <small>{row.userId}</small>,
    },
    {
      header: t('cases.type'),
      accessor: 'type',
    },
    {
      header: t('cases.status'),
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: t('cases.date'),
      accessor: (row) => <small>{formatDate(row.createdAt)}</small>,
    },
  ];

  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{t('cases.casesManagement')}</h1>
      </div>

      <DataTable
        data={filteredCases}
        columns={columns}
        onRowClick={(row) => navigate(`/cases/${row.id}`)}
        actions={(row) => (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/cases/${row.id}`);
            }}
          >
            {t('common.view')}
          </Button>
        )}
        filters={{
          status: {
            options: getAllStatuses(),
            value: filters.status,
            onChange: (value) => setFilters({ ...filters, status: value }),
          },
          type: {
            options: uniqueTypes,
            value: filters.type,
            onChange: (value) => setFilters({ ...filters, type: value }),
          },
          dateFrom: {
            value: filters.dateFrom,
            onChange: (value) => setFilters({ ...filters, dateFrom: value }),
          },
          dateTo: {
            value: filters.dateTo,
            onChange: (value) => setFilters({ ...filters, dateTo: value }),
          },
        }}
        emptyMessage={t('dataTable.noDataFound')}
        itemsPerPage={10}
      />
    </Container>
  );
};

export default AdminCases;

