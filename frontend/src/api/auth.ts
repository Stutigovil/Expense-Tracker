/**
 * API endpoints for authentication
 */
import { api, apiClient } from '@/lib/apiClient';
import { AuthToken, User } from '@/types';

export const authApi = {
  async signup(email: string, password: string): Promise<AuthToken> {
    const response = await api.post('/auth/signup', { email, password });
    const data = response.data as AuthToken;
    apiClient.setToken(data.access_token);
    apiClient.setUser(data.user);
    return data;
  },

  async login(email: string, password: string): Promise<AuthToken> {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data as AuthToken;
    apiClient.setToken(data.access_token);
    apiClient.setUser(data.user);
    return data;
  },

  logout(): void {
    apiClient.clearToken();
  },

  getCurrentUser(): User | null {
    return apiClient.getUser();
  },

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  },
};
