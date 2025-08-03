<template>
  <div class="admin-page">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-content">
        <div class="header-left">
          <h1>📚 Admin Dashboard</h1>
          <p>Quản lý hệ thống thư viện</p>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-name">Xin chào, {{ currentUser?.name || 'Admin' }}</span>
            <div class="user-avatar">👤</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="nav-tabs">
      <button 
        :class="{ active: activeTab === 'dashboard' }" 
        @click="activeTab = 'dashboard'"
        class="nav-tab"
      >
        📊 Dashboard
      </button>
      <button 
        :class="{ active: activeTab === 'books' }" 
        @click="activeTab = 'books'"
        class="nav-tab"
      >
        📚 Quản lý sách
      </button>
      <button 
        :class="{ active: activeTab === 'users' }" 
        @click="switchTab('users')"
        class="nav-tab"
      >
        👥 Quản lý người dùng
      </button>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Dashboard Overview -->
      <div v-if="activeTab === 'dashboard'" class="dashboard-section">
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <h3>{{ books.length }}</h3>
              <p>Tổng số sách</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <h3>{{ userStats.total }}</h3>
              <p>Người dùng</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <h3>{{ userStats.active }}</h3>
              <p>Đang hoạt động</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🛡️</div>
            <div class="stat-info">
              <h3>{{ userStats.admins }}</h3>
              <p>Quản trị viên</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3>⚡ Thao tác nhanh</h3>
          <div class="action-cards">
            <div class="action-card" @click="showAddBookForm">
              <div class="action-icon">➕</div>
              <span>Thêm sách mới</span>
            </div>
            <div class="action-card" @click="showAddUserForm">
              <div class="action-icon">👤</div>
              <span>Thêm người dùng</span>
            </div>
            <div class="action-card" @click="activeTab = 'books'">
              <div class="action-icon">📋</div>
              <span>Xem danh sách sách</span>
            </div>
            <div class="action-card" @click="activeTab = 'users'">
              <div class="action-icon">⚙️</div>
              <span>Quản lý người dùng</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Books Management -->
      <div v-if="activeTab === 'books'" class="books-section">
        <div class="section-header">
          <h2>📚 Quản lý sách</h2>
          <button @click="showAddBookForm" class="btn-primary">
            ➕ Thêm sách mới
          </button>
        </div>

        <!-- Search and Filter -->
        <div class="search-bar">
          <input 
            v-model="bookSearchTerm" 
            type="text" 
            placeholder="🔍 Tìm kiếm sách..."
            class="search-input"
          >
        </div>

        <!-- Books Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Thể loại</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in filteredBooks" :key="book._id">
                <td class="book-title">{{ book.title }}</td>
                <td>{{ book.author }}</td>
                <td>
                  <span class="category-tag">{{ book.category }}</span>
                </td>
                <td>
                  <span :class="['status-badge', book.available ? 'available' : 'unavailable']">
                    {{ book.available ? '✅ Có sẵn' : '❌ Đã mượn' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button @click="editBook(book)" class="btn-edit">✏️</button>
                    <button @click="deleteBook(book._id)" class="btn-delete">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Users Management -->
      <div v-if="activeTab === 'users'" class="users-section">
        <div class="section-header">
          <h2>👥 Quản lý người dùng</h2>

        </div>

        <!-- Search Bar -->
        <div class="search-bar">
          <input 
            v-model="userSearchTerm" 
            type="text" 
            placeholder="🔍 Tìm kiếm người dùng..."
            class="search-input"
          >
        </div>

        <!-- Users Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tên người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user._id">
                <td class="user-name">{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="['role-badge', user.role]">
                    {{ user.role === 'admin' ? '🛡️ Admin' : '👤 User' }}
                  </span>
                </td>
                <td>
                  <span :class="['status-badge', user.isActive ? 'active' : 'inactive']">
                    {{ user.isActive ? '✅ Hoạt động' : '❌ Không hoạt động' }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button @click="toggleUserStatus(user)" class="btn-toggle">
                      {{ user.isActive ? '⏸️' : '▶️' }}
                    </button>
                    <button @click="editUser(user)" class="btn-edit">✏️</button>
                    <button @click="deleteUser(user._id)" class="btn-delete">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Toast Notifications -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      <span>{{ toast.message }}</span>
      <button @click="hideToast" class="toast-close">✕</button>
    </div>

    <!-- Modals -->
    <BookModal 
      :show="showBookModal" 
      :book="selectedBook" 
      :categories="categories"
      :isEditing="!!selectedBook"
      @close="closeBookModal" 
      @save="saveBook"
    />
    
    <UserModal 
      :show="showUserModal" 
      :user="selectedUser" 
      :isEditing="!!selectedUser"
      @close="closeUserModal" 
      @save="saveUser"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import BookModal from '../components/BookModal.vue'
import UserModal from '../components/UserModal.vue'
import BookService from '../services/bookService.js'
import UserService from '../services/userService.js'
import AuthService from '../services/auth.js'

export default {
  name: 'AdminPage',
  components: {
    BookModal,
    UserModal
  },
  setup() {
    // Reactive data
    const activeTab = ref('dashboard')
    const books = ref([])
    const users = ref([])
    const categories = ref([])
    const currentUser = ref(AuthService.getCurrentUser())
    const bookSearchTerm = ref('')
    const userSearchTerm = ref('')
    const showBookModal = ref(false)
    const showUserModal = ref(false)
    const selectedBook = ref(null)
    const selectedUser = ref(null)
    const toast = ref({ show: false, message: '', type: 'success' })

    // Computed properties
    const filteredBooks = computed(() => {
      if (!bookSearchTerm.value) return books.value
      return books.value.filter(book => 
        book.title.toLowerCase().includes(bookSearchTerm.value.toLowerCase()) ||
        book.author.toLowerCase().includes(bookSearchTerm.value.toLowerCase())
      )
    })

    const filteredUsers = computed(() => {
      if (!userSearchTerm.value) return users.value
      return users.value.filter(user => 
        user.name.toLowerCase().includes(userSearchTerm.value.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.value.toLowerCase())
      )
    })

    const userStats = computed(() => {
      const total = users.value.length
      const active = users.value.filter(user => user.isActive).length
      const admins = users.value.filter(user => user.role === 'admin').length
      return { total, active, admins }
    })

    // Methods
    const switchTab = (tab) => {
      activeTab.value = tab
      if (tab === 'users') {
        loadUsers()
      }
    }

    const loadBooks = async () => {
      try {
        const response = await BookService.getBooks()
        books.value = response.books || []
      } catch (error) {
        showToast('Lỗi khi tải danh sách sách', 'error')
      }
    }

    const loadUsers = async () => {
      try {
        const response = await UserService.getUsers()
        users.value = response.users || []
      } catch (error) {
        showToast('Lỗi khi tải danh sách người dùng', 'error')
      }
    }

    const loadCategories = async () => {
      try {
        const response = await BookService.getCategories()
        categories.value = response || []
      } catch (error) {
        showToast('Lỗi khi tải danh sách thể loại', 'error')
      }
    }

    const showAddBookForm = () => {
      selectedBook.value = null
      showBookModal.value = true
    }

    const showAddUserForm = () => {
      selectedUser.value = null
      showUserModal.value = true
    }

    const editBook = (book) => {
      selectedBook.value = book
      showBookModal.value = true
    }

    const editUser = (user) => {
      selectedUser.value = user
      showUserModal.value = true
    }

    const closeBookModal = () => {
      showBookModal.value = false
      selectedBook.value = null
    }

    const closeUserModal = () => {
      showUserModal.value = false
      selectedUser.value = null
    }

    const saveBook = async (bookData) => {
      try {
        if (selectedBook.value) {
          await BookService.updateBook(selectedBook.value._id, bookData)
          showToast('Cập nhật sách thành công', 'success')
        } else {
          await BookService.createBook(bookData)
          showToast('Thêm sách thành công', 'success')
        }
        loadBooks()
        closeBookModal()
      } catch (error) {
        console.error('Save book error:', error)
        const errorMessage = error.data?.message || error.message || 'Lỗi khi lưu sách'
        showToast(errorMessage, 'error')
      }
    }

    const saveUser = async (userData) => {
      try {
        if (selectedUser.value) {
          await UserService.updateUser(selectedUser.value._id, userData)
          showToast('Cập nhật người dùng thành công', 'success')
        } else {
          await UserService.createUser(userData)
          showToast('Thêm người dùng thành công', 'success')
        }
        loadUsers()
        closeUserModal()
      } catch (error) {
        console.error('Save user error:', error)
        const errorMessage = error.data?.message || error.message || 'Lỗi khi lưu người dùng'
        showToast(errorMessage, 'error')
      }
    }

    const deleteBook = async (bookId) => {
      if (confirm('Bạn có chắc chắn muốn xóa sách này?')) {
        try {
          await BookService.deleteBook(bookId)
          showToast('Xóa sách thành công', 'success')
          loadBooks()
        } catch (error) {
          console.error('Delete book error:', error)
          const errorMessage = error.data?.message || error.message || 'Lỗi khi xóa sách'
          showToast(errorMessage, 'error')
        }
      }
    }

    const deleteUser = async (userId) => {
      if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
        try {
          await UserService.deleteUser(userId)
          showToast('Xóa người dùng thành công', 'success')
          loadUsers()
        } catch (error) {
          console.error('Delete user error:', error)
          const errorMessage = error.data?.message || error.message || 'Lỗi khi xóa người dùng'
          showToast(errorMessage, 'error')
        }
      }
    }

    const toggleUserStatus = async (user) => {
      try {
        await UserService.updateUser(user._id, { isActive: !user.isActive })
        showToast(`${user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} người dùng thành công`, 'success')
        loadUsers()
      } catch (error) {
        console.error('Toggle user status error:', error)
        const errorMessage = error.data?.message || error.message || 'Lỗi khi cập nhật trạng thái người dùng'
        showToast(errorMessage, 'error')
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const showToast = (message, type = 'success') => {
      toast.value = { show: true, message, type }
      setTimeout(() => {
        toast.value.show = false
      }, 3000)
    }

    const hideToast = () => {
      toast.value.show = false
    }

    // Lifecycle
    onMounted(() => {
      currentUser.value = AuthService.getCurrentUser()
      loadBooks()
      loadUsers()
      loadCategories()
    })

    return {
      activeTab,
      books,
      users,
      categories,
      currentUser,
      bookSearchTerm,
      userSearchTerm,
      showBookModal,
      showUserModal,
      selectedBook,
      selectedUser,
      toast,
      filteredBooks,
      filteredUsers,
      userStats,
      switchTab,
      showAddBookForm,
      showAddUserForm,
      editBook,
      editUser,
      closeBookModal,
      closeUserModal,
      saveBook,
      saveUser,
      deleteBook,
      deleteUser,
      toggleUserStatus,
      formatDate,
      showToast,
      hideToast
    }
  }
}
</script>

<style scoped>
.admin-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: #f8fafc;
  color: #1e293b;
}

/* Header */
.admin-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #1e293b;
}

.header-left p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.header-right .user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  font-size: 0.875rem;
  color: #64748b;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

/* Navigation Tabs */
.nav-tabs {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 0.5rem;
}

.nav-tab {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  color: #3b82f6;
  background: #f1f5f9;
}

.nav-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Dashboard Section */
.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.stat-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
}

.stat-info h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #1e293b;
}

.stat-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

/* Quick Actions */
.quick-actions h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
  border-color: #3b82f6;
}

.action-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
}

.action-card span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Search Bar */
.search-bar {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Tables */
.table-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
}

.data-table tr:hover {
  background: #f8fafc;
}

/* Badges and Tags */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.available,
.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.unavailable,
.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-badge.admin {
  background: #dbeafe;
  color: #1e40af;
}

.role-badge.user {
  background: #f3f4f6;
  color: #374151;
}

.category-tag {
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Buttons */
.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: #2563eb;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete,
.btn-toggle {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #fef3c7;
  color: #92400e;
}

.btn-edit:hover {
  background: #fde68a;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
}

.btn-toggle {
  background: #e0e7ff;
  color: #3730a3;
}

.btn-toggle:hover {
  background: #c7d2fe;
}

/* Toast Notifications */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 9999;
  min-width: 300px;
  animation: slideInRight 0.3s ease-out;
}

.toast.success {
  border-left: 4px solid #10b981;
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  margin-left: auto;
}

/* Animations */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .nav-tabs {
    padding: 0 1rem;
    overflow-x: auto;
  }

  .main-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .table-container {
    overflow-x: auto;
  }

  .data-table {
    min-width: 600px;
  }
}
</style>
