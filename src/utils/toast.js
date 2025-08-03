// Toast utility for showing notifications

/**
 * Create and display a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export function createToast(message, type = 'info', duration = 3000) {
  // Remove any existing toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <i class="toast-icon fas ${getToastIcon(type)}"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  // Add styles
  addToastStyles();

  // Add to DOM
  document.body.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('toast-fade-out');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }
  }, duration);
}

/**
 * Get appropriate icon for toast type
 * @param {string} type - Toast type
 * @returns {string} FontAwesome icon class
 */
function getToastIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  return icons[type] || icons.info;
}

/**
 * Add toast styles to document if not already present
 */
function addToastStyles() {
  if (document.querySelector('#toast-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'toast-styles';
  styles.textContent = `
    .toast-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      min-width: 300px;
      max-width: 500px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      animation: toast-slide-in 0.3s ease forwards;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .toast-content {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
    }

    .toast-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
      color: var(--text-primary);
    }

    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: var(--text-secondary);
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .toast-close:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    /* Toast Types */
    .toast-success {
      border-left: 4px solid var(--success-color);
    }
    .toast-success .toast-icon {
      color: var(--success-color);
    }

    .toast-error {
      border-left: 4px solid var(--error-color);
    }
    .toast-error .toast-icon {
      color: var(--error-color);
    }

    .toast-warning {
      border-left: 4px solid var(--warning-color);
    }
    .toast-warning .toast-icon {
      color: var(--warning-color);
    }

    .toast-info {
      border-left: 4px solid var(--info-color);
    }
    .toast-info .toast-icon {
      color: var(--info-color);
    }

    /* Animations */
    @keyframes toast-slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-fade-out {
      animation: toast-fade-out 0.3s ease forwards;
    }

    @keyframes toast-fade-out {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .toast-notification {
        left: 20px;
        right: 20px;
        min-width: auto;
        transform: translateY(-100%);
        animation: toast-slide-down 0.3s ease forwards;
      }

      @keyframes toast-slide-down {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .toast-fade-out {
        animation: toast-slide-up 0.3s ease forwards;
      }

      @keyframes toast-slide-up {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }
    }
  `;
  
  document.head.appendChild(styles);
}

// Export default for convenience
export default {
  createToast,
  success: (message, duration) => createToast(message, 'success', duration),
  error: (message, duration) => createToast(message, 'error', duration),
  warning: (message, duration) => createToast(message, 'warning', duration),
  info: (message, duration) => createToast(message, 'info', duration)
};