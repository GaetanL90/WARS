import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Pagination, Form, Row, Col, Card } from 'react-bootstrap';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  itemsPerPage?: number;
  filters?: {
    status?: {
      options: string[];
      value: string;
      onChange: (value: string) => void;
    };
    type?: {
      options: string[];
      value: string;
      onChange: (value: string) => void;
    };
    dateFrom?: {
      value: string;
      onChange: (value: string) => void;
    };
    dateTo?: {
      value: string;
      onChange: (value: string) => void;
    };
  };
  emptyMessage?: string;
}

function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  actions,
  itemsPerPage = 10,
  filters,
  emptyMessage,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const defaultEmptyMessage = emptyMessage || t('dataTable.noDataFound');

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // Reset to page 1 when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            {t('dataTable.showing', { start: startIndex + 1, end: Math.min(endIndex, data.length), total: data.length })}
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

  const renderCell = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor] as React.ReactNode;
  };

  return (
    <div>
      {/* Filters */}
      {filters && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">{t('dataTable.filters')}</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {filters.status && (
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>{t('dataTable.status')}</Form.Label>
                    <Form.Select
                      value={filters.status.value}
                      onChange={(e) => filters.status!.onChange(e.target.value)}
                    >
                      <option value="">{t('dataTable.allStatuses')}</option>
                      {filters.status.options.map((option) => (
                        <option key={option} value={option}>
                          {option.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              {filters.type && (
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>{t('dataTable.issueType')}</Form.Label>
                    <Form.Select
                      value={filters.type.value}
                      onChange={(e) => filters.type!.onChange(e.target.value)}
                    >
                      <option value="">{t('dataTable.allTypes')}</option>
                      {filters.type.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              {filters.dateFrom && (
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>{t('dataTable.dateFrom')}</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateFrom.value}
                      onChange={(e) => filters.dateFrom!.onChange(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              )}
              {filters.dateTo && (
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>{t('dataTable.dateTo')}</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateTo.value}
                      onChange={(e) => filters.dateTo!.onChange(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Table */}
      {data.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">{defaultEmptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th key={index}>{column.header}</th>
                  ))}
                  {actions && <th>{t('common.actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    style={onRowClick ? { cursor: 'pointer' } : {}}
                  >
                    {columns.map((column, index) => (
                      <td key={index}>{renderCell(row, column)}</td>
                    ))}
                    {actions && (
                      <td onClick={(e) => e.stopPropagation()}>{actions(row)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
}

export default DataTable;

