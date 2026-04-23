import { client } from '@/api/client';
import type {
  AdminCreateScannerRequest,
  AuthMeResponse,
  AuthTokensResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  ScannerAccountResponse,
} from '@/types/api';

const AUTH = '/api/auth';

export const authApi = {
  register: (body: RegisterRequest) => client.post<AuthTokensResponse>(`${AUTH}/register`, body),
  login: (body: LoginRequest) => client.post<AuthTokensResponse>(`${AUTH}/login`, body),
  verifyEmail: (token: string) => client.post<void>(`${AUTH}/verify-email`, { token }),
  resendVerification: (email: string) => client.post<void>(`${AUTH}/resend-verification`, { email }),
  logout: () => client.post<void>(`${AUTH}/logout`),
  me: () => client.get<AuthMeResponse>(`${AUTH}/me`),
  changePassword: (body: ChangePasswordRequest) =>
    client.post<AuthTokensResponse>(`${AUTH}/change-password`, body),
  listScanners: () => client.get<ScannerAccountResponse[]>(`${AUTH}/admin/scanners`),
  createScanner: (body: AdminCreateScannerRequest) =>
    client.post<ScannerAccountResponse>(`${AUTH}/admin/scanners`, body),
  disableScanner: (scannerId: string) =>
    client.post<ScannerAccountResponse>(`${AUTH}/admin/scanners/${scannerId}/disable`),
  resetScannerPassword: (scannerId: string, newPassword: string) =>
    client.post<ScannerAccountResponse>(`${AUTH}/admin/scanners/${scannerId}/reset-password`, { newPassword }),
};
