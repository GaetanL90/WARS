import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type InternalStatus = "assigned" | "returned" | "resolved";
type Urgency = "critical" | "high" | "medium" | "low";

interface Report {
  id: number;
  issue_type: string;
  internal_status: InternalStatus;
  reported_at: string;
  location: string;
  urgency: Urgency;
  return_reason?: string;
}

const MOCK_ASSIGNED_REPORTS: Report[] = [
  { id: 1025, issue_type: "Water Contamination", internal_status: "assigned", reported_at: "2024-03-22 09:15", location: "Remera, Nyarutarama, Rukiri I", urgency: "critical" },
  { id: 1029, issue_type: "Pipe Burst", internal_status: "assigned", reported_at: "2024-03-26 10:20", location: "Kicukiro, Niboye, Gatenga", urgency: "medium" },
  { id: 1032, issue_type: "No Water", internal_status: "assigned", reported_at: "2024-03-29 11:30", location: "Kicukiro, Kanombe, Busanza", urgency: "high" },
  { id: 1034, issue_type: "Other", internal_status: "assigned", reported_at: "2024-03-31 14:00", location: "Gasabo, Kacyiru, Kamatamu", urgency: "low" },
  { id: 1035, issue_type: "Pipe Burst", internal_status: "assigned", reported_at: "2024-04-01 09:00", location: "Nyarugenge, Nyamirambo, Biryogo", urgency: "critical" },
  { id: 1036, issue_type: "Water Contamination", internal_status: "assigned", reported_at: "2024-04-02 11:45", location: "Gasabo, Remera, Nyabisindu", urgency: "medium" },
];

export function AssignedReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>(MOCK_ASSIGNED_REPORTS);
  
  // Filter states
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  
  // Sorting states
  const [sortConfig, setSortConfig] = useState<{ key: keyof Report; direction: 'asc' | 'desc' }>({ key: 'reported_at', direction: 'desc' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Status update states
  const [updatingReport, setUpdatingReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<InternalStatus>("resolved");
  const [returnReason, setReturnReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  // Processed reports (Filtered & Sorted)
  const processedReports = useMemo(() => {
    let filtered = reports.filter(report => {
      const urgencyMatch = urgencyFilter === "all" || report.urgency === urgencyFilter;
      return urgencyMatch;
    });

    return filtered.sort((a, b) => {
      // Urgency priority mapping
      if (sortConfig.key === 'urgency') {
        const priority: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        const valA = priority[a.urgency as string] || 0;
        const valB = priority[b.urgency as string] || 0;
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }

      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (valA === undefined || valB === undefined) return 0;

      if (valA < valB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [reports, urgencyFilter, sortConfig]);

  // Paginated reports
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedReports.slice(startIndex, startIndex + itemsPerPage);
  }, [processedReports, currentPage]);

  const totalPages = Math.ceil(processedReports.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = () => {
    if (!updatingReport) return;
    if (newStatus === "returned" && !returnReason.trim()) {
      alert("Please provide a reason for returning this case.");
      return;
    }
    setIsSaving(true);
    
    setTimeout(() => {
      setReports(prev => prev.map(r => r.id === updatingReport.id ? { ...r, internal_status: newStatus, return_reason: newStatus === "returned" ? returnReason : undefined } : r));
      setIsSaving(false);
      setUpdatingReport(null);
      setReturnReason("");
    }, 800);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Assigned Case</h1>
        <p>Manage and update reports assigned to you for resolution.</p>
      </div>

      <div className="reports-filters card mb-16">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Filter by Urgency</label>
            <select value={urgencyFilter} onChange={(e) => { setUrgencyFilter(e.target.value); setCurrentPage(1); }} className="input-field">
              <option value="all">All Urgency Levels</option>
              <option value="critical">Critical Urgency</option>
              <option value="high">High Urgency</option>
              <option value="medium">Medium Urgency</option>
              <option value="low">Low Urgency</option>
            </select>
          </div>
        </div>
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
                    <th>Location</th>
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
                      <td data-label="Location">{report.location}</td>
                      <td data-label="Status">
                        <span className={`status-pill ${getStatusClass(report.internal_status)}`}>
                          {report.internal_status}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <button className="btn btn-sm btn-outline" onClick={() => navigate(`/reports/${report.id}`)}>Details</button>
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
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <div className="pagination-info">
                  Page <strong>{currentPage}</strong> of {totalPages}
                </div>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#e0e9f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <circle cx="12" cy="13" r="4"></circle>
              <line x1="12" y1="9" x2="12" y2="13"></line>
            </svg>
            <p>No assigned reports matching your criteria.</p>
            {urgencyFilter !== 'all' && (
              <button 
                className="btn btn-outline mt-16" 
                onClick={() => setUrgencyFilter('all')}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {updatingReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2>Update Case #{updatingReport.id}</h2>
            <p className="mb-16">Select the new status for this case.</p>
            
            <div className="filter-group mb-16">
              <label>New Status</label>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value as InternalStatus)} 
                className="input-field"
              >
                <option value="resolved">Resolved</option>
                <option value="returned">Return (Escalate to Manager)</option>
              </select>
            </div>

            {newStatus === "returned" && (
              <div className="filter-group mb-24">
                <label>Reason for Return</label>
                <textarea 
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Explain why this case is being returned/escalated..."
                  className="input-field"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  required
                />
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={isSaving}>
                {isSaving ? "Updating..." : "Confirm Update"}
              </button>
              <button className="btn btn-outline" onClick={() => { setUpdatingReport(null); setReturnReason(""); }} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
