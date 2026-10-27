// client/src/services/esbAPI.js
import api from "./api";

const ESB_BASE_URL = "esb";

export const esbAPI = {
  // Vessel Master API
  getVesselMaster: (requestData) =>
    api.post(`${ESB_BASE_URL}/vessel-master`, requestData, { timeout: 75000 }),

  // Attachment Master API
  getAttachmentMaster: (requestData) =>
    api.post(`${ESB_BASE_URL}/attachment-master`, requestData),

  // e-SB (Shipping Bill) Submission API
  submitESB: async (formData) => {
    try {
      const response = await api.post(`${ESB_BASE_URL}/submit`, formData);

      const respData = response.data || {};
      const msg =
        respData.responseMessage ||
        respData.responsemessage ||
        respData.data?.responsemessage ||
        respData.data?.responseMessage;

      if (msg && msg.toLowerCase() !== "success" && !respData.odexRefNo && !respData.data?.odexRefNo) {
        throw new Error(msg);
      }

      const odexRefNo = respData.odexRefNo || respData.data?.odexRefNo;

      return {
        success: true,
        data: respData,
        odexRefNo: odexRefNo || null,
        internalRef: respData.internalRef || null,
      };
    } catch (error) {
      if (error.response?.data?.responseMessage) {
        throw new Error(`ODeX Error: ${error.response.data.responseMessage}`);
      }
      if (error.response?.data?.error) {
        throw new Error(`Error: ${error.response.data.error}`);
      }
      throw error;
    }
  },

  // Get e-SB Status API
  getESBStatus: (statusData) =>
    api.post(`${ESB_BASE_URL}/status`, statusData),

  // Amend e-SB API
  amendESB: (amendData) =>
    api.post(`${ESB_BASE_URL}/amend`, amendData),

  // Search previous entry to copy data
  getPreviousEntry: (searchData) =>
    api.post(`${ESB_BASE_URL}/search-previous`, searchData),

  // Get requests for tracking
  getRequests: (filters) =>
    api.get(`${ESB_BASE_URL}/requests`, { params: filters }),

  // Get single request by ID
  getRequestById: (esbId) =>
    api.get(`${ESB_BASE_URL}/requests/${esbId}`),

  // Update e-SB request
  updateRequest: (esbId, updateData) =>
    api.put(`${ESB_BASE_URL}/requests/${esbId}`, updateData),

  // Get hashkey from backend
  getHashKey: (hashData) =>
    api.post(`${ESB_BASE_URL}/hashkey`, hashData),
};
