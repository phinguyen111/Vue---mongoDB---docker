import ApiService from './api.js';

class AuthService {
  async login(credentials) {
    try {
      console.log('🔍 AuthService.login called with:', credentials);
      const response = await ApiService.post('/auth/login', credentials);
      console.log('🔍 AuthService.login response:', response);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('🔍 AuthService.login error:', error);
      throw new Error('Login failed: ' + error.message);
    }
  }

  async register(userData) {
    try {
      const response = await ApiService.post('/auth/register', userData);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw new Error('Registration failed: ' + error.message);
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  getToken() {
    return localStorage.getItem('authToken');
  }
}

export default new AuthService();