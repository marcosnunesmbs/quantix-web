// Error handling utility for API calls

export interface APIError {
  statusCode?: number;
  error: string;
  message: string;
}

export const handleApiError = (error: any): APIError => {
  if (error.response) {
    // Server responded with error status
    return {
      statusCode: error.response.status,
      error: error.response.statusText,
      message: error.response.data?.message || 'An error occurred while processing your request'
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      error: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.'
    };
  } else {
    // Something else happened
    return {
      error: 'Request Error',
      message: error.message || 'An unexpected error occurred'
    };
  }
};

export const showErrorToast = (error: APIError): void => {
  console.error(`${error.error}: ${error.message}`);
  // In a real implementation, this would use a toast notification library
};