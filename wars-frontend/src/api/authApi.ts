import {
  CompleteForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResendForgotPasswordOtpPayload,
  ResendRegistrationOtpPayload,
  StartForgotPasswordPayload,
  StartForgotPasswordResponse,
  StartRegistrationResponse,
  VerifyForgotPasswordOtpPayload,
  VerifyForgotPasswordOtpResponse,
  VerifyRegistrationOtpPayload
} from "../auth/types";
import type { AuthState, AuthUser } from "../auth/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const USE_MOCK_AUTH = (import.meta.env.VITE_USE_MOCK_AUTH ?? "true") === "true";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string | null;
}

interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

interface RegisterResponseData {
  user_id: number;
  email: string;
  role: AuthUser["role"];
}

interface MockUserRecord {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  password: string;
  enabled?: boolean;
  phoneNumber?: string;
  zone_id?: string;
  address?: {
    district: string;
    sector: string;
    cell: string;
    village: string;
  };
  role: AuthUser["role"];
  expertise?: string;
}

interface PendingRegistration {
  registrationSessionId: string;
  otpCode: string;
  payload: RegisterPayload;
}

interface PendingPasswordReset {
  resetSessionId: string;
  email: string;
  otpCode: string;
  verified: boolean;
  resetToken?: string;
}

export const mockUsers: MockUserRecord[] = [
  { user_id: 1, username: "admin", full_name: "Admin User", email: "admin@wars.local", password: "123456", enabled: true, role: "admin", zone_id: "zone-a" },
  { user_id: 2, username: "manager", full_name: "Manager User", email: "manager@wars.local", password: "123456", enabled: true, role: "manager", zone_id: "zone-a" },
  { user_id: 3, username: "jp_habimana", full_name: "Jean-Pierre Habimana", email: "jp.habimana@wars.rw", password: "123456", enabled: true, role: "technician", zone_id: "Bugesera", expertise: "IoT & Sensors" },
  { user_id: 4, username: "y_mukamana", full_name: "Yvonne Mukamana", email: "y.mukamana@wars.rw", password: "123456", enabled: true, role: "technician", zone_id: "Bugesera", expertise: "Pipe Infrastructure" },
  { user_id: 5, username: "m_uwase", full_name: "Marie-Louise Uwase", email: "m.uwase@wars.rw", password: "123456", enabled: true, role: "technician", zone_id: "Kicukiro", expertise: "Water Quality Specialist" },
  { user_id: 6, username: "j_nyirahabimana", full_name: "Jean-Paul Nyirahabimana", email: "j.nyirahabimana@wars.rw", password: "123456", enabled: true, role: "technician", zone_id: "Gasabo", expertise: "Water Treatment Specialist" },
  { user_id: 7, username: "j_musoni", full_name: "Jean-Claude Musoni", email: "j.musoni@wars.rw", password: "123456", enabled: true, role: "technician", zone_id: "Kicukiro", expertise: "Water Quality Specialist" },
  { user_id: 8, username: "citizen", full_name: "Citizen User", email: "citizen@wars.local", password: "123456", enabled: true, role: "citizen", zone_id: "zone-a" },
  { user_id: 9, username: "technician", full_name: "Technician User", email: "technician@wars.local", password: "123456", enabled: true, role: "technician", zone_id: "zone-a", expertise: "Water Infrustructure Specialist" }

];
const pendingRegistrations: PendingRegistration[] = [];
const pendingPasswordResets: PendingPasswordReset[] = [];

function createMockToken(prefix: string, user: MockUserRecord): string {
  return `${prefix}-${user.role}-${user.user_id}-${Date.now()}`;
}

async function loginMock(payload: LoginPayload): Promise<AuthState> {
  const user = mockUsers.find((item) => item.email === payload.email && item.password === payload.password);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  return {
    accessToken: createMockToken("mock-access", user),
    refreshToken: createMockToken("mock-refresh", user),
    user: {
      user_id: user.user_id,
      role: user.role,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      phone: user.phoneNumber,
      zone_id: user.zone_id,
      expertise: user.expertise
    }
  };
}

async function registerMock(payload: RegisterPayload): Promise<RegisterResponseData> {
  const existing = mockUsers.find((item) => item.email === payload.email);
  if (existing) {
    throw new Error("Email already exists");
  }

  const nextId = Math.max(...mockUsers.map((item) => item.user_id)) + 1;
  const fullName = [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ");
  const created: MockUserRecord = {
    user_id: nextId,
    username: payload.username || payload.email.split('@')[0],
    full_name: fullName,
    email: payload.email,
    password: payload.password,
    phoneNumber: payload.phoneNumber,
    zone_id: payload.zone_id,
    address: {
      district: payload.district,
      sector: payload.sector,
      cell: payload.cell,
      village: payload.village
    },
    role: payload.role,
    expertise: payload.expertise
  };

  mockUsers.push(created);

  return {
    user_id: created.user_id,
    email: created.email,
    role: created.role
  };
}

function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function startRegistrationMock(payload: RegisterPayload): Promise<StartRegistrationResponse> {
  const existing = mockUsers.find((item) => item.email === payload.email);
  if (existing) {
    throw new Error("Email already exists");
  }

  pendingRegistrations.forEach((item, index) => {
    if (item.payload.email === payload.email) {
      pendingRegistrations.splice(index, 1);
    }
  });

  const otpCode = generateOtpCode();
  const registrationSessionId = `reg-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
  pendingRegistrations.push({
    registrationSessionId,
    otpCode,
    payload
  });

  return {
    registrationSessionId,
    email: payload.email,
    message: "Verification code sent to email",
    otpDebugCode: otpCode
  };
}

async function verifyRegistrationOtpMock(payload: VerifyRegistrationOtpPayload): Promise<RegisterResponseData> {
  const pending = pendingRegistrations.find((item) => item.registrationSessionId === payload.registrationSessionId);
  if (!pending) {
    throw new Error("Registration session expired. Please register again.");
  }

  if (pending.otpCode !== payload.otpCode) {
    throw new Error("Invalid OTP code");
  }

  const response = await registerMock(pending.payload);
  const index = pendingRegistrations.findIndex((item) => item.registrationSessionId === payload.registrationSessionId);
  if (index >= 0) {
    pendingRegistrations.splice(index, 1);
  }

  return response;
}

async function resendRegistrationOtpMock(payload: ResendRegistrationOtpPayload): Promise<StartRegistrationResponse> {
  const pending = pendingRegistrations.find((item) => item.registrationSessionId === payload.registrationSessionId);
  if (!pending) {
    throw new Error("Registration session expired. Please register again.");
  }

  pending.otpCode = generateOtpCode();

  return {
    registrationSessionId: pending.registrationSessionId,
    email: pending.payload.email,
    message: "A new verification code has been sent",
    otpDebugCode: pending.otpCode
  };
}

async function startForgotPasswordMock(payload: StartForgotPasswordPayload): Promise<StartForgotPasswordResponse> {
  const user = mockUsers.find((item) => item.email === payload.email);
  if (!user || user.enabled === false) {
    throw new Error("Account not found or disabled");
  }

  const resetSessionId = `pw-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
  const otpCode = generateOtpCode();

  pendingPasswordResets.push({
    resetSessionId,
    email: payload.email,
    otpCode,
    verified: false
  });

  return {
    resetSessionId,
    email: payload.email,
    message: "Password reset OTP sent to email",
    otpDebugCode: otpCode
  };
}

async function verifyForgotPasswordOtpMock(payload: VerifyForgotPasswordOtpPayload): Promise<VerifyForgotPasswordOtpResponse> {
  const pending = pendingPasswordResets.find((item) => item.resetSessionId === payload.resetSessionId);
  if (!pending) {
    throw new Error("Reset session expired. Start again.");
  }

  if (pending.otpCode !== payload.otpCode) {
    throw new Error("Invalid OTP code");
  }

  pending.verified = true;
  pending.resetToken = `reset-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;

  return {
    resetToken: pending.resetToken,
    message: "OTP verified"
  };
}

async function resendForgotPasswordOtpMock(payload: ResendForgotPasswordOtpPayload): Promise<StartForgotPasswordResponse> {
  const pending = pendingPasswordResets.find((item) => item.resetSessionId === payload.resetSessionId);
  if (!pending) {
    throw new Error("Reset session expired. Start again.");
  }

  pending.otpCode = generateOtpCode();
  return {
    resetSessionId: pending.resetSessionId,
    email: pending.email,
    message: "A new password reset OTP has been sent",
    otpDebugCode: pending.otpCode
  };
}

async function completeForgotPasswordMock(payload: CompleteForgotPasswordPayload): Promise<{ message: string }> {
  const pending = pendingPasswordResets.find((item) => item.resetToken === payload.resetToken && item.verified);
  if (!pending) {
    throw new Error("Invalid or expired reset token");
  }

  const user = mockUsers.find((item) => item.email === pending.email);
  if (!user || user.enabled === false) {
    throw new Error("Account not found or disabled");
  }

  user.password = payload.newPassword;
  const index = pendingPasswordResets.findIndex((item) => item.resetToken === payload.resetToken);
  if (index >= 0) {
    pendingPasswordResets.splice(index, 1);
  }

  return { message: "Password reset successful" };
}

async function requestJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload.data;
}

export async function login(payload: LoginPayload): Promise<AuthState> {
  if (USE_MOCK_AUTH) {
    return loginMock(payload);
  }

  const data = await requestJson<LoginResponseData>("/auth/login", payload);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: data.user
  };
}

export async function register(payload: RegisterPayload): Promise<RegisterResponseData> {
  if (USE_MOCK_AUTH) {
    return registerMock(payload);
  }

  return requestJson<RegisterResponseData>("/auth/register", payload);
}

export async function startRegistration(payload: RegisterPayload): Promise<StartRegistrationResponse> {
  if (USE_MOCK_AUTH) {
    return startRegistrationMock(payload);
  }

  return requestJson<StartRegistrationResponse>("/auth/register", payload);
}

export async function verifyRegistrationOtp(payload: VerifyRegistrationOtpPayload): Promise<RegisterResponseData> {
  if (USE_MOCK_AUTH) {
    return verifyRegistrationOtpMock(payload);
  }

  return requestJson<RegisterResponseData>("/auth/register/verify-otp", payload);
}

export async function resendRegistrationOtp(payload: ResendRegistrationOtpPayload): Promise<StartRegistrationResponse> {
  if (USE_MOCK_AUTH) {
    return resendRegistrationOtpMock(payload);
  }

  return requestJson<StartRegistrationResponse>("/auth/register/resend-otp", payload);
}

export async function startForgotPassword(payload: StartForgotPasswordPayload): Promise<StartForgotPasswordResponse> {
  if (USE_MOCK_AUTH) {
    return startForgotPasswordMock(payload);
  }

  return requestJson<StartForgotPasswordResponse>("/auth/forgot-password", payload);
}

export async function verifyForgotPasswordOtp(
  payload: VerifyForgotPasswordOtpPayload
): Promise<VerifyForgotPasswordOtpResponse> {
  if (USE_MOCK_AUTH) {
    return verifyForgotPasswordOtpMock(payload);
  }

  return requestJson<VerifyForgotPasswordOtpResponse>("/auth/forgot-password/verify-otp", payload);
}

export async function completeForgotPassword(payload: CompleteForgotPasswordPayload): Promise<{ message: string }> {
  if (USE_MOCK_AUTH) {
    return completeForgotPasswordMock(payload);
  }

  return requestJson<{ message: string }>("/auth/forgot-password/reset", payload);
}

export async function resendForgotPasswordOtp(payload: ResendForgotPasswordOtpPayload): Promise<StartForgotPasswordResponse> {
  if (USE_MOCK_AUTH) {
    return resendForgotPasswordOtpMock(payload);
  }

  return requestJson<StartForgotPasswordResponse>("/auth/forgot-password/resend-otp", payload);
}

// User Management Functions
export async function searchUsers(query: string): Promise<AuthUser[]> {
  if (USE_MOCK_AUTH) {
    const lowerQuery = query.toLowerCase();
    return mockUsers
      .filter(u => u.email.toLowerCase().includes(lowerQuery) || (u.phoneNumber && u.phoneNumber.includes(query)) || u.username.toLowerCase().includes(lowerQuery))
      .map(u => ({ 
        user_id: u.user_id, 
        username: u.username,
        full_name: u.full_name, 
        email: u.email, 
        role: u.role,
        phone: u.phoneNumber,
        zone_id: u.zone_id,
        expertise: u.expertise
      }));
  }
  // Fallback for real API
  return [];
}

export async function promoteToTechnician(userId: number): Promise<void> {
  if (USE_MOCK_AUTH) {
    const user = mockUsers.find(u => u.user_id === userId);
    if (user) {
      user.role = "technician";
    }
    return;
  }
}

export async function demoteToCitizen(userId: number): Promise<void> {
  if (USE_MOCK_AUTH) {
    const user = mockUsers.find(u => u.user_id === userId);
    if (user) {
      user.role = "citizen";
    }
    return;
  }
}

export async function createTechnician(payload: RegisterPayload): Promise<void> {
  if (USE_MOCK_AUTH) {
    await registerMock({ ...payload, role: "technician" });
    return;
  }
  // Fallback for real API
}

export async function getTechnicians(): Promise<AuthUser[]> {
  if (USE_MOCK_AUTH) {
    return mockUsers
      .filter(u => u.role === "technician")
      .map(u => ({ 
        user_id: u.user_id, 
        username: u.username,
        full_name: u.full_name, 
        email: u.email, 
        role: u.role,
        phone: u.phoneNumber,
        zone_id: u.zone_id,
        expertise: u.expertise
      }));
  }
  return [];
}

export async function updateUser(userId: number, updates: Partial<AuthUser>): Promise<void> {
  if (USE_MOCK_AUTH) {
    const user = mockUsers.find(u => u.user_id === userId);
    if (user) {
      if (updates.full_name) user.full_name = updates.full_name;
      if (updates.email) user.email = updates.email;
      if (updates.role) user.role = updates.role;
      if (updates.phone) user.phoneNumber = updates.phone;
      if (updates.zone_id) user.zone_id = updates.zone_id;
      if (updates.expertise) user.expertise = updates.expertise;
    }
    return;
  }
}

// Admin Specific Functions
export async function getAllUsers(): Promise<AuthUser[]> {
  if (USE_MOCK_AUTH) {
    return mockUsers.map(u => ({
      user_id: u.user_id,
      username: u.username,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      phone: u.phoneNumber,
      zone_id: u.zone_id,
      expertise: u.expertise
    }));
  }
  return [];
}

export async function deleteUser(userId: number): Promise<void> {
  if (USE_MOCK_AUTH) {
    const index = mockUsers.findIndex(u => u.user_id === userId);
    if (index >= 0) {
      mockUsers.splice(index, 1);
    }
    return;
  }
}

export interface SystemLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export async function getSystemLogs(): Promise<SystemLog[]> {
  return [
    { id: "LOG-001", action: "USER_PROMOTION", user: "Admin", timestamp: new Date().toISOString(), details: "Promoted user 8 to technician" },
    { id: "LOG-002", action: "ZONE_CREATED", user: "Manager", timestamp: new Date(Date.now() - 3600000).toISOString(), details: "Created zone 'Bugesera East'" },
    { id: "LOG-003", action: "SECURITY_ALERT", user: "System", timestamp: new Date(Date.now() - 7200000).toISOString(), details: "Multiple failed login attempts from 192.168.1.1" },
    { id: "LOG-004", action: "CONFIG_CHANGE", user: "Admin", timestamp: new Date(Date.now() - 86400000).toISOString(), details: "Updated turbidity threshold to 5.0 NTU" },
  ];
}


