<template>
  <div class="modal-overlay" @click="closeModal" v-if="show">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-book"></i>
          {{ isEditing ? 'Chỉnh sửa sách' : 'Thêm sách mới' }}
        </h3>
        <button class="modal-close" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="saveBook" class="book-form">
          <div class="form-row">
            <div class="form-group">
              <label for="title">Tiêu đề *</label>
              <input
                id="title"
                v-model="bookForm.title"
                type="text"
                required
                placeholder="Nhập tiêu đề sách"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="author">Tác giả *</label>
              <input
                id="author"
                v-model="bookForm.author"
                type="text"
                required
                placeholder="Nhập tên tác giả"
                class="form-input"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="category">Thể loại *</label>
              <select
                id="category"
                v-model="bookForm.category"
                required
                class="form-select"
              >
                <option value="">Chọn thể loại</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="year">Năm xuất bản</label>
              <input
                id="year"
                v-model.number="bookForm.year"
                type="number"
                :min="1900"
                :max="currentYear"
                placeholder="Năm xuất bản"
                class="form-input"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="isbn">ISBN</label>
              <input
                id="isbn"
                v-model="bookForm.isbn"
                type="text"
                placeholder="Mã ISBN"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="publisher">Nhà xuất bản</label>
              <input
                id="publisher"
                v-model="bookForm.publisher"
                type="text"
                placeholder="Tên nhà xuất bản"
                class="form-input"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="pages">Số trang</label>
              <input
                id="pages"
                v-model.number="bookForm.pages"
                type="number"
                min="1"
                placeholder="Số trang"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="language">Ngôn ngữ</label>
              <select
                id="language"
                v-model="bookForm.language"
                class="form-select"
              >
                <option value="Vietnamese">Tiếng Việt</option>
                <option value="English">English</option>
                <option value="Chinese">中文</option>
                <option value="Japanese">日本語</option>
                <option value="Korean">한국어</option>
                <option value="French">Français</option>
                <option value="German">Deutsch</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="price">Giá (VNĐ)</label>
              <input
                id="price"
                v-model.number="bookForm.price"
                type="number"
                min="0"
                step="1000"
                placeholder="Giá sách"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="stock">Số lượng tồn kho</label>
              <input
                id="stock"
                v-model.number="bookForm.stock"
                type="number"
                min="0"
                placeholder="Số lượng"
                class="form-input"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label>Ảnh bìa</label>
            <div class="cover-preview">
              <img 
                src="/default-book-cover.svg"
                :alt="bookForm.title || 'Book cover'"
                class="cover-image"
              />
              <p class="cover-note">Sử dụng ảnh bìa mặc định</p>
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Mô tả</label>
            <textarea
              id="description"
              v-model="bookForm.description"
              rows="4"
              placeholder="Mô tả nội dung sách"
              class="form-textarea"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              Hủy
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i>
              {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    book: {
      type: Object,
      default: () => ({})
    },
    categories: {
      type: Array,
      default: () => []
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      bookForm: {
        id: null,
        title: '',
        author: '',
        category: '',
        year: new Date().getFullYear(),

        description: '',
        isbn: '',
        publisher: '',
        pages: null,
        language: 'Vietnamese',
        price: 0,
        stock: 0
      }
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.loadBookData();
      }
    },
    book: {
      handler() {
        if (this.show) {
          this.loadBookData();
        }
      },
      deep: true
    }
  },
  methods: {
    loadBookData() {
      if (this.isEditing && this.book && Object.keys(this.book).length > 0) {
        this.bookForm = {
          id: this.book._id || this.book.id,
          title: this.book.title || '',
          author: this.book.author || '',
          category: this.book.category || '',
          year: this.book.year || new Date().getFullYear(),

          description: this.book.description || '',
          isbn: this.book.isbn || '',
          publisher: this.book.publisher || '',
          pages: this.book.pages || null,
          language: this.book.language || 'Vietnamese',
          price: this.book.price || 0,
          stock: this.book.stock || 0
        };
      } else {
        this.resetForm();
      }
    },
    
    resetForm() {
      this.bookForm = {
        id: null,
        title: '',
        author: '',
        category: '',
        year: new Date().getFullYear(),

        description: '',
        isbn: '',
        publisher: '',
        pages: null,
        language: 'Vietnamese',
        price: 0,
        stock: 0
      };
    },
    
    closeModal() {
      this.$emit('close');
    },
    
    saveBook() {
      const bookData = { 
        ...this.bookForm,
        cover: '/default-book-cover.svg'
      };
      this.$emit('save', bookData);
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modalSlideIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.book-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Cover Preview Styles */
.cover-preview {
  margin-top: 0.5rem;
  text-align: center;
}

.cover-image {
  max-width: 120px;
  max-height: 160px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  object-fit: cover;
}

.cover-image:hover {
  transform: scale(1.05);
}

.cover-note {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>