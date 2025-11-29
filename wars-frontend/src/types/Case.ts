/**
 * Case Status
 */
export const CaseStatus = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export type CaseStatus = typeof CaseStatus[keyof typeof CaseStatus];

/**
 * Case Priority
 */
export const CasePriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type CasePriority = typeof CasePriority[keyof typeof CasePriority];

/**
 * Case Interface
 * Represents a water issue case/report in the system
 */
export interface Case {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: CaseStatus;
  reportedBy: string; // User ID who reported the case
  assignedTo?: string; // User ID of assigned technician/admin
  priority: CasePriority;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  images?: string[]; // Array of image URLs or base64 strings
}

