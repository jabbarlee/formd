import { STORAGE_KEYS } from '../constants';

/**
 * Token storage service
 * Handles secure storage and retrieval of authentication tokens
 */
class TokenStorage {
  private isClient = typeof window !== 'undefined';

  /**
   * Stores authentication token
   */
  setAuthToken(token: string): void {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  }

  /**
   * Retrieves authentication token
   */
  getAuthToken(): string | null {
    if (!this.isClient) return null;
    
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve auth token:', error);
      return null;
    }
  }

  /**
   * Stores refresh token
   */
  setRefreshToken(token: string): void {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  /**
   * Retrieves refresh token
   */
  getRefreshToken(): string | null {
    if (!this.isClient) return null;
    
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Stores user data
   */
  setUserData(userData: string): void {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, userData);
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Retrieves user data
   */
  getUserData(): string | null {
    if (!this.isClient) return null;
    
    try {
      return localStorage.getItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Stores redirect URL for post-authentication redirect
   */
  setRedirectUrl(url: string): void {
    if (!this.isClient) return;
    
    try {
      sessionStorage.setItem(STORAGE_KEYS.REDIRECT_URL, url);
    } catch (error) {
      console.error('Failed to store redirect URL:', error);
    }
  }

  /**
   * Retrieves and removes redirect URL
   */
  getAndClearRedirectUrl(): string | null {
    if (!this.isClient) return null;
    
    try {
      const url = sessionStorage.getItem(STORAGE_KEYS.REDIRECT_URL);
      if (url) {
        sessionStorage.removeItem(STORAGE_KEYS.REDIRECT_URL);
      }
      return url;
    } catch (error) {
      console.error('Failed to retrieve redirect URL:', error);
      return null;
    }
  }

  /**
   * Clears all authentication-related storage
   */
  clearAll(): void {
    if (!this.isClient) return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      sessionStorage.removeItem(STORAGE_KEYS.REDIRECT_URL);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Checks if authentication token exists
   */
  hasAuthToken(): boolean {
    return !!this.getAuthToken();
  }
}

// Export singleton instance
export const tokenStorage = new TokenStorage();
