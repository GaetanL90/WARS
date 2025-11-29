/**
 * Mock API Service for Authentication
 * Simulates backend API calls with network delays
 */

// Simulated network delay (in milliseconds)
const NETWORK_DELAY = 1000;

// Mock user database
interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'technician' | 'customer' | 'wasac_manager' | 'responsible';
  phone?: string;
  isVerified: boolean;
}

const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    phone: '+250788123456',
    isVerified: true,
  },
  {
    id: '2',
    email: 'technician@example.com',
    password: 'technician123',
    name: 'Technician User',
    role: 'technician',
    phone: '+250788123457',
    isVerified: true,
  },
  {
    id: '3',
    email: 'customer@example.com',
    password: 'customer123',
    name: 'Customer User',
    role: 'customer',
    phone: '+250788123458',
    isVerified: true,
  },
  {
    id: '4',
    email: 'wasac@example.com',
    password: 'wasac123',
    name: 'Wasac Manager',
    role: 'wasac_manager',
    phone: '+250788123459',
    isVerified: true,
  },
  {
    id: '5',
    email: 'responsible@example.com',
    password: 'responsible123',
    name: 'Responsible User',
    role: 'responsible',
    phone: '+250788123460',
    isVerified: true,
  },
];

// Store for pending registrations (email -> OTP)
const pendingRegistrations: Record<string, string> = {};

// Store for password reset OTPs (email -> OTP)
const passwordResetOTPs: Record<string, string> = {};

/**
 * Generate a mock JWT token with user data
 */
const generateMockJWT = (user: MockUser): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      user_id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      iat: Math.floor(Date.now() / 1000),
    })
  );
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

/**
 * Generate a 6-digit OTP
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Mock Login API
 * Simulates user login and returns JWT tokens
 */
export const mockLogin = async (
  email: string,
  password: string
): Promise<{
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        reject({
          response: {
            status: 401,
            data: {
              detail: 'Invalid email or password',
            },
          },
        });
        return;
      }

      if (!user.isVerified) {
        reject({
          response: {
            status: 403,
            data: {
              detail: 'Email not verified. Please verify your email first.',
            },
          },
        });
        return;
      }

      const accessToken = generateMockJWT(user);
      const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;

      resolve({
        access: accessToken,
        refresh: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      });
    }, NETWORK_DELAY);
  });
};

/**
 * Mock Signup API
 * Simulates user registration and sends OTP
 */
export const mockSignup = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
}): Promise<{
  message: string;
  email: string;
}> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if user already exists
      const existingUser = mockUsers.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (existingUser) {
        reject({
          response: {
            status: 400,
            data: {
              detail: 'User with this email already exists',
            },
          },
        });
        return;
      }

      // Validate password
      if (data.password.length < 8) {
        reject({
          response: {
            status: 400,
            data: {
              detail: 'Password must be at least 8 characters long',
            },
          },
        });
        return;
      }

      // Generate and store OTP
      const otp = generateOTP();
      pendingRegistrations[data.email.toLowerCase()] = otp;

      // In a real app, OTP would be sent via email/SMS
      console.log(`[MOCK] OTP for ${data.email}: ${otp}`);

      resolve({
        message: 'Registration successful. OTP sent to your email.',
        email: data.email,
      });
    }, NETWORK_DELAY);
  });
};

/**
 * Mock OTP Verification API
 * Verifies OTP for email verification
 */
export const mockVerifyOTP = async (email: string, otp: string): Promise<{
  message: string;
  verified: boolean;
}> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const storedOTP = pendingRegistrations[email.toLowerCase()];

      if (!storedOTP) {
        reject({
          response: {
            status: 400,
            data: {
              detail: 'No pending verification found for this email',
            },
          },
        });
        return;
      }

      if (storedOTP !== otp) {
        reject({
          response: {
            status: 400,
            data: {
              detail: 'Invalid OTP. Please try again.',
            },
          },
        });
        return;
      }

      // Remove OTP from pending registrations
      delete pendingRegistrations[email.toLowerCase()];

      resolve({
        message: 'Email verified successfully',
        verified: true,
      });
    }, NETWORK_DELAY);
  });
};

/**
 * Mock Resend OTP API
 * Resends OTP for email verification
 */
export const mockResendOTP = async (email: string): Promise<{
  message: string;
}> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if there's a pending registration
      if (!pendingRegistrations[email.toLowerCase()]) {
        reject({
          response: {
            status: 400,
            data: {
              detail: 'No pending verification found for this email',
            },
          },
        });
        return;
      }

      // Generate new OTP
      const otp = generateOTP();
      pendingRegistrations[email.toLowerCase()] = otp;

      // In a real app, OTP would be sent via email/SMS
      console.log(`[MOCK] New OTP for ${email}: ${otp}`);

      resolve({
        message: 'OTP has been resent to your email',
      });
    }, NETWORK_DELAY / 2); // Faster response for resend
  });
};

/**
 * Mock Request Password Reset API
 * Sends OTP for password reset
 */
export const mockRequestPasswordReset = async (email: string): Promise<{
  message: string;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        // Don't reveal if user exists (security best practice)
        resolve({
          message: 'If an account exists with this email, a reset OTP has been sent',
        });
        return;
      }

      // Generate and store OTP
      const otp = generateOTP();
      passwordResetOTPs[email.toLowerCase()] = otp;

      // In a real app, OTP would be sent via email/SMS
      console.log(`[MOCK] Password reset OTP for ${email}: ${otp}`);

      resolve({
        message: 'If an account exists with this email, a reset OTP has been sent',
      });
    }, NETWORK_DELAY);
  });
};

/**
 * Mock Reset Password API
 * Resets password using OTP
 */
export const mockResetPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{
  message: string;
}> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const storedOTP = passwordResetOTPs[data.email.toLowerCase()];

      if (!storedOTP) {
        reject({
          response: {
            status: 400,
            data: {
              detail: 'Invalid or expired OTP',
            },
          },
        });
        return;
      }

      if (storedOTP !== data.otp) {
        reject({
          response: {
            status: 400,
            data: {
              detail: 'Invalid OTP. Please try again.',
            },
          },
        });
        return;
      }

      // Validate new password
      if (data.newPassword.length < 8) {
        reject({
          response: {
            status: 400,
            data: {
              detail: 'Password must be at least 8 characters long',
            },
          },
        });
        return;
      }

      // Update password in mock database
      const user = mockUsers.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (user) {
        user.password = data.newPassword;
      }

      // Remove OTP
      delete passwordResetOTPs[data.email.toLowerCase()];

      resolve({
        message: 'Password reset successfully',
      });
    }, NETWORK_DELAY);
  });
};

/**
 * Mock Get User Role API
 * Fetches user role from JWT token or user ID
 */
export const mockGetUserRole = async (userId?: string, token?: string): Promise<{
  role: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let user: MockUser | undefined;

      if (userId) {
        user = mockUsers.find((u) => u.id === userId);
      } else if (token) {
        // Decode token to get user info
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            user = mockUsers.find((u) => u.id === payload.user_id || u.email === payload.email);
          }
        } catch (error) {
          // Invalid token format
        }
      }

      if (!user) {
        reject({
          response: {
            status: 404,
            data: {
              detail: 'User not found',
            },
          },
        });
        return;
      }

      resolve({
        role: user.role,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      });
    }, NETWORK_DELAY / 2); // Faster response for role fetch
  });
};

/**
 * Mock Refresh Token API
 * Refreshes access token using refresh token
 */
export const mockRefreshToken = async (refreshToken: string): Promise<{
  access: string;
}> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Extract user ID from refresh token (mock format: mock-refresh-token-{userId}-{timestamp})
      const match = refreshToken.match(/mock-refresh-token-(\d+)-/);
      
      if (!match) {
        reject({
          response: {
            status: 401,
            data: {
              detail: 'Invalid refresh token',
            },
          },
        });
        return;
      }

      const userId = match[1];
      const user = mockUsers.find((u) => u.id === userId);

      if (!user) {
        reject({
          response: {
            status: 401,
            data: {
              detail: 'Invalid refresh token',
            },
          },
        });
        return;
      }

      const newAccessToken = generateMockJWT(user);

      resolve({
        access: newAccessToken,
      });
    }, NETWORK_DELAY / 2);
  });
};

// Export all mock functions
export default {
  login: mockLogin,
  signup: mockSignup,
  verifyOTP: mockVerifyOTP,
  resendOTP: mockResendOTP,
  requestPasswordReset: mockRequestPasswordReset,
  resetPassword: mockResetPassword,
  getUserRole: mockGetUserRole,
  refreshToken: mockRefreshToken,
};

