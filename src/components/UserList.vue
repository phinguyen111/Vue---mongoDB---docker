<template>
  <div class="container">
    <h1>👤 Danh sách người dùng</h1>

    <table class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Họ tên</th>
          <th>Email</th>
          <th>Vai trò</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="users.length === 0" class="empty-state">
      <p>Không có người dùng nào.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ApiService from '@/services/api.js';

const users = ref([]);

onMounted(async () => {
  try {
    const res = await ApiService.get('/auth/verify'); 
    // Vì API mock của bạn không có GET /users, đây chỉ là minh hoạ.
    // Bạn có thể tạo thêm API trả danh sách user hoặc dùng mockData.
    users.value = res.user ? [res.user] : [];
  } catch (error) {
    console.error('Lỗi tải người dùng:', error);
  }
});
</script>

<style scoped>
.user-table {
  width: 100%;
  border-collapse: collapse;
}
.user-table th, .user-table td {
  padding: 8px;
  border: 1px solid var(--border-color);
}
</style>
