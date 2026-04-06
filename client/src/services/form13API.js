// src/services/form13API.js
import api from "./api";

const FORM13_BASE_URL = "form13";

export const form13API = {
  // Vessel Master API - Calls actual ODeX API
  getVesselMaster: (requestData) =>
    api.post(`${FORM13_BASE_URL}/vessel-master`, requestData),

  // POD Master API - Calls actual ODeX API
  getPODMaster: (requestData) =>
    api.post(`${FORM13_BASE_URL}/pod-master`, requestData),

  // Form 13 Submission API - Calls actual ODeX API
  submitForm13: async (formData) => {
    try {
      const response = await api.post(`${FORM13_BASE_URL}/submit`, formData);

      // Handle ODeX API response structure
      const respData = response.data || {};
      const msg = respData.responseMessage || respData.responsemessage || respData.data?.responsemessage || respData.data?.responseMessage;

      if (msg && msg.toLowerCase() !== "success") {
        // This is an ODeX error response
        throw new Error(msg);
      }

      // If we have odexRefNo (either at root or inside data), it's successful
      const odexRefNo = respData.odexRefNo || respData.data?.odexRefNo;

      if (odexRefNo) {
        return {
          success: true,
          data: respData,
          odexRefNo: odexRefNo
        };
      }

      return response;
    } catch (error) {
      // Enhanced error handling for ODeX responses
      if (error.response?.data?.responseMessage) {
        throw new Error(`ODeX Error: ${error.response.data.responseMessage}`);
      }
      throw error;
    }
  },

  // Get Form 13 Status API - Calls actual ODeX API
  getForm13Status: (statusData) =>
    api.post(`${FORM13_BASE_URL}/status`, statusData),

  // Form 13 Cancellation API - Calls actual ODeX API
  cancelForm13: (cancelData) =>
    api.post(`${FORM13_BASE_URL}/cancel`, cancelData),

  // Get previous entry for copying data
  getPreviousEntry: (searchData) =>
    api.post(`${FORM13_BASE_URL}/search-previous`, searchData),

  // Get Form 13 requests for tracking
  getRequests: (filters) => api.get(`${FORM13_BASE_URL}/requests`, { params: filters }),

  // Get Form 13 request by ID for editing
  getRequestById: (f13Id) => api.get(`${FORM13_BASE_URL}/requests/${f13Id}`),

  // Update Form 13 request
  updateRequest: (f13Id, updateData) =>
    api.put(`${FORM13_BASE_URL}/requests/${f13Id}`, updateData),

  // Get hashkey from backend
  getHashKey: (hashData) => api.post(`${FORM13_BASE_URL}/hashkey`, hashData),
};