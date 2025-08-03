<template>
  <div class="homepage">
    <h1>Test Page</h1>
    <p>Books: {{ books.length }}</p>
  </div>
</template>

<script>
import BookService from "../services/bookService.js";

export default {
  name: "TestHome",
  data() {
    return {
      books: []
    };
  },
  async mounted() {
    try {
      const result = await BookService.getBooks();
      this.books = result.books || [];
      console.log('Books loaded:', this.books);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  }
};
</script>

<style scoped>
.homepage {
  padding: 20px;
}
</style>