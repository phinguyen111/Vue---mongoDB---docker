<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới' }}</h3>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="user-form">
        <div class="form-group">
          <label for="name">Tên người dùng *</label>
          <input
            id="name"
            type="text"
            v-model="formData.name"
            :class="{ 'error': errors.name }"
            placeholder="Nhập tên người dùng"
            required
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
            id="email"
            type="email"
            v-model="formData.email"
            :class="{ 'error': errors.email }"
            placeholder="Nhập email"
            required
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">{{ isEditing ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *' }}</label>
          <input
            id="password"
            type="password"
            v-model="formData.password"
            :class="{ 'error': errors.password }"
            placeholder="Nhập mật khẩu"
            :required="!isEditing"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="role">Vai trò *</label>
          <select
            id="role"
            v-model="formData.role"
            :class="{ 'error': errors.role }"
            required
          >
            <option value="">Chọn vai trò</option>
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
          </select>
          <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
        </div>

        <div v-if="isEditing" class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.isActive"
            />
            <span class="checkmark"></span>
            Tài khoản hoạt động
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">
            Hủy
          </button>
          <button type="submit" class="btn-save" :disabled="isLoading">
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            {{ isEditing ? 'Cập nhật' : 'Tạo mới' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import UserService from '../services/userService.js';

export default {
  name: 'UserModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: () => ({})
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {
        name: '',
        email: '',
        password: '',
        role: 'user',
        isActive: true
      },
      errors: {},
      isLoading: false
    };
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.loadUserData();
      }
    },
    user: {
      handler() {
        if (this.show) {
          this.loadUserData();
        }
      },
      deep: true
    }
  },
  methods: {
    loadUserData() {
      if (this.isEditing && this.user && Object.keys(this.user).length > 0) {
        this.formData = {
          name: this.user.name || '',
          email: this.user.email || '',
          password: '',
          role: this.user.role || 'user',
          isActive: this.user.isActive !== undefined ? this.user.isActive : true
        };
      } else {
        this.resetForm();
      }
      this.errors = {};
      this.isLoading = false;
    },
    
    resetForm() {
      this.formData = {
        name: '',
        email: '',
        password: '',
        role: 'user',
        isActive: true
      };
      this.errors = {};
      this.isLoading = false;
    },
    
    validateForm() {
      this.errors = {};
      
      // Validate name
      if (!this.formData.name || this.formData.name.trim().length < 2) {
        this.errors.name = 'Tên phải có ít nhất 2 ký tự';
      }
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.formData.email || !emailRegex.test(this.formData.email)) {
        this.errors.email = 'Email không hợp lệ';
      }
      
      // Validate password
      if (!this.isEditing && (!this.formData.password || this.formData.password.length < 6)) {
        this.errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      if (this.isEditing && this.formData.password && this.formData.password.length < 6) {
        this.errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      
      // Validate role
      if (!this.formData.role) {
        this.errors.role = 'Vui lòng chọn vai trò';
      }
      
      return Object.keys(this.errors).length === 0;
    },
    
    async handleSubmit() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isLoading = true;
      
      try {
        const userData = { ...this.formData };
        
        // Remove empty password for updates
        if (this.isEditing && !userData.password) {
          delete userData.password;
        }
        
        let response;
        if (this.isEditing) {
          response = await UserService.updateUser(this.user._id, userData);
        } else {
          response = await UserService.createUser(userData);
        }
        
        if (response.success) {
          this.$emit('save', response.user);
          this.closeModal();
        } else {
          throw new Error(response.message || 'Có lỗi xảy ra');
        }
      } catch (error) {
        console.error('Save user error:', error);
        
        // Handle specific error messages
        if (error.response?.data?.message) {
          if (error.response.data.message.includes('Email')) {
            this.errors.email = error.response.data.message;
          } else {
            this.$emit('error', error.response.data.message);
          }
        } else {
          this.$emit('error', error.message || 'Có lỗi xảy ra khi lưu người dùng');
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    closeModal() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.user-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: #ef4444;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal !important;
  margin-bottom: 0 !important;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: #3b82f6;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #2563eb;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fa-spinner {
  margin-right: 6px;
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header,
  .user-form {
    padding: 16px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}
</style>