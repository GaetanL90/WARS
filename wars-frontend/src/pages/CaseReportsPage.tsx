import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type InternalStatus = "assigned" | "returned" | "resolved";
type Urgency = "critical" | "high" | "medium" | "low";

interface Report {
  id: number;
  issue_type: string;
  internal_status: InternalStatus;
  reported_at: string;
  resolved_at?: string;
  location: string;
  urgency: Urgency;
}

const MOCK_HANDLED_REPORTS: Report[] = [
  { id: 1024, issue_type: "Pipe Burst", internal_status: "resolved", reported_at: "2024-03-20 14:30", resolved_at: "2024-03-21 10:00", location: "Kagarama, Kanserege, Marembo", urgency: "high" },
  { id: 1026, issue_type: "Water Contamination", internal_status: "resolved", reported_at: "2024-03-22 09:15", resolved_at: "2024-03-23 15:30", location: "Remera, Nyarutarama, Rukiri I", urgency: "critical" },
  { id: 1027, issue_type: "No Water", internal_status: "returned", reported_at: "2024-03-24 08:00", location: "Kimironko, Bibare, Kibagabaga", urgency: "medium" },
  { id: 1030, issue_type: "Pipe Burst", internal_status: "resolved", reported_at: "2024-03-27 15:10", resolved_at: "2024-03-28 11:00", location: "Nyarugenge, Nyamirambo, Biryogo", urgency: "high" },
];

export function CaseReportsPage() {
  const navigate = useNavigate();
  const [reports] = useState<Report[]>(MOCK_HANDLED_REPORTS);
  
  // Sorting states
  const [sortConfig, setSortConfig] = useState<{ key: keyof Report; direction: 'asc' | 'desc' }>({ key: 'reported_at', direction: 'desc' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getUrgencyClass = (urgency: Urgency) => {
    switch (urgency) {
      case "critical": return "urgency-critical";
      case "high": return "urgency-high";
      case "medium": return "urgency-medium";
      case "low": return "urgency-low";
      default: return "";
    }
  };

  const getStatusClass = (status: InternalStatus) => {
    switch (status) {
      case "resolved": return "status-resolved";
      case "assigned": return "status-assigned";
      case "returned": return "status-pending";
      default: return "";
    }
  };

  // Sorting logic
  const requestSort = (key: keyof Report) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Report) => {
    if (sortConfig.key !== key) return (
      <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
      </svg>
    );
    return sortConfig.direction === 'asc' ? (
      <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    ) : (
      <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    );
  };

  // Processed reports (Sorted)
  const processedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      if (a[sortConfig.key]! < b[sortConfig.key]!) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key]! > b[sortConfig.key]!) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [reports, sortConfig]);

  // Paginated reports
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedReports.slice(startIndex, startIndex + itemsPerPage);
  }, [processedReports, currentPage]);

  const totalPages = Math.ceil(processedReports.length / itemsPerPage);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Case Reports</h1>
        <p>A comprehensive history of all cases you have handled and resolved.</p>
      </div>

      <div className="reports-card card">
        {paginatedReports.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort('id')} className={`sortable ${sortConfig.key === 'id' ? 'sort-active' : ''}`}>
                      Report ID {getSortIcon('id')}
                    </th>
                    <th onClick={() => requestSort('issue_type')} className={`sortable ${sortConfig.key === 'issue_type' ? 'sort-active' : ''}`}>
                      Issue Type {getSortIcon('issue_type')}
                    </th>
                    <th onClick={() => requestSort('urgency')} className={`sortable ${sortConfig.key === 'urgency' ? 'sort-active' : ''}`}>
                      Urgency {getSortIcon('urgency')}
                    </th>
                    <th onClick={() => requestSort('reported_at')} className={`sortable ${sortConfig.key === 'reported_at' ? 'sort-active' : ''}`}>
                      Reported At {getSortIcon('reported_at')}
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReports.map((report) => (
                    <tr key={report.id}>
                      <td data-label="Report ID"><span className="id-badge">#{report.id}</span></td>
                      <td data-label="Issue Type"><span className="issue-type-text">{report.issue_type}</span></td>
                      <td data-label="Urgency">
                        <span className={`urgency-pill ${getUrgencyClass(report.urgency)}`}>
                          {report.urgency}
                        </span>
                      </td>
                      <td data-label="Reported At">{report.reported_at}</td>
                      <td data-label="Status">
                        <span className={`status-pill ${getStatusClass(report.internal_status)}`}>
                          {report.internal_status}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <button 
                          className="btn btn-icon" 
                          title="View Details"
                          onClick={() => navigate(`/reports/${report.id}`)}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination mt-24">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <div className="pagination-info">
                  Page <strong>{currentPage}</strong> of {totalPages}
                </div>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No handled cases found in your history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
