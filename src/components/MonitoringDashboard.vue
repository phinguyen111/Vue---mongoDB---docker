<template>
  <div class="monitoring-dashboard">
    <div class="dashboard-header">
      <h2>🔍 System Monitoring Dashboard</h2>
      <div class="refresh-controls">
        <button @click="refreshData" class="btn btn-primary" :disabled="loading">
          <span v-if="loading">🔄</span>
          <span v-else>🔄</span>
          Refresh
        </button>
        <span class="last-updated">Last updated: {{ lastUpdated }}</span>
      </div>
    </div>

    <!-- Health Status -->
    <div class="health-status-card">
      <h3>🏥 System Health</h3>
      <div class="health-indicator" :class="healthStatus?.status">
        <div class="status-badge">
          <span class="status-icon">{{ getHealthIcon(healthStatus?.status) }}</span>
          <span class="status-text">{{ healthStatus?.status?.toUpperCase() || 'UNKNOWN' }}</span>
        </div>
        <div class="uptime">Uptime: {{ formatUptime(healthStatus?.uptime) }}</div>
      </div>
      
      <div class="services-grid">
        <div v-for="(service, name) in healthStatus?.services" :key="name" 
             class="service-card" :class="service.status">
          <h4>{{ formatServiceName(name) }}</h4>
          <div class="service-status">
            <span class="service-icon">{{ getServiceIcon(service.status) }}</span>
            <span>{{ service.status }}</span>
          </div>
          <p class="service-message">{{ service.message }}</p>
        </div>
      </div>
    </div>

    <!-- Metrics Overview -->
    <div class="metrics-grid">
      <!-- Request Metrics -->
      <div class="metric-card">
        <h3>📊 Request Metrics</h3>
        <div class="metric-stats">
          <div class="stat">
            <span class="stat-value">{{ metrics?.requests?.total || 0 }}</span>
            <span class="stat-label">Total Requests</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ formatPercentage(metrics?.requests?.successRate) }}%</span>
            <span class="stat-label">Success Rate</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ metrics?.performance?.avgResponseTime || 0 }}ms</span>
            <span class="stat-label">Avg Response Time</span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" 
               :style="{ width: metrics?.requests?.successRate + '%' }"
               :class="getSuccessRateClass(metrics?.requests?.successRate)"></div>
        </div>
      </div>

      <!-- System Resources -->
      <div class="metric-card">
        <h3>💻 System Resources</h3>
        <div class="resource-meters">
          <div class="resource-meter">
            <label>Memory Usage</label>
            <div class="meter">
              <div class="meter-fill" 
                   :style="{ width: metrics?.system?.memoryUsage + '%' }"
                   :class="getResourceClass(metrics?.system?.memoryUsage)"></div>
            </div>
            <span class="meter-value">{{ formatPercentage(metrics?.system?.memoryUsage) }}%</span>
          </div>
          
          <div class="resource-meter">
            <label>CPU Usage</label>
            <div class="meter">
              <div class="meter-fill" 
                   :style="{ width: metrics?.system?.cpuUsage + '%' }"
                   :class="getResourceClass(metrics?.system?.cpuUsage)"></div>
            </div>
            <span class="meter-value">{{ formatPercentage(metrics?.system?.cpuUsage) }}%</span>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="metric-card">
        <h3>⚡ Performance</h3>
        <div class="performance-stats">
          <div class="perf-stat">
            <span class="perf-label">P95 Response Time</span>
            <span class="perf-value">{{ metrics?.performance?.p95ResponseTime || 0 }}ms</span>
          </div>
          <div class="perf-stat">
            <span class="perf-label">P99 Response Time</span>
            <span class="perf-value">{{ metrics?.performance?.p99ResponseTime || 0 }}ms</span>
          </div>
          <div class="perf-stat">
            <span class="perf-label">Max Response Time</span>
            <span class="perf-value">{{ metrics?.performance?.maxResponseTime || 0 }}ms</span>
          </div>
          <div class="perf-stat">
            <span class="perf-label">Error Rate</span>
            <span class="perf-value" :class="getErrorRateClass(metrics?.performance?.errorRate)">
              {{ formatPercentage(metrics?.performance?.errorRate) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Cache Statistics -->
      <div class="metric-card">
        <h3>🗄️ Cache Performance</h3>
        <div class="cache-stats" v-if="cacheStats">
          <div class="cache-stat">
            <span class="cache-label">Hit Rate</span>
            <span class="cache-value">{{ calculateHitRate() }}%</span>
          </div>
          <div class="cache-stat">
            <span class="cache-label">Total Hits</span>
            <span class="cache-value">{{ cacheStats.hits || 0 }}</span>
          </div>
          <div class="cache-stat">
            <span class="cache-label">Total Misses</span>
            <span class="cache-value">{{ cacheStats.misses || 0 }}</span>
          </div>
          <div class="cache-stat">
            <span class="cache-label">Status</span>
            <span class="cache-value" :class="cacheStats.connected ? 'connected' : 'disconnected'">
              {{ cacheStats.connected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
        </div>
        <div v-else class="no-cache-data">
          <p>Cache statistics not available</p>
        </div>
      </div>
    </div>

    <!-- Recent Alerts -->
    <div class="alerts-section" v-if="alerts && alerts.length > 0">
      <h3>🚨 Recent Alerts</h3>
      <div class="alerts-list">
        <div v-for="alert in alerts.slice(0, 10)" :key="alert.id" 
             class="alert-item" :class="alert.severity">
          <div class="alert-header">
            <span class="alert-icon">{{ getAlertIcon(alert.severity) }}</span>
            <span class="alert-type">{{ formatAlertType(alert.type) }}</span>
            <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
          </div>
          <div class="alert-details" v-if="alert.data">
            <span v-for="(value, key) in alert.data" :key="key" class="alert-detail">
              {{ key }}: {{ value }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Logs -->
    <div class="logs-section">
      <h3>📝 Recent Logs</h3>
      <div class="log-controls">
        <select v-model="selectedLogCategory" @change="fetchLogs">
          <option value="application">Application</option>
          <option value="security">Security</option>
          <option value="performance">Performance</option>
          <option value="audit">Audit</option>
        </select>
        <input type="number" v-model="logLines" @change="fetchLogs" 
               min="10" max="1000" placeholder="Lines">
      </div>
      <div class="logs-container">
        <div v-for="(log, index) in logs" :key="index" 
             class="log-entry" :class="log.level">
          <span class="log-timestamp">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">{{ log.level?.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MonitoringDashboard',
  data() {
    return {
      loading: false,
      healthStatus: null,
      metrics: null,
      cacheStats: null,
      alerts: [],
      logs: [],
      lastUpdated: null,
      selectedLogCategory: 'application',
      logLines: 50,
      refreshInterval: null
    };
  },
  mounted() {
    this.loadDashboardData();
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 30000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    async loadDashboardData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchHealthStatus(),
          this.fetchMetrics(),
          this.fetchCacheStats(),
          this.fetchLogs()
        ]);
        this.lastUpdated = new Date().toLocaleTimeString();
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchHealthStatus() {
      try {
        const response = await axios.get('/api/health');
        this.healthStatus = response.data;
      } catch (error) {
        console.error('Failed to fetch health status:', error);
      }
    },

    async fetchMetrics() {
      try {
        const response = await axios.get('/api/metrics');
        this.metrics = response.data;
        this.alerts = response.data.alerts || [];
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    },

    async fetchCacheStats() {
      try {
        const response = await axios.get('/api/cache/stats');
        this.cacheStats = response.data;
      } catch (error) {
        console.error('Failed to fetch cache stats:', error);
      }
    },

    async fetchLogs() {
      try {
        const response = await axios.get('/api/logs', {
          params: {
            category: this.selectedLogCategory,
            lines: this.logLines
          }
        });
        this.logs = response.data.logs || [];
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    },

    async refreshData() {
      await this.loadDashboardData();
    },

    // Utility methods
    formatUptime(uptime) {
      if (!uptime) return 'Unknown';
      const seconds = Math.floor(uptime / 1000);
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${days}d ${hours}h ${minutes}m`;
    },

    formatPercentage(value) {
      return value ? Math.round(value * 100) / 100 : 0;
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    },

    formatServiceName(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    },

    formatAlertType(type) {
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    calculateHitRate() {
      if (!this.cacheStats || (!this.cacheStats.hits && !this.cacheStats.misses)) {
        return 0;
      }
      const total = this.cacheStats.hits + this.cacheStats.misses;
      return total > 0 ? Math.round((this.cacheStats.hits / total) * 100) : 0;
    },

    // Icon methods
    getHealthIcon(status) {
      switch (status) {
        case 'healthy': return '✅';
        case 'degraded': return '⚠️';
        case 'unhealthy': return '❌';
        default: return '❓';
      }
    },

    getServiceIcon(status) {
      switch (status) {
        case 'healthy': return '✅';
        case 'degraded': return '⚠️';
        case 'unhealthy': return '❌';
        default: return '❓';
      }
    },

    getAlertIcon(severity) {
      switch (severity) {
        case 'critical': return '🔴';
        case 'warning': return '🟡';
        case 'info': return '🔵';
        default: return '⚪';
      }
    },

    // CSS class methods
    getSuccessRateClass(rate) {
      if (rate >= 95) return 'excellent';
      if (rate >= 90) return 'good';
      if (rate >= 80) return 'warning';
      return 'critical';
    },

    getResourceClass(usage) {
      if (usage >= 90) return 'critical';
      if (usage >= 75) return 'warning';
      if (usage >= 50) return 'good';
      return 'excellent';
    },

    getErrorRateClass(rate) {
      if (rate >= 10) return 'critical';
      if (rate >= 5) return 'warning';
      return 'good';
    }
  }
};
</script>

<style scoped>
.monitoring-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.refresh-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.last-updated {
  font-size: 0.9em;
  color: #6c757d;
}

.health-status-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.health-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
}

.health-indicator.healthy {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.health-indicator.degraded {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
}

.health-indicator.unhealthy {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 1.1em;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.service-card {
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.service-card.healthy {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.service-card.degraded {
  background-color: #fff3cd;
  border-color: #ffeaa7;
}

.service-card.unhealthy {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.service-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-weight: 500;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.metric-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.8em;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  display: block;
  font-size: 0.9em;
  color: #6c757d;
  margin-top: 5px;
}

.progress-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.excellent {
  background-color: #28a745;
}

.progress-fill.good {
  background-color: #17a2b8;
}

.progress-fill.warning {
  background-color: #ffc107;
}

.progress-fill.critical {
  background-color: #dc3545;
}

.resource-meters {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.resource-meter {
  display: flex;
  align-items: center;
  gap: 15px;
}

.resource-meter label {
  min-width: 100px;
  font-weight: 500;
}

.meter {
  flex: 1;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.meter-value {
  min-width: 50px;
  text-align: right;
  font-weight: 500;
}

.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.perf-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.perf-label {
  font-size: 0.9em;
  color: #6c757d;
  margin-bottom: 5px;
}

.perf-value {
  font-size: 1.3em;
  font-weight: bold;
  color: #2c3e50;
}

.perf-value.critical {
  color: #dc3545;
}

.perf-value.warning {
  color: #ffc107;
}

.perf-value.good {
  color: #28a745;
}

.cache-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.cache-stat {
  text-align: center;
}

.cache-label {
  display: block;
  font-size: 0.9em;
  color: #6c757d;
  margin-bottom: 5px;
}

.cache-value {
  display: block;
  font-size: 1.3em;
  font-weight: bold;
  color: #2c3e50;
}

.cache-value.connected {
  color: #28a745;
}

.cache-value.disconnected {
  color: #dc3545;
}

.alerts-section, .logs-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.alerts-list {
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  border-left: 4px solid;
}

.alert-item.critical {
  background-color: #f8d7da;
  border-left-color: #dc3545;
}

.alert-item.warning {
  background-color: #fff3cd;
  border-left-color: #ffc107;
}

.alert-item.info {
  background-color: #d1ecf1;
  border-left-color: #17a2b8;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.alert-details {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.alert-detail {
  font-size: 0.9em;
  color: #6c757d;
}

.log-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.log-controls select,
.log-controls input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.logs-container {
  max-height: 500px;
  overflow-y: auto;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.log-entry {
  display: flex;
  gap: 15px;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-timestamp {
  color: #6c757d;
  min-width: 80px;
}

.log-level {
  min-width: 60px;
  font-weight: bold;
}

.log-entry.error .log-level {
  color: #dc3545;
}

.log-entry.warn .log-level {
  color: #ffc107;
}

.log-entry.info .log-level {
  color: #17a2b8;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.no-cache-data {
  text-align: center;
  color: #6c757d;
  padding: 20px;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .metric-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .resource-meter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .resource-meter label {
    min-width: auto;
  }
}
</style>