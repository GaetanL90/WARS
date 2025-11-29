/**
 * Mock Data Storage Utility
 * Stores cases and user profiles in localStorage until backend is ready
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string; // Base64 or URL
  role: string;
  updatedAt: string;
}

export interface Case {
  id: string;
  userId: string;
  type: string;
  description: string;
  location: string;
  image?: string; // Base64 or URL
  status: 'pending' | 'in_progress' | 'resolved';
  assignedTechnician?: string; // Technician user ID
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'wars_mock_cases';
const PROFILE_STORAGE_KEY = 'wars_mock_profiles';

/**
 * Get user profile by ID
 */
export const getUserProfile = (userId: string): UserProfile | null => {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) return null;
    const profiles: UserProfile[] = JSON.parse(stored);
    return profiles.find(p => p.id === userId) || null;
  } catch (error) {
    console.error('Error reading user profile from localStorage:', error);
    return null;
  }
};

/**
 * Save or update user profile
 */
export const saveUserProfile = (profileData: Omit<UserProfile, 'updatedAt'>): UserProfile => {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    const profiles: UserProfile[] = stored ? JSON.parse(stored) : [];
    const existingIndex = profiles.findIndex(p => p.id === profileData.id);
    
    const profile: UserProfile = {
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
    
    if (existingIndex >= 0) {
      profiles[existingIndex] = profile;
    } else {
      profiles.push(profile);
    }
    
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
    return profile;
  } catch (error) {
    console.error('Error saving user profile to localStorage:', error);
    throw new Error('Failed to save user profile');
  }
};

/**
 * Get all cases from localStorage
 */
export const getCases = (): Case[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading cases from localStorage:', error);
    return [];
  }
};

/**
 * Get cases by userId
 */
export const getCasesByUserId = (userId: string): Case[] => {
  const allCases = getCases();
  return allCases.filter((case_) => case_.userId === userId);
};

/**
 * Get cases assigned to a technician
 */
export const getCasesByTechnician = (technicianId: string): Case[] => {
  const allCases = getCases();
  return allCases.filter((case_) => case_.assignedTechnician === technicianId);
};

/**
 * Get a single case by ID
 */
export const getCaseById = (id: string): Case | null => {
  const allCases = getCases();
  return allCases.find((case_) => case_.id === id) || null;
};

/**
 * Save a new case to localStorage
 */
export const saveCase = (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Case => {
  const allCases = getCases();
  
  const newCase: Case = {
    ...caseData,
    id: crypto.randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  allCases.push(newCase);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCases));
  } catch (error) {
    console.error('Error saving case to localStorage:', error);
    throw new Error('Failed to save case');
  }

  return newCase;
};

/**
 * Update an existing case
 */
export const updateCase = (id: string, updates: Partial<Case>): Case | null => {
  const allCases = getCases();
  const index = allCases.findIndex((case_) => case_.id === id);

  if (index === -1) {
    return null;
  }

  allCases[index] = {
    ...allCases[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCases));
    return allCases[index];
  } catch (error) {
    console.error('Error updating case in localStorage:', error);
    throw new Error('Failed to update case');
  }
};

/**
 * Delete a case
 */
export const deleteCase = (id: string): boolean => {
  const allCases = getCases();
  const filtered = allCases.filter((case_) => case_.id !== id);

  if (filtered.length === allCases.length) {
    return false; // Case not found
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting case from localStorage:', error);
    throw new Error('Failed to delete case');
  }
};

/**
 * Convert File to base64 string for storage
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Seed mock cases for testing
 * Creates sample cases for different users with various statuses
 */
export const seedMockCases = (): void => {
  // Check if cases already exist
  const existingCases = getCases();
  if (existingCases.length > 0) {
    // Cases already exist, don't seed again
    return;
  }

  const now = new Date();
  const mockCases: Case[] = [
    // Customer cases (userId: '4' - customer@example.com)
    {
      id: crypto.randomUUID(),
      userId: '4', // Customer user ID
      type: 'Leak',
      description: 'Water leak detected near the main pipeline in the residential area. Water is flowing continuously and causing flooding in the street.',
      location: 'Kacyiru, Kacyiru, Kacyiru, Nyarugenge, Kigali City',
      status: 'pending',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: '4',
      type: 'Contamination',
      description: 'Water has a strange smell and color. Residents are concerned about water quality and safety.',
      location: 'Gikondo, Kagarama, Gikondo, Kicukiro, Kigali City',
      status: 'in_progress',
      assignedTechnician: '3', // Assigned to technician (technician@example.com)
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: crypto.randomUUID(),
      userId: '4',
      type: 'No Water',
      description: 'No water supply for the past 3 days. All taps are dry and residents are unable to access water.',
      location: 'Bumbogo, Bumbogo, Bumbogo, Gasabo, Kigali City',
      status: 'resolved',
      assignedTechnician: '3',
      resolutionNotes: 'Water supply restored. Main valve was closed due to maintenance work. Valve has been reopened and water flow is normal.',
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: crypto.randomUUID(),
      userId: '4',
      type: 'Infrastructure Damage',
      description: 'Water pipe burst causing significant damage to the road and nearby structures. Immediate attention required.',
      location: 'Kimironko, Kimironko, Bumbogo, Gasabo, Kigali City',
      status: 'resolved',
      assignedTechnician: '3',
      resolutionNotes: 'Pipe replaced and road repaired. All infrastructure damage has been addressed.',
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    },
    {
      id: crypto.randomUUID(),
      userId: '4',
      type: 'Other',
      description: 'Water meter is not functioning properly. Readings are inaccurate and billing issues have occurred.',
      location: 'Remera, Remera, Bumbogo, Gasabo, Kigali City',
      status: 'pending',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: '4',
      type: 'Leak',
      description: 'Small leak in the garden tap. Water is being wasted continuously.',
      location: 'Gatsata, Gatsata, Gatsata, Gasabo, Kigali City',
      status: 'in_progress',
      assignedTechnician: '3',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    // Additional cases for other users (for admin/technician views)
    {
      id: crypto.randomUUID(),
      userId: '5', // Another user (wasac@example.com)
      type: 'Contamination',
      description: 'Water appears cloudy and has sediment. Multiple residents reporting the same issue.',
      location: 'Nyamirambo, Nyamirambo, Nyamirambo, Nyarugenge, Kigali City',
      status: 'pending',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: '5',
      type: 'No Water',
      description: 'Complete water outage in the building. All floors affected.',
      location: 'Jali, Jali, Jali, Gasabo, Kigali City',
      status: 'resolved',
      assignedTechnician: '3',
      resolutionNotes: 'Water supply restored. Issue was with the building main connection. Repaired and tested.',
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: crypto.randomUUID(),
      userId: '2', // Responsible user
      type: 'Infrastructure Damage',
      description: 'Water tower structure showing signs of damage. Safety concerns raised.',
      location: 'Kicukiro, Kicukiro, Kicukiro, Kicukiro, Kigali City',
      status: 'in_progress',
      assignedTechnician: '3',
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: crypto.randomUUID(),
      userId: '2',
      type: 'Leak',
      description: 'Major water leak from underground pipe. Street flooding reported.',
      location: 'Gahanga, Gahanga, Bumbogo, Gasabo, Kigali City',
      status: 'resolved',
      assignedTechnician: '3',
      resolutionNotes: 'Underground pipe repaired. Street cleared and water flow restored to normal.',
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
      updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    },
  ];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCases));
  } catch (error) {
    console.error('Error seeding mock cases:', error);
  }
};

