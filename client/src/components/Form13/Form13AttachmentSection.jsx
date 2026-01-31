// src/components/Form13/Form13AttachmentSection.jsx

import React from 'react';
import {
  Typography,
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const Form13AttachmentSection = ({
  formData,
  onFormDataChange,
  requiredAttachments = [],
}) => {
  // Common document types to show as fixed rows
  const commonDocs = [
    { code: 'BOOKING_COPY', name: 'Booking Copy' },
    { code: 'SHIP_BILL', name: 'Shipping Bill' },
    { code: 'VGM_ANXR1', name: 'VGM-Annexure 1' },
    { code: 'DLVRY_ORDER', name: 'Delivery Order' },
    { code: 'INVOICE', name: 'Invoice' },
    { code: 'PACK_LIST', name: 'Packing List' },
    { code: 'CNTNR_LOAD_PLAN', name: 'Container Load Plan' },
  ];

  // Merge common with required if they don't overlap
  const displayDocs = [...commonDocs];
  requiredAttachments.forEach(req => {
    if (!displayDocs.find(d => d.code === req.code)) {
      displayDocs.push(req);
    }
  });

  const handleFileSelect = (event, docCode) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert(`Only PDF files are allowed.`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(`File exceeds the maximum size of 5MB`);
      return;
    }

    const fileWithTitle = new File([file], file.name, { type: file.type });
    fileWithTitle.title = docCode;

    // IMPORTANT: Concept-aware replacement
    // If we are uploading Packing List, we must remove ANY existing Packing List entry 
    // even if it had a different code (like PACKING_LIST or PL) in the past.
    const isPackingList = (code) => ['PACK_LIST', 'PACKING_LIST', 'PL', 'PACKING_LIST_COPY'].includes(code);
    const isCNTRLoadPlan = (code) => ['CNTR_LOAD_PLAN', 'CNTNR_LOAD_PLAN'].includes(code);

    const otherAttachments = formData.attachments.filter(att => {
      const attTitle = att.title || att.attTitle;
      if (isPackingList(docCode) && isPackingList(attTitle)) return false;
      if (isCNTRLoadPlan(docCode) && isCNTRLoadPlan(attTitle)) return false;
      return attTitle !== docCode;
    });

    onFormDataChange('attachments', '', [...otherAttachments, fileWithTitle]);
    event.target.value = '';
  };

  const handleRemoveFile = (docCode) => {
    const isPackingList = (code) => ['PACK_LIST', 'PACKING_LIST', 'PL', 'PACKING_LIST_COPY'].includes(code);
    const isCNTRLoadPlan = (code) => ['CNTR_LOAD_PLAN', 'CNTNR_LOAD_PLAN'].includes(code);

    const newFiles = formData.attachments.filter(att => {
      const attTitle = att.title || att.attTitle;
      if (isPackingList(docCode) && isPackingList(attTitle)) return false;
      if (isCNTRLoadPlan(docCode) && isCNTRLoadPlan(attTitle)) return false;
      return attTitle !== docCode;
    });
    onFormDataChange('attachments', '', newFiles);
  };

  const getUploadedFileForType = (docCode) => {
    const isPackingList = (code) => ['PACK_LIST', 'PACKING_LIST', 'PL', 'PACKING_LIST_COPY'].includes(code);
    const isCNTRLoadPlan = (code) => ['CNTR_LOAD_PLAN', 'CNTNR_LOAD_PLAN'].includes(code);

    return formData.attachments.find(att => {
      const attTitle = att.title || att.attTitle;
      if (isPackingList(docCode) && isPackingList(attTitle)) return true;
      if (isCNTRLoadPlan(docCode) && isCNTRLoadPlan(attTitle)) return true;
      return attTitle === docCode;
    });
  };

  const SectionHeader = ({ title, showRedBar }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 4 }}>
      {showRedBar && <Box sx={{ width: 4, height: 24, bgcolor: '#0097a7', mr: 1.5, borderRadius: '2px' }} />}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', textTransform: 'uppercase' }}>
        {title}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <SectionHeader title="Attachment Details" showRedBar />
      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
        Total Attachment size should not exceed 4 MB. Uploading documents depends on internet connectivity.
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ borderTop: '2px solid #1a237e', borderRadius: 0 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#fafafa' }}>
              <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>File Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>Upload</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayDocs.map((doc) => {
              const uploadedFile = getUploadedFileForType(doc.code);
              const isRequired = requiredAttachments.find(r => r.code === doc.code)?.required;
              const fileName = uploadedFile ? (uploadedFile.name || uploadedFile.attNm || "File Attached") : "";

              return (
                <TableRow key={doc.code} hover>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {doc.name}
                      </Typography>
                      {isRequired && <Typography sx={{ color: '#d32f2f', ml: 0.5 }}>*</Typography>}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {uploadedFile ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#e8f5e9', py: 0.5, px: 2, borderRadius: '4px', border: '1px solid #c8e6c9' }}>
                          <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: '#2e7d32', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {fileName}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            sx={{
                              textTransform: 'none',
                              borderRadius: '4px',
                              borderColor: '#bdbdbd',
                              color: '#616161',
                              fontSize: '0.75rem',
                              bgcolor: '#f5f5f5',
                              '&:hover': { borderColor: '#9e9e9e', bgcolor: '#eeeeee' }
                            }}
                          >
                            Choose File
                            <input
                              type="file"
                              hidden
                              accept=".pdf"
                              onChange={(e) => handleFileSelect(e, doc.code)}
                            />
                          </Button>
                          <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                            No file chosen
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={!uploadedFile}
                      onClick={() => handleRemoveFile(doc.code)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Form13AttachmentSection;
