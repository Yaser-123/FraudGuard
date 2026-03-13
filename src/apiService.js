// apiService.js - Service to handle API calls to OmniDimension

const API_CONFIG = {
  BASE_URL: "http://localhost:3001/api" // Using our local backend server
};

export const dispatchCall = async (complaintData) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/dispatch-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ complaintData })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error dispatching call:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to extract text from uploaded image using OCR
export const extractTextFromImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_CONFIG.BASE_URL}/extract-text-from-image`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error extracting text from image:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Admin API functions
export const fetchComplaints = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/complaints`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error fetching complaints:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const fetchComplaintById = async (id) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/complaints/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error fetching complaint:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
