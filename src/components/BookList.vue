<template>
  <div class="container">
    <h1>📚 Danh sách sách</h1>

    <div class="books-grid">
      <div 
        class="book-item"
        v-for="book in books"
        :key="book.id"
      >
        <div class="book-card">
          <div class="book-cover-wrapper">
            <img 
              :src="book.cover || '/default-book-cover.svg'" 
              :alt="book.title" 
              class="book-cover"
              @error="handleImageError"
            />
          </div>
          <div class="book-info">
            <h6 class="book-title">{{ book.title }}</h6>
            <p class="book-author">{{ book.author }}</p>
            <p class="book-meta">
              {{ book.category }} | {{ book.year }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="books.length === 0" class="empty-state">
      <p>Không có sách nào.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ApiService from '@/services/api.js';

const books = ref([]);

const handleImageError = (event) => {
  event.target.src = '/default-book-cover.svg';
};

onMounted(async () => {
  try {
    const res = await ApiService.get('/books');
    books.value = res.books || [];
  } catch (error) {
    console.error('Lỗi tải sách:', error);
  }
});

// Expose function to template
defineExpose({
  handleImageError
});
</script>

<style scoped>
.book-card {
  border: 1px solid var(--border-color);
  padding: 10px;
  border-radius: 8px;
}
.book-cover {
  width: 100%;
  border-radius: 4px;
}
</style>
