/**
 * Cases API Service
 * API endpoint wrappers for case-related operations
 */

import api from './axios';
import type { Case, CaseStatus } from '../types';
import type { User } from '../types/User';

/**
 * Get all cases
 * @returns Promise that resolves with an array of cases
 */
export const getAllCases = async (): Promise<Case[]> => {
  const response = await api.get<Case[]>('/cases/');
  return response.data;
};

/**
 * Get a single case by ID
 * @param id - The ID of the case to retrieve
 * @returns Promise that resolves with the case
 */
export const getCase = async (id: string): Promise<Case> => {
  const response = await api.get<Case>(`/cases/${id}/`);
  return response.data;
};

/**
 * Assign a case to a technician
 * @param caseId - The ID of the case to assign
 * @param technicianId - The ID of the technician to assign
 * @returns Promise that resolves with the updated case
 */
export const assignCase = async (
  caseId: string,
  technicianId: string
): Promise<Case> => {
  const response = await api.patch<Case>(`/cases/${caseId}/assign/`, {
    technicianId,
  });
  return response.data;
};

/**
 * Assign a technician to a case (alias for assignCase)
 * @deprecated Use assignCase instead
 * @param caseId - The ID of the case to assign
 * @param technicianId - The ID of the technician to assign
 * @returns Promise that resolves with the updated case
 */
export const assignTechnician = async (
  caseId: string,
  technicianId: string
): Promise<Case> => {
  return assignCase(caseId, technicianId);
};

/**
 * Update case status
 * @param caseId - The ID of the case to update
 * @param status - The new status
 * @returns Promise that resolves with the updated case
 */
export const updateCaseStatus = async (
  caseId: string,
  status: CaseStatus
): Promise<Case> => {
  const response = await api.patch<Case>(`/cases/${caseId}/status/`, {
    status,
  });
  return response.data;
};

/**
 * Add a technician note to a case
 * @param caseId - The ID of the case
 * @param note - The note to add
 * @returns Promise that resolves with the updated case
 */
export const addTechnicianNote = async (
  caseId: string,
  note: string
): Promise<Case> => {
  const response = await api.post<Case>(`/cases/${caseId}/notes/`, {
    note,
  });
  return response.data;
};

/**
 * Get all technicians
 * @returns Promise that resolves with an array of technician users
 */
export const getTechnicians = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users/technicians/');
  return response.data;
};
