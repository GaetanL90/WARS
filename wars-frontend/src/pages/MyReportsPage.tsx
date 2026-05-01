import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type InternalStatus = "new" | "pending" | "assigned" | "returned" | "escalated" | "resolved";

interface Report {
  id: number;
  issue_type: string;
  internal_status: InternalStatus;
  reported_at: string;
  description: string;
  location: string;
}

const MOCK_REPORTS: Report[] = [
  { id: 1024, issue_type: "Pipe Burst", internal_status: "resolved", reported_at: "2024-03-20 14:30", description: "Main pipe leaking near the primary school.", location: "Kagarama, Kanserege, Marembo" },
  { id: 1025, issue_type: "Water Contamination", internal_status: "assigned", reported_at: "2024-03-22 09:15", description: "Brown water coming from the tap since morning.", location: "Remera, Nyarutarama, Rukiri I" },
  { id: 1028, issue_type: "No Water", internal_status: "new", reported_at: "2024-03-25 18:45", description: "Total water outage for the last 12 hours.", location: "Kimironko, Bibare, Kibagabaga" },
  { id: 1029, issue_type: "Pipe Burst", internal_status: "pending", reported_at: "2024-03-26 10:20", description: "Small leak in the secondary pipe.", location: "Kicukiro, Niboye, Gatenga" },
  { id: 1030, issue_type: "Water Contamination", internal_status: "resolved", reported_at: "2024-03-27 15:10", description: "Suspicious smell in the water supply.", location: "Nyarugenge, Nyamirambo, Biryogo" },
  { id: 1031, issue_type: "Other", internal_status: "new", reported_at: "2024-03-28 08:45", description: "Water meter seems to be running too fast.", location: "Gasabo, Kacyiru, Kamatamu" },
  { id: 1032, issue_type: "No Water", internal_status: "assigned", reported_at: "2024-03-29 11:30", description: "Dry taps since last night.", location: "Kicukiro, Kanombe, Busanza" },
  { id: 1033, issue_type: "Pipe Burst", internal_status: "new", reported_at: "2024-03-30 16:00", description: "Large puddle forming on the street.", location: "Gasabo, Remera, Nyabisindu" },
];

export function MyReportsPage() {
  const navigate = useNavigate();
  const [reports] = useState<Report[]>(MOCK_REPORTS);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  // Sorting states
  const [sortConfig, setSortConfig] = useState<{ key: keyof Report; direction: 'asc' | 'desc' }>({ key: 'reported_at', direction: 'desc' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const mapToCitizenStatus = (status: InternalStatus) => {
    if (status === "new") return "New";
    if (status === "resolved") return "Resolved";
    return "Pending";
  };

  const getStatusClass = (status: InternalStatus) => {
    const citizenStatus = mapToCitizenStatus(status);
    switch (citizenStatus) {
      case "Resolved": return "status-resolved";
      case "Pending": return "status-assigned";
      case "New": return "status-pending";
      default: return "";
    }
  };

  // Sorting handler
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

  // Filtered and Sorted reports
  const processedReports = useMemo(() => {
    let filtered = reports.filter(report => {
      const citizenStatus = mapToCitizenStatus(report.internal_status).toLowerCase();
      const statusMatch = statusFilter === "all" || citizenStatus === statusFilter.toLowerCase();
      const typeMatch = typeFilter === "all" || report.issue_type.toLowerCase() === typeFilter.toLowerCase();
      return statusMatch && typeMatch;
    });

    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [reports, statusFilter, typeFilter, sortConfig]);

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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Submitted Reports</h1>
        <p>Track the status of issues you have reported to WARS.</p>
      </div>

      <div className="reports-filters card mb-16">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Filter by Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="input-field">
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Filter by Issue Type</label>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} className="input-field">
              <option value="all">All Types</option>
              <option value="pipe burst">Pipe Burst</option>
              <option value="water contamination">Water Contamination</option>
              <option value="no water">No Water</option>
              <option value="other">Other</option>
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
                      <td data-label="Reported At">{report.reported_at}</td>
                      <td data-label="Location">{report.location}</td>
                      <td data-label="Status">
                        <span className={`status-pill ${getStatusClass(report.internal_status)}`}>
                          {mapToCitizenStatus(report.internal_status)}
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
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>No reports found matching your criteria.</p>
            {(statusFilter !== 'all' || typeFilter !== 'all') && (
              <button 
                className="btn btn-outline mt-16" 
                onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
