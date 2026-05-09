export type UserRole = "citizen" | "technician" | "manager" | "admin";

export interface AuthUser {
  user_id: number;
  role: UserRole;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  zone_id?: string;
  expertise?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState extends AuthTokens {
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  username?: string;
  phoneNumber: string;
  email: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  password: string;
  role: UserRole;
  zone_id?: string;
  expertise?: string;
}

export interface StartRegistrationResponse {
  registrationSessionId: string;
  email: string;
  message: string;
  otpDebugCode?: string;
}

export interface VerifyRegistrationOtpPayload {
  registrationSessionId: string;
  otpCode: string;
}

export interface ResendRegistrationOtpPayload {
  registrationSessionId: string;
}

export interface StartForgotPasswordPayload {
  email: string;
}

export interface StartForgotPasswordResponse {
  resetSessionId: string;
  email: string;
  message: string;
  otpDebugCode?: string;
}

export interface VerifyForgotPasswordOtpPayload {
  resetSessionId: string;
  otpCode: string;
}

export interface VerifyForgotPasswordOtpResponse {
  resetToken: string;
  message: string;
}

export interface ResendForgotPasswordOtpPayload {
  resetSessionId: string;
}

export interface CompleteForgotPasswordPayload {
  resetToken: string;
  newPassword: string;
}
