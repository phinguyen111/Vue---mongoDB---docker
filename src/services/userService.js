import ApiService from './api.js';

class UserService {
  constructor() {
    this.apiService = ApiService;
  }

  // Get all users with filters (Admin only)
  async getUsers(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const endpoint = `/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.apiService.get(endpoint);
      
      return {
        users: response.users || [],
        pagination: response.pagination || {},
        success: response.success
      };
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  // Get user by ID (Admin only)
  async getUserById(id) {
    try {
      const response = await this.apiService.get(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  // Create new user (Admin only)
  async createUser(userData) {
    try {
      const response = await this.apiService.post('/users', userData);
      return response;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // Update user (Admin only)
  async updateUser(id, userData) {
    try {
      const response = await this.apiService.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // Delete user (Admin only)
  async deleteUser(id) {
    try {
      const response = await this.apiService.delete(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Toggle user active status (Admin only)
  async toggleUserStatus(id) {
    try {
      const response = await this.apiService.patch(`/users/${id}/toggle-status`);
      return response;
    } catch (error) {
      console.error('Toggle user status error:', error);
      throw error;
    }
  }

  // Get user statistics (Admin only)
  async getUserStats() {
    try {
      const response = await this.apiService.get('/users/stats/overview');
      return response;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  // Validate user data
  validateUserData(userData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || userData.name !== undefined) {
      if (!userData.name || userData.name.trim().length < 2) {
        errors.push('Tên phải có ít nhất 2 ký tự');
      }
    }

    if (!isUpdate || userData.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!userData.email || !emailRegex.test(userData.email)) {
        errors.push('Email không hợp lệ');
      }
    }

    if (!isUpdate || userData.password !== undefined) {
      if (!isUpdate && (!userData.password || userData.password.length < 6)) {
        errors.push('Mật khẩu phải có ít nhất 6 ký tự');
      }
      if (isUpdate && userData.password && userData.password.length < 6) {
        errors.push('Mật khẩu phải có ít nhất 6 ký tự');
      }
    }

    if (userData.role && !['user', 'admin'].includes(userData.role)) {
      errors.push('Vai trò không hợp lệ');
    }

    return errors;
  }

  // Format user data for display
  formatUserForDisplay(user) {
    return {
      ...user,
      createdAt: new Date(user.createdAt).toLocaleDateString('vi-VN'),
      updatedAt: new Date(user.updatedAt).toLocaleDateString('vi-VN'),
      roleDisplay: user.role === 'admin' ? 'Quản trị viên' : 'Người dùng',
      statusDisplay: user.isActive ? 'Hoạt động' : 'Vô hiệu hóa',
      favoriteCount: user.favorites?.length || 0,
      historyCount: user.history?.length || 0
    };
  }

  // Get role options for forms
  getRoleOptions() {
    return [
      { value: 'user', label: 'Người dùng' },
      { value: 'admin', label: 'Quản trị viên' }
    ];
  }

  // Get status options for filters
  getStatusOptions() {
    return [
      { value: 'all', label: 'Tất cả' },
      { value: 'true', label: 'Hoạt động' },
      { value: 'false', label: 'Vô hiệu hóa' }
    ];
  }

  // Get sort options
  getSortOptions() {
    return [
      { value: 'createdAt', label: 'Ngày tạo' },
      { value: 'name', label: 'Tên' },
      { value: 'email', label: 'Email' },
      { value: 'role', label: 'Vai trò' },
      { value: 'updatedAt', label: 'Cập nhật cuối' }
    ];
  }
}

export default new UserService();