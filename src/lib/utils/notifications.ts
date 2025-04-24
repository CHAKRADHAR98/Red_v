import { toast } from 'react-toastify';

/**
 * Show a success toast notification
 */
export const showSuccess = (message: string) => {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show an error toast notification
 */
export const showError = (message: string, error?: any) => {
  if (error) {
    console.error(message, error);
  }
  
  toast.error(message, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show an info toast notification
 */
export const showInfo = (message: string) => {
  toast.info(message, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show a warning toast notification
 */
export const showWarning = (message: string) => {
  toast.warning(message, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};