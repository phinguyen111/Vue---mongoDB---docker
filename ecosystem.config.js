module.exports = {
  apps: [{
    name: 'digital-library',
    script: 'server.js',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto restart configuration
    watch: false, // Set to true for development
    ignore_watch: ['node_modules', 'logs', 'dist'],
    max_memory_restart: '1G',
    
    // Advanced PM2 features
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true,
    
    // Health monitoring
    health_check_url: 'http://localhost:3000/api/health',
    health_check_grace_period: 3000,
    
    // Environment specific settings
    node_args: '--max-old-space-size=1024'
  }],
  
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/digital-library.git',
      path: '/var/www/digital-library',
      'post-deploy': 'npm install && npm run build:prod && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    },
    staging: {
      user: 'deploy',
      host: 'your-staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:yourusername/digital-library.git',
      path: '/var/www/digital-library-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};