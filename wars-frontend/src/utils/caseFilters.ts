import type { Case } from './mockData';

export interface CaseFilters {
  status: string;
  type: string;
  dateFrom: string;
  dateTo: string;
}

/**
 * Filter cases based on filters
 */
export const filterCases = (cases: Case[], filters: CaseFilters): Case[] => {
  return cases.filter((case_) => {
    // Status filter
    if (filters.status && case_.status !== filters.status) {
      return false;
    }

    // Type filter
    if (filters.type && case_.type !== filters.type) {
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
};

/**
 * Get unique issue types from cases
 */
export const getUniqueTypes = (cases: Case[]): string[] => {
  const types = new Set(cases.map((case_) => case_.type));
  return Array.from(types).sort();
};

/**
 * Get all possible statuses
 */
export const getAllStatuses = (): string[] => {
  return ['pending', 'in_progress', 'resolved'];
};

