<template>
  <div id="app-home" class="enhanced-homepage" role="main">
    <main class="main-content" id="main-content">
      <div v-if="currentView === 'home'" class="fade-in">
        <!-- Enhanced Hero Section with better UX -->
        <section class="hero-section" aria-labelledby="hero-title">
          <div class="container">
            <div class="hero-content">
              <div class="hero-text">
                <h1 id="hero-title" class="hero-title">Thư Viện Sách Số</h1>
                <p class="hero-subtitle">Khám phá thế giới tri thức với hàng ngàn đầu sách chất lượng cao. Tìm kiếm, đọc và chia sẻ kiến thức một cách dễ dàng.</p>
                
                <!-- Enhanced Stats with better visual hierarchy -->
                <div class="hero-stats" role="region" aria-label="Thống kê thư viện">
                  <div class="stat-item" data-aos="fade-up" data-aos-delay="100">
                    <span class="stat-number" :data-count="books.length">{{ animatedBookCount }}</span>
                    <span class="stat-label">Đầu sách</span>
                    <span class="stat-description">Được cập nhật liên tục</span>
                  </div>
                  <div class="stat-divider" aria-hidden="true"></div>
                  <div class="stat-item" data-aos="fade-up" data-aos-delay="200">
                    <span class="stat-number" :data-count="categories.length">{{ animatedCategoryCount }}</span>
                    <span class="stat-label">Thể loại</span>
                    <span class="stat-description">Đa dạng chủ đề</span>
                  </div>
                  <div class="stat-divider" aria-hidden="true"></div>
                  <div class="stat-item" data-aos="fade-up" data-aos-delay="300">
                    <span class="stat-number" :data-count="user?.favoriteBooks?.length || 0">{{ animatedFavoriteCount }}</span>
                    <span class="stat-label">Yêu thích</span>
                    <span class="stat-description">Của bạn</span>
                  </div>
                </div>
                
                <!-- Enhanced Quick Action CTAs -->
                <div class="hero-actions" data-aos="fade-up" data-aos-delay="400">
                  <button class="cta-btn cta-primary" @click="scrollToSearch" aria-describedby="search-description">
                    <i class="fas fa-search" aria-hidden="true"></i>
                    <span>Tìm kiếm ngay</span>
                  </button>
                  <button class="cta-btn cta-secondary" @click="showRandomBook" aria-describedby="random-description">
                    <i class="fas fa-random" aria-hidden="true"></i>
                    <span>Sách ngẫu nhiên</span>
                  </button>
                </div>
                
                <!-- Hidden descriptions for screen readers -->
                <div class="sr-only">
                  <span id="search-description">Chuyển đến phần tìm kiếm sách</span>
                  <span id="random-description">Xem một cuốn sách được chọn ngẫu nhiên</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Enhanced Search Section with better UX -->
        <section class="search-section" aria-labelledby="search-title">
          <div class="container">
            <div class="search-container">

              
              <form class="search-form" @submit.prevent="handleSearchSubmit" role="search">
                <!-- Enhanced Main Search -->
                <div class="search-input-group">
                  <div class="search-input-wrapper" :class="{ 'has-suggestions': showSuggestions }">
                    <i class="fas fa-search search-icon" aria-hidden="true"></i>
                    <input
                      ref="searchInput"
                      type="text"
                      class="search-input"
                      placeholder="Tìm theo tên sách, tác giả, từ khóa..."
                      v-model="searchQuery"
                      v-auto-focus
                      @input="handleSearchInput"
                      @focus="showSuggestions = true"
                      @blur="hideSuggestions"
                      @keydown="handleSearchKeydown"
                      aria-label="Tìm kiếm sách"
                      aria-describedby="search-help"
                      autocomplete="off"
                      :aria-expanded="showSuggestions"
                      aria-haspopup="listbox"
                    />
                    
                    <!-- Search Suggestions Dropdown -->
                    <div v-if="showSuggestions && searchSuggestions.length > 0" 
                         class="search-suggestions" 
                         role="listbox"
                         aria-label="Gợi ý tìm kiếm">
                      <div v-for="(suggestion, index) in searchSuggestions" 
                           :key="index"
                           class="suggestion-item"
                           :class="{ active: selectedSuggestionIndex === index }"
                           @mousedown="selectSuggestion(suggestion)"
                           role="option"
                           :aria-selected="selectedSuggestionIndex === index">
                        <i class="fas fa-search suggestion-icon" aria-hidden="true"></i>
                        <span class="suggestion-text">{{ suggestion }}</span>
                        <span class="suggestion-type">{{ getSuggestionType(suggestion) }}</span>
                      </div>
                    </div>
                    
                    <button 
                      v-if="searchQuery" 
                      class="clear-btn"
                      @click="clearSearch"
                      type="button"
                      aria-label="Xóa tìm kiếm"
                    >
                      <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div id="search-help" class="search-help">Gợi ý: Thử tìm "khoa học", "văn học" hoặc tên tác giả</div>
                </div>

                <!-- Enhanced Advanced Filters with Modern UI -->
                <div class="filters-section">
                  <div class="filters-header">
                    <h3 class="filters-title">
                      <i class="fas fa-filter" aria-hidden="true"></i>
                      Bộ lọc nâng cao
                    </h3>
                    <button type="button" 
                            class="filters-toggle" 
                            @click="showAdvancedFilters = !showAdvancedFilters"
                            :aria-expanded="showAdvancedFilters"
                            aria-controls="advanced-filters">
                      <span>{{ showAdvancedFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc' }}</span>
                      <i class="fas fa-chevron-down" :class="{ 'rotated': showAdvancedFilters }" aria-hidden="true"></i>
                    </button>
                  </div>
                  
                  <div id="advanced-filters" 
                       class="filters-content" 
                       :class="{ 'expanded': showAdvancedFilters }"
                       :aria-hidden="!showAdvancedFilters">
                    <div class="filters-grid">
                      <div class="filter-group">
                        <label class="filter-label" for="category-select">
                          <i class="fas fa-tags filter-icon" aria-hidden="true"></i>
                          <span class="label-text">Thể loại</span>
                        </label>
                        <div class="select-wrapper">
                          <select id="category-select" 
                                  class="filter-select" 
                                  v-model="selectedCategory" 
                                  @change="filterBooks"
                                  aria-describedby="category-help">
                            <option value="" class="default-option">Tất cả thể loại</option>
                            <option v-for="c in categories" :key="c" :value="c" class="category-option">{{ c }}</option>
                          </select>
                          <i class="fas fa-chevron-down select-arrow" aria-hidden="true"></i>
                        </div>
                        <small id="category-help" class="filter-help">
                          <i class="fas fa-info-circle" aria-hidden="true"></i>
                          {{ getCategoryCount(selectedCategory) }} cuốn sách
                        </small>
                      </div>

                      <div class="filter-group">
                        <label class="filter-label" for="year-select">
                          <i class="fas fa-calendar filter-icon" aria-hidden="true"></i>
                          <span class="label-text">Năm xuất bản</span>
                        </label>
                        <div class="select-wrapper">
                          <select id="year-select" 
                                  class="filter-select" 
                                  v-model="selectedYear" 
                                  @change="filterBooks"
                                  aria-describedby="year-help">
                            <option value="" class="default-option">Tất cả năm</option>
                            <option v-for="y in years" :key="y" :value="y" class="year-option">{{ y }}</option>
                          </select>
                          <i class="fas fa-chevron-down select-arrow" aria-hidden="true"></i>
                        </div>
                        <small id="year-help" class="filter-help">
                          <i class="fas fa-info-circle" aria-hidden="true"></i>
                          Từ {{ Math.min(...years) }} đến {{ Math.max(...years) }}
                        </small>
                      </div>

                      <div class="filter-group">
                        <label class="filter-label" for="sort-select">
                          <i class="fas fa-sort filter-icon" aria-hidden="true"></i>
                          <span class="label-text">Sắp xếp theo</span>
                        </label>
                        <div class="select-wrapper">
                          <select id="sort-select" 
                                  class="filter-select" 
                                  v-model="sortBy" 
                                  @change="sortBooks"
                                  aria-describedby="sort-help">
                            <option value="title" class="sort-option">Tên sách (A-Z)</option>
                            <option value="author" class="sort-option">Tác giả (A-Z)</option>
                            <option value="year" class="sort-option">Năm xuất bản (Mới nhất)</option>
                            <option value="popularity" class="sort-option">Độ phổ biến</option>
                          </select>
                          <i class="fas fa-chevron-down select-arrow" aria-hidden="true"></i>
                        </div>
                        <small id="sort-help" class="filter-help">
                          <i class="fas fa-info-circle" aria-hidden="true"></i>
                          Thay đổi thứ tự hiển thị
                        </small>
                      </div>

                      <div class="filter-actions">
                        <button type="button" 
                                class="action-btn reset-btn" 
                                @click="clearFilters"
                                :disabled="!hasActiveFilters"
                                aria-label="Đặt lại tất cả bộ lọc">
                          <i class="fas fa-refresh" aria-hidden="true"></i>
                          <span>Đặt lại</span>
                        </button>
                        
                        <button type="button" 
                                class="action-btn save-search-btn" 
                                @click="saveCurrentSearch"
                                :disabled="!searchQuery && !hasActiveFilters"
                                aria-label="Lưu tìm kiếm hiện tại">
                          <i class="fas fa-bookmark" aria-hidden="true"></i>
                          <span>Lưu tìm kiếm</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Enhanced Search Results Info -->
                <div class="search-results-summary" role="status" aria-live="polite">

                  
                  <div v-if="hasActiveFilters" class="active-filters-section">
                    <div class="filters-header-info">
                      <i class="fas fa-filter-circle-xmark" aria-hidden="true"></i>
                      <span class="filters-label">Bộ lọc đang áp dụng</span>
                      <button class="clear-all-filters" @click="clearFilters()" aria-label="Xóa tất cả bộ lọc">
                        <i class="fas fa-times-circle" aria-hidden="true"></i>
                        Xóa tất cả
                      </button>
                    </div>
                    <div class="filter-tags">
                      <span v-if="selectedCategory" class="filter-tag category-tag">
                        <i class="fas fa-tag" aria-hidden="true"></i>
                        <span class="tag-label">Thể loại:</span>
                        <span class="tag-value">{{ selectedCategory }}</span>
                        <button class="remove-tag" @click="selectedCategory = ''; filterBooks()" aria-label="Xóa bộ lọc thể loại">
                          <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                      </span>
                      <span v-if="selectedYear" class="filter-tag year-tag">
                        <i class="fas fa-calendar" aria-hidden="true"></i>
                        <span class="tag-label">Năm:</span>
                        <span class="tag-value">{{ selectedYear }}</span>
                        <button class="remove-tag" @click="selectedYear = ''; filterBooks()" aria-label="Xóa bộ lọc năm">
                          <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                      </span>
                      <span v-if="sortBy !== 'title'" class="filter-tag sort-tag">
                        <i class="fas fa-sort" aria-hidden="true"></i>
                        <span class="tag-label">Sắp xếp:</span>
                        <span class="tag-value">{{ getSortLabel(sortBy) }}</span>
                        <button class="remove-tag" @click="sortBy = 'title'; sortBooks()" aria-label="Đặt lại sắp xếp">
                          <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        <!-- Enhanced Books Grid with better UX -->
        <section class="books-section" aria-labelledby="books-title">
          <div class="container">
            <!-- Section Header -->
            <div class="books-header">
              <h2 id="books-title" class="books-title">Kết quả tìm kiếm</h2>
              <div class="view-controls">
                <div class="view-toggle" role="radiogroup" aria-label="Chế độ xem">
                  <button class="view-btn" 
                          :class="{ active: viewMode === 'grid' }"
                          @click="viewMode = 'grid'"
                          aria-label="Xem dạng lưới"
                          role="radio"
                          :aria-checked="viewMode === 'grid'">
                    <i class="fas fa-th" aria-hidden="true"></i>
                  </button>
                  <button class="view-btn" 
                          :class="{ active: viewMode === 'list' }"
                          @click="viewMode = 'list'"
                          aria-label="Xem dạng danh sách"
                          role="radio"
                          :aria-checked="viewMode === 'list'">
                    <i class="fas fa-list" aria-hidden="true"></i>
                  </button>
                </div>
                
                <div class="results-per-page">
                  <label for="page-size-select" class="sr-only">Số kết quả mỗi trang</label>
                  <select id="page-size-select" 
                          v-model="pageSize" 
                          @change="handlePageSizeChange"
                          class="page-size-select">
                    <option value="6">6 / trang</option>
                    <option value="12">12 / trang</option>
                    <option value="24">24 / trang</option>
                    <option value="48">48 / trang</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Enhanced Loading State -->
            <div v-if="!booksLoaded" class="books-loading" aria-label="Đang tải sách">
              <div class="loading-header">
                <div class="loading-spinner"></div>
                <p class="loading-text">Đang tải thư viện sách...</p>
              </div>
              <div :class="['books-grid', `view-${viewMode}`]">
                <div v-for="i in pageSize" :key="i" class="book-card-skeleton">
                  <div class="skeleton-cover"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-author"></div>
                    <div class="skeleton-meta">
                      <div class="skeleton-year"></div>
                      <div class="skeleton-category"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Books Grid/List -->
            <div v-else-if="filteredBooks.length > 0" class="books-container">
              <div :class="['books-grid', `view-${viewMode}`]" role="region" aria-label="Danh sách sách">
                <article
                  class="book-card"
                  v-for="(book, index) in paginatedBooks"
                  :key="book.id"
                  :style="{ 'animation-delay': index * 0.05 + 's' }"
                  :aria-labelledby="`book-title-${book.id}`"
                  :aria-describedby="`book-desc-${book.id}`"
                  tabindex="0"
                  @click="viewBookDetails(book)"
                  @keydown.enter="viewBookDetails(book)"
                  @keydown.space.prevent="viewBookDetails(book)"
                >
                  <div class="book-cover-container">
                    <img :src="book.cover || '/default-book-cover.svg'" 
                         class="book-cover" 
                         :alt="`Bìa sách ${book.title}`"
                         loading="lazy"
                         @error="handleImageError" />
                    <div class="book-overlay">
                      <div class="overlay-actions">
                        <button class="overlay-btn primary" 
                                @click.stop="viewBookDetails(book)"
                                aria-label="Xem chi tiết sách">
                          <i class="fas fa-eye" aria-hidden="true"></i>
                          <span>Chi tiết</span>
                        </button>
                        <button class="overlay-btn secondary" 
                                @click.stop="toggleFavorite(book.id)"
                                :aria-label="isBookFavorited(book.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
                                :class="{ favorited: isBookFavorited(book.id) }">
                          <i :class="isBookFavorited(book.id) ? 'fas fa-heart' : 'far fa-heart'" aria-hidden="true"></i>
                          <span>{{ isBookFavorited(book.id) ? 'Đã thích' : 'Yêu thích' }}</span>
                        </button>
                        <button class="overlay-btn secondary" 
                                @click.stop="shareBook(book)"
                                aria-label="Chia sẻ sách">
                          <i class="fas fa-share-alt" aria-hidden="true"></i>
                          <span>Chia sẻ</span>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Book Status Indicators -->
                    <div class="book-indicators">
                      <span v-if="isBookFavorited(book.id)" 
                            class="indicator favorite" 
                            aria-label="Sách yêu thích">
                        <i class="fas fa-heart" aria-hidden="true"></i>
                      </span>
                      <span v-if="book.isNew" 
                            class="indicator new" 
                            aria-label="Sách mới">
                        <i class="fas fa-star" aria-hidden="true"></i>
                        <span>Mới</span>
                      </span>
                    </div>
                  </div>
                  
                  <div class="book-info">
                    <h3 :id="`book-title-${book.id}`" class="book-title">{{ book.title }}</h3>
                    <p class="book-author">bởi <strong>{{ book.author }}</strong></p>
                    <div :id="`book-desc-${book.id}`" class="book-meta">
                      <div class="meta-row">
                        <span class="book-year">
                          <i class="fas fa-calendar" aria-hidden="true"></i>
                          {{ book.year }}
                        </span>
                        <span class="book-category">
                          <i class="fas fa-tag" aria-hidden="true"></i>
                          {{ book.category }}
                        </span>
                      </div>
                      <div v-if="book.rating" class="book-rating">
                        <div class="stars" :aria-label="`Đánh giá ${book.rating} trên 5 sao`">
                          <i v-for="star in 5" 
                             :key="star"
                             :class="star <= book.rating ? 'fas fa-star' : 'far fa-star'"
                             aria-hidden="true"></i>
                        </div>
                        <span class="rating-text">{{ book.rating }}/5</span>
                      </div>
                      <p v-if="book.description" class="book-description">{{ book.description }}</p>
                    </div>
                    
                    <!-- Quick Actions for List View -->
                    <div v-if="viewMode === 'list'" class="book-actions">
                      <button class="action-btn primary" @click.stop="viewBookDetails(book)">
                        <i class="fas fa-eye" aria-hidden="true"></i>
                        Xem chi tiết
                      </button>
                      <button class="action-btn secondary" 
                              @click.stop="toggleFavorite(book.id)"
                              :class="{ favorited: isBookFavorited(book.id) }">
                        <i :class="isBookFavorited(book.id) ? 'fas fa-heart' : 'far fa-heart'" aria-hidden="true"></i>
                        {{ isBookFavorited(book.id) ? 'Đã thích' : 'Yêu thích' }}
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <!-- Clean Pagination -->
            <div v-if="filteredBooks.length > 0 && computedTotalPages > 1" class="pagination-container">
              <div class="pagination">
                <button 
                  class="pagination-btn"
                  @click="changePage(currentPage - 1)"
                  :disabled="currentPage === 1"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                
                <div class="pagination-pages">
                  <button 
                    class="pagination-page"
                    v-for="page in visiblePages" 
                    :key="page"
                    :class="{ active: page === currentPage }"
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </button>
                </div>
                
                <button 
                  class="pagination-btn"
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage === computedTotalPages"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
              
              <div class="pagination-info">
                Hiển thị {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredBooks.length) }} trong {{ filteredBooks.length }} kết quả
              </div>
            </div>

            <!-- Clean Empty State -->
            <div v-if="filteredBooks.length === 0 && booksLoaded" class="empty-state">
              <div class="empty-icon">
                <i class="fas fa-search"></i>
              </div>
              <h3 class="empty-title">Không tìm thấy sách</h3>
              <p class="empty-subtitle">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
              <div class="empty-actions">
                <button class="btn-primary" @click="clearFilters">
                  <i class="fas fa-refresh"></i>
                  Đặt lại bộ lọc
                </button>
                <button class="btn-secondary" @click="showAllBooks">
                  <i class="fas fa-book"></i>
                  Xem tất cả sách
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import StorageService from "../services/storage.js";
import AuthService from "../services/auth.js";
import BookService from "../services/bookService.js";
import { categories, translations } from "../data/mockData.js";
import { debounce, createToast } from "../utils/helpers.js";
import autoFocus from "../directives/autoFocus.js";

export default {
  name: "AppHome",
  directives: { autoFocus },
  data() {
    return {
      user: null,
      currentView: "home",
      currentLanguage: "vi",
      searchQuery: "",
      selectedCategory: "",
      selectedYear: "",
      sortBy: "title",
      books: [],
      filteredBooks: [],
      categories,
      years: [],
      translations,
      debouncedFilter: null,
      currentPage: 1,
      pageSize: 6,
      toasts: [],
      booksLoaded: false,
      viewMode: 'grid',
      searchSuggestions: [],
      showSuggestions: false,
      selectedSuggestionIndex: -1,
      showAdvancedFilters: false,
      searchTime: null,
      animatedBookCount: 0,
      animatedCategoryCount: 0,
      animatedFavoriteCount: 0,
      isLoading: false,
      totalBooks: 0,
      isSearching: false,
      searchHistory: [],
      recentSearches: []
    };
  },
  computed: {
    paginatedBooks() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredBooks.slice(start, start + this.pageSize);
    },
    computedTotalPages() {
      return this.totalPages || Math.max(1, Math.ceil(this.filteredBooks.length / this.pageSize));
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.computedTotalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    hasActiveFilters() {
      return this.selectedCategory || this.selectedYear || this.searchQuery;
    }
  },
  mounted() {
    const u = localStorage.getItem("currentUser");
    if (u) {
      const parsed = JSON.parse(u);
      this.user = {
        ...parsed,
        favoriteBooks: Array.isArray(parsed.favoriteBooks) ? parsed.favoriteBooks : [],
      };
    } else {
      this.user = { name: "", role: "", favoriteBooks: [] };
    }

    this.initializeApp();
    this.debouncedFilter = debounce(this.filterBooks, 300);
    this.debouncedSearch = debounce(this.filterBooks, 500);
  },
  methods: {
    t(key) {
      return this.translations[this.currentLanguage][key] || key;
    },
    handleImageError(event) {
      event.target.src = '/default-book-cover.svg';
    },
    async changePage(page) {
      if (page >= 1 && page <= this.computedTotalPages) {
        this.currentPage = page;
        await this.loadBooks();
      }
    },
    initializeYears() {
      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year >= 2000; year--) {
        this.years.push(year);
      }
    },
    async initializeApp() {
      try {
        this.currentLanguage = StorageService.getLanguage();
        this.user = AuthService.getCurrentUser();
        
        // Load categories
        this.categories = await BookService.getCategories();
        
        // Load initial books
        await this.loadBooks();
        
        this.initializeYears();
        this.booksLoaded = true;
      } catch (error) {
        console.error("Failed to initialize app:", error);
        this.showToast("Lỗi khởi tạo ứng dụng", "error");
      }
    },
    async loadBooks() {
      this.isLoading = true;
      
      try {
        const filters = {
          search: this.searchQuery,
          category: this.selectedCategory !== 'all' ? this.selectedCategory : null,
          year: this.selectedYear !== 'all' ? this.selectedYear : null,
          sortBy: this.sortBy,
          page: this.currentPage,
          limit: this.pageSize
        };
        
        const result = await BookService.getBooks(filters);
        
        this.books = result.books;
        this.filteredBooks = result.books;
        this.totalBooks = result.total;
        this.totalPages = result.totalPages;
        
      } catch (error) {
        console.error('Failed to load books:', error);
        this.showToast('Có lỗi xảy ra khi tải sách', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    
    async filterBooks() {
      this.currentPage = 1; // Reset to first page when filtering
      await this.loadBooks();
    },
    async sortBooks() {
      await this.loadBooks();
    },
    toggleFavorite(bookId) {
      if (!this.user) return;
      const favs = this.user.favoriteBooks;
      const index = favs.indexOf(bookId);
      if (index > -1) {
        favs.splice(index, 1);
        this.showToast("Đã gỡ khỏi mục yêu thích", "info");
      } else {
        favs.push(bookId);
        this.showToast("Đã thêm vào mục yêu thích", "success");
      }
      localStorage.setItem("currentUser", JSON.stringify(this.user));
    },
    isBookFavorited(bookId) {
      return Array.isArray(this.user?.favoriteBooks) && this.user.favoriteBooks.includes(bookId);
    },
    showToast(message, type = "info", icon = "fas fa-info-circle") {
      const toast = createToast(message, type, icon);
      this.toasts.push(toast);
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== toast.id);
      }, 4000);
    },
    clearSearch() {
      this.searchQuery = "";
      this.filterBooks();
    },
    clearFilters() {
      this.searchQuery = "";
      this.selectedCategory = "";
      this.selectedYear = "";
      this.sortBy = "title";
      this.filterBooks();
    },
    showAllBooks() {
      this.clearFilters();
    },
    shareBook(book) {
      if (navigator.share) {
        navigator.share({
          title: book.title,
          text: `Check out "${book.title}" by ${book.author}`,
          url: window.location.href
        }).catch(console.error);
      } else {
        // Fallback: copy to clipboard
        const shareText = `Check out "${book.title}" by ${book.author} - ${window.location.href}`;
        navigator.clipboard.writeText(shareText).then(() => {
          this.showToast("Link copied to clipboard!", "success");
        }).catch(() => {
          this.showToast("Unable to share book", "error");
        });
      }
    },
    viewBookDetails(book) {
      // Enhanced book details view
      this.showToast(`Opening details for "${book.title}"`, "info");
      // TODO: Implement book details modal or navigation
    },
    
    // Enhanced UX Methods
    async handleSearchInput() {
      this.isSearching = true;
      
      // Generate search suggestions
      if (this.searchQuery.length >= 2) {
        try {
          this.searchSuggestions = await BookService.getSearchSuggestions(this.searchQuery, 5);
          this.showSuggestions = true;
        } catch (error) {
          console.error('Failed to get search suggestions:', error);
          this.searchSuggestions = [];
          this.showSuggestions = false;
        }
      } else {
        this.searchSuggestions = [];
        this.showSuggestions = false;
      }
      
      // Debounced search
      this.debouncedSearch();
    },
    
    handleSearchSubmit() {
      if (this.searchQuery.trim()) {
        this.addToSearchHistory(this.searchQuery);
        this.hideSuggestions();
        this.filterBooks();
      }
    },
    
    handleSearchKeydown(event) {
      if (this.showSuggestions && this.searchSuggestions.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          this.selectedSuggestionIndex = Math.min(
            this.selectedSuggestionIndex + 1,
            this.searchSuggestions.length - 1
          );
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          this.selectedSuggestionIndex = Math.max(
            this.selectedSuggestionIndex - 1,
            -1
          );
        } else if (event.key === 'Enter' && this.selectedSuggestionIndex >= 0) {
          event.preventDefault();
          this.selectSuggestion(this.searchSuggestions[this.selectedSuggestionIndex]);
        } else if (event.key === 'Escape') {
          this.hideSuggestions();
        }
      }
    },
    
    selectSuggestion(suggestion) {
      this.searchQuery = suggestion.text;
      this.hideSuggestions();
      this.filterBooks();
    },
    
    hideSuggestions() {
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
    },
    
    addToSearchHistory(query) {
      if (!this.searchHistory.includes(query)) {
        this.searchHistory.unshift(query);
        if (this.searchHistory.length > 10) {
          this.searchHistory.pop();
        }
      }
    },
    
    getCategoryCount(category) {
      if (category === 'all') {
        return this.totalBooks;
      }
      return this.books.filter(book => book.category === category).length;
    },
    
    async showRandomBooks() {
      try {
        // Get random books from service
        const result = await BookService.getBooks({ 
          sortBy: 'random', 
          limit: this.pageSize 
        });
        
        this.filteredBooks = result.books;
        this.showToast('Hiển thị sách ngẫu nhiên', 'info');
      } catch (error) {
        console.error('Failed to get random books:', error);
        this.showToast('Có lỗi xảy ra', 'error');
      }
    },
    
    async onPageSizeChange() {
      this.currentPage = 1; // Reset to first page
      await this.loadBooks();
    },
    
    hideSuggestions() {
      setTimeout(() => {
        this.showSuggestions = false;
        this.selectedSuggestionIndex = -1;
      }, 150);
    },
    
    getSuggestionType(suggestion) {
      const book = this.books.find(b => b.title === suggestion || b.author === suggestion);
      if (book) {
        return book.title === suggestion ? 'Sách' : 'Tác giả';
      }
      return this.categories.includes(suggestion) ? 'Thể loại' : 'Khác';
    },
    
    addToSearchHistory(query) {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      if (!history.includes(query)) {
        history.unshift(query);
        if (history.length > 10) history.pop();
        localStorage.setItem('searchHistory', JSON.stringify(history));
      }
    },
    
    scrollToSearch() {
      const searchSection = document.querySelector('.search-section');
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          this.$refs.searchInput?.focus();
        }, 500);
      }
    },
    
    showRandomBook() {
      if (this.books.length > 0) {
        const randomBook = this.books[Math.floor(Math.random() * this.books.length)];
        this.viewBookDetails(randomBook);
      }
    },
    
    getCategoryCount(category) {
      if (!category) return `${this.books.length} cuốn sách`;
      const count = this.books.filter(book => book.category === category).length;
      return `${count} cuốn sách`;
    },
    
    getSearchSummary() {
      const parts = [];
      if (this.searchQuery) parts.push(this.searchQuery);
      if (this.selectedCategory) parts.push(this.selectedCategory);
      if (this.selectedYear) parts.push(this.selectedYear);
      return parts.join(', ');
    },
    
    getSortLabel(sortBy) {
      const labels = {
        'title': 'Tên sách (A-Z)',
        'author': 'Tác giả (A-Z)',
        'year': 'Năm xuất bản (Mới nhất)',
        'popularity': 'Độ phổ biến'
      };
      return labels[sortBy] || sortBy;
    },
    
    saveCurrentSearch() {
      const searchData = {
        query: this.searchQuery,
        category: this.selectedCategory,
        year: this.selectedYear,
        sortBy: this.sortBy,
        timestamp: Date.now()
      };
      
      const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
      savedSearches.unshift(searchData);
      if (savedSearches.length > 5) savedSearches.pop();
      localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
      
      this.showToast('Đã lưu tìm kiếm', 'success');
    },
    
    handlePageSizeChange() {
      this.currentPage = 1;
      this.filterBooks();
    },
    
    animateCounters() {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      const bookTarget = this.books.length;
      const categoryTarget = this.categories.length;
      const favoriteTarget = this.user?.favoriteBooks?.length || 0;
      
      let currentStep = 0;
      
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        this.animatedBookCount = Math.floor(bookTarget * progress);
        this.animatedCategoryCount = Math.floor(categoryTarget * progress);
        this.animatedFavoriteCount = Math.floor(favoriteTarget * progress);
        
        if (currentStep >= steps) {
          clearInterval(timer);
          this.animatedBookCount = bookTarget;
          this.animatedCategoryCount = categoryTarget;
          this.animatedFavoriteCount = favoriteTarget;
        }
      }, stepDuration);
    }
  }
};
</script>

<style scoped>
/* Enhanced Homepage Styles with Better UX */
.homepage {
  background: #ffffff;
  min-height: 100vh;
  color: #000000;
}

/* Enhanced Hero Section */
.hero-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 4rem 0;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="%23000" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
  pointer-events: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-content {
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-text {
  margin-bottom: 40px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  animation: fadeInUp 0.8s ease;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #374151;
  margin-bottom: 2rem;
  line-height: 1.6;
  animation: fadeInUp 0.8s ease 0.2s both;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 3rem;
  animation: fadeInUp 0.8s ease 0.4s both;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #374151;
  display: block;
  transition: color 0.3s ease;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.875rem;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.5rem;
  font-weight: 600;
}

.stat-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-weight: 400;
}

.stat-divider {
  width: 1px;
  height: 60px;
  background: #e0e0e0;
}

.hero-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  animation: fadeInUp 0.8s ease 0.6s both;
}

.cta-btn {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-width: 160px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cta-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.cta-btn:hover::before {
  left: 100%;
}

.cta-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: 2px solid transparent;
}

.cta-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -3px rgba(59, 130, 246, 0.3);
}

.cta-primary:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.cta-secondary {
  background: #ffffff;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.cta-secondary:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

.cta-secondary:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cta-btn i {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.cta-btn:hover i {
  transform: scale(1.1);
}

.cta-btn span {
  font-weight: 600;
  position: relative;
  z-index: 1;
}

/* Enhanced Search Section */
.search-section {
  background: #f8fafc;
  padding: 3rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.search-container {
  max-width: 1000px;
  margin: 0 auto;
}



.search-form {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
}

.search-input-group {
  margin-bottom: 1.5rem;
}

.search-input-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.search-input-wrapper:focus-within {
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.search-icon {
  color: #6b7280;
  margin-right: 0.75rem;
  pointer-events: none;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.1rem;
  color: #1f2937;
  background: transparent;
  font-weight: 500;
  padding: 0.5rem 0;
}

.search-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.clear-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.clear-btn:hover {
  background: #ef4444;
  color: #ffffff;
  transform: scale(1.1);
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
}

.clear-btn:active {
  transform: scale(0.95);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.suggestion-item:hover,
.suggestion-item.selected {
  background: #f3f4f6;
}

.suggestion-type {
  font-size: 0.75rem;
  color: #6b7280;
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-left: auto;
}

.search-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  text-align: center;
}

/* Enhanced Filters Section Styling */
.filters-section {
  margin-top: 2rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.filters-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filters-title i {
  color: #3b82f6;
  font-size: 1rem;
}

.filters-toggle {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.filters-toggle:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filters-toggle:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.filters-toggle i {
  transition: transform 0.3s ease;
  color: #6b7280;
}

.filters-toggle i.rotated {
  transform: rotate(180deg);
}

.filters-content {
  max-height: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  background: #ffffff;
}

.filters-content.expanded {
  max-height: 500px;
  opacity: 1;
  padding: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  align-items: start;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-label {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.filter-icon {
  color: #3b82f6;
  font-size: 0.875rem;
  width: 16px;
  text-align: center;
}

.label-text {
  color: #1f2937;
  font-weight: 600;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-select {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: #1f2937;
  background: #ffffff;
  transition: all 0.2s ease;
  appearance: none;
  cursor: pointer;
  font-weight: 500;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select:hover {
  border-color: #9ca3af;
}

.select-arrow {
  position: absolute;
  right: 1rem;
  color: #6b7280;
  pointer-events: none;
  font-size: 0.75rem;
  transition: color 0.2s ease;
}

.filter-select:focus + .select-arrow {
  color: #3b82f6;
}

.default-option {
  color: #6b7280;
  font-style: italic;
}

.category-option,
.year-option,
.sort-option {
  color: #1f2937;
  font-weight: 500;
}

.filter-help {
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0;
}

.filter-help i {
  color: #9ca3af;
  font-size: 0.625rem;
}

.filter-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.action-btn {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  min-width: 120px;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.reset-btn {
  background: #ffffff;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.reset-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.save-search-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: 2px solid transparent;
}

.save-search-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.save-search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  background: #9ca3af;
}

.action-btn i {
  font-size: 0.875rem;
}

.action-btn span {
  font-weight: 600;
}

/* Enhanced Search Results Summary */
.search-results-summary {
  margin-top: 2rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}





/* Enhanced Active Filters Section */
.active-filters-section {
  padding: 1.5rem 2rem;
  background: #ffffff;
}

.filters-header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filters-header-info i {
  color: #f59e0b;
  font-size: 1rem;
}

.filters-label {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.clear-all-filters {
  margin-left: auto;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.clear-all-filters:hover {
  background: #fecaca;
  border-color: #f87171;
  transform: translateY(-1px);
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-tag {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.filter-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-tag {
  border-left: 3px solid #10b981;
}

.year-tag {
  border-left: 3px solid #3b82f6;
}

.sort-tag {
  border-left: 3px solid #8b5cf6;
}

.filter-tag i {
  font-size: 0.75rem;
}

.category-tag i {
  color: #10b981;
}

.year-tag i {
  color: #3b82f6;
}

.sort-tag i {
  color: #8b5cf6;
}

.tag-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.tag-value {
  font-weight: 600;
  color: #1f2937;
}

.remove-tag {
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.25rem;
}

.remove-tag:hover {
  background: #e5e7eb;
  color: #374151;
  transform: scale(1.1);
}

.remove-tag i {
  font-size: 0.625rem;
}

.advanced-toggle {
  text-align: center;
  margin-bottom: 1rem;
}

.toggle-btn {
  background: none;
  border: none;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: #f3f4f6;
}

.advanced-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.advanced-filters.show {
  opacity: 1;
  max-height: 200px;
}

.filters-row {
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.filter-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
}

.filter-label,
.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  display: block;
}

.filter-select,
.form-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #ffffff;
  color: #000000;
  width: 100%;
}

.filter-select:focus,
.form-select:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.search-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
  position: relative;
  overflow: hidden;
  min-width: 140px;
}

.search-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.search-btn:hover::before {
  left: 100%;
}

.search-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.3);
}

.search-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: #9ca3af;
  box-shadow: none;
}

.search-btn:disabled::before {
  display: none;
}

.reset-btn {
  background: #ffffff;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  height: fit-content;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  min-width: 120px;
}

.reset-btn:hover {
  background: #f9fafb;
  border-color: #f59e0b;
  color: #f59e0b;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.1);
}

.reset-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.search-info {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.search-results-info {
  text-align: center;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
}

.active-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tag {
  background: #374151;
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-tag button {
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
}

/* Enhanced Books Section */
.books-section {
  padding: 4rem 0;
  background: #ffffff;
}

.books-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.books-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 0.25rem;
}

.view-btn {
  background: none;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.view-btn.active {
  background: #ffffff;
  color: #374151;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.results-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  font-size: 0.875rem;
}

.books-loading {
  text-align: center;
  padding: 3rem 0;
}

.loading-header {
  margin-bottom: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #374151;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #6b7280;
  font-size: 1.1rem;
}

.books-container {
  position: relative;
}

.books-grid {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
  transition: all 0.3s ease;
}

.books-grid.view-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.books-grid.view-list {
  grid-template-columns: 1fr;
  gap: 1rem;
}

.book-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
  cursor: pointer;
  position: relative;
  border: 1px solid #f0f0f0;
}

.view-list .book-card {
  display: flex;
  align-items: stretch;
  max-height: 200px;
}

.view-list .book-cover-container {
  flex: 0 0 150px;
  aspect-ratio: 3/4;
}

.view-list .book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

.book-card:focus {
  outline: 2px solid #374151;
  outline-offset: 2px;
}

.book-cover-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 3/4;
}

.view-grid .book-cover-container {
  aspect-ratio: 3/4;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.view-list .book-cover {
  height: 200px;
}

.book-card:hover .book-cover {
  transform: scale(1.05);
}

.book-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.book-card:hover .book-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.overlay-btn {
  background: #ffffff;
  color: #000000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  min-width: 120px;
  justify-content: center;
}

.overlay-btn.primary {
  background: #374151;
  color: #ffffff;
}

.overlay-btn.primary:hover {
  background: #1f2937;
}

.overlay-btn.secondary {
  background: rgba(255, 255, 255, 0.9);
}

.overlay-btn.secondary:hover {
  background: #ffffff;
}

.overlay-btn.favorited {
  background: #dc2626;
  color: #ffffff;
}

.book-indicators {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.indicator {
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.indicator.favorite {
  background: #dc2626;
}

.indicator.new {
  background: #059669;
}

.book-info {
  padding: 1.5rem;
}

.view-list .book-info {
  padding: 1rem;
}

.book-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  color: #6b7280;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.book-meta {
  margin-bottom: 1rem;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.book-year,
.book-category {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #374151;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.book-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.stars i {
  color: #fbbf24;
  font-size: 0.875rem;
}

.rating-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.book-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn.primary {
  background: #374151;
  color: #ffffff;
}

.action-btn.primary:hover {
  background: #1f2937;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

.action-btn.favorited {
  background: #dc2626;
  color: #ffffff;
}

/* Enhanced Skeleton Loading */
.book-card-skeleton {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.view-list .book-card-skeleton {
  display: flex;
  align-items: stretch;
  max-height: 200px;
}

.view-list .skeleton-cover {
  flex: 0 0 150px;
}

.view-list .skeleton-content {
  flex: 1;
}

.skeleton-cover {
  aspect-ratio: 3/4;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.view-list .skeleton-cover {
  height: 200px;
  aspect-ratio: auto;
}

.skeleton-content {
  padding: 1.5rem;
}

.skeleton-title,
.skeleton-author,
.skeleton-meta > div {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-title {
  height: 1.5rem;
  width: 80%;
}

.skeleton-author {
  height: 1rem;
  width: 60%;
}

.skeleton-meta {
  display: flex;
  gap: 1rem;
}

.skeleton-year,
.skeleton-category {
  height: 1rem;
  width: 60px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Clean Pagination */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f5f5f5;
  color: #000000;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.pagination-page {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.pagination-page:hover {
  background: #f5f5f5;
  color: #000000;
}

.pagination-page.active {
  background: #374151;
  color: #ffffff;
  border-color: #374151;
}

.pagination-info {
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Clean Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #999999;
  font-size: 2rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 12px;
}

.empty-subtitle {
  color: #6b7280;
  margin-bottom: 32px;
  font-size: 1rem;
}

.empty-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  border: none;
}

.btn-primary {
  background: #374151;
  color: #ffffff;
}

.btn-primary:hover {
  background: #1f2937;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #ffffff;
  color: #374151;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus styles */
*:focus {
  outline: 2px solid #374151;
  outline-offset: 2px;
}

button:focus,
input:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-stats {
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .stat-divider {
    display: none;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .search-form {
    padding: 1.5rem;
  }
  
  .advanced-filters {
    grid-template-columns: 1fr;
  }
  
  .search-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .books-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-controls {
    justify-content: space-between;
  }
  
  .books-grid.view-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .view-list .book-card {
    flex-direction: column;
    max-height: none;
  }
  
  .view-list .book-cover-container {
    flex: none;
    aspect-ratio: 3/2;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 2rem 0;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-section {
    padding: 2rem 0;
  }
  
  .search-form {
    padding: 1rem;
  }
  
  .books-grid.view-grid {
    grid-template-columns: 1fr;
  }
  
  .overlay-actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .overlay-btn {
    min-width: auto;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }
}
</style>
