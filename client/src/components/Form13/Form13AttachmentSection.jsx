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
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';

const ALL_DOC_TYPES = {
  BOOKING_COPY: "Booking Copy",
  PRE_EGM: "Pre-EGM",
  SHIP_BILL: "Shipping Bill",
  SHIPPING_INSTRUCTION: "Shipping instruction (SI)",
  SURVY_RPRT: "Survey Report",
  VGM_ANXR1: "VGM-Annexure 1",
  MSDS: "MSDS",
  MSDS_SHEET: "MSDS Sheet",
  ODC_SURVEYOR_REPORT_PHOTOS: "ODC SURVEYOR REPORT + PHOTOS",
  PACK_LIST: "Packing List",
  HAZ_DG_DECLARATION: "HAZ DG DECLARATION",
  INVOICE: "Invoice",
  LASHING_CERTIFICATE: "LASHING CERTIFICATE",
  MMD_APPRVL: "MMD Approval",
  CUSTOMS_EXAM_REPORT: "Customs Examination Report",
  DG_DCLRTION: "DG Declaration",
  DLVRY_ORDER: "Delivery Order",
  FIRE_OFC_CRTFCT: "Fire Office Certificate",
  BOOK_CNFRM_CPY: "Booking Confirmation Copy",
  BOOKING_CONF_COPY: "Booking confirmation copy",
  CHK_LIST: "Check List",
  CLN_CRTFCT: "Cleaning certificate",
  CNTNR_LOAD_PLAN: "Container Load Plan",
};

const Form13AttachmentSection = ({
  formData,
  onFormDataChange,
  requiredAttachments = [],
}) => {
  const [selectedNewType, setSelectedNewType] = React.useState('');

  // Only show what is mandatory from the requiredAttachments passed from parent
  const mandatoryCodes = requiredAttachments.filter(req => req.required).map(r => r.code);
  const displayDocs = requiredAttachments.filter(req => req.required);

  // Combine mandatory slots and custom uploaded files
  // mandatoryDocs are the base slots
  // customFiles are entries for each file that is NOT a mandatory slot
  const customFiles = formData.attachments.filter(att => {
    const attTitle = att.title || att.attTitle;
    return !mandatoryCodes.includes(attTitle);
  }).map((att, idx) => {
    const attTitle = att.title || att.attTitle;
    return {
      code: attTitle,
      name: ALL_DOC_TYPES[attTitle] || attTitle,
      required: false,
      isCustom: true,
      file: att,
      uniqueKey: `custom_${attTitle}_${idx}_${att.name || att.attNm}`
    };
  });

  const allDisplayRows = [
    ...displayDocs.map(d => ({ ...d, uniqueKey: `mandatory_${d.code}` })),
    ...customFiles
  ];

  const isPackingList = (code) => ['PACK_LIST', 'PACKING_LIST', 'PL', 'PACKING_LIST_COPY'].includes(code);
  const isCNTRLoadPlan = (code) => ['CNTR_LOAD_PLAN', 'CNTNR_LOAD_PLAN'].includes(code);

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

    // Check if it's a mandatory slot
    const isMandatory = mandatoryCodes.includes(docCode);

    let otherAttachments;
    if (isMandatory) {
      // For mandatory slots, replace the existing file of that type
      otherAttachments = formData.attachments.filter(att => {
        const attTitle = att.title || att.attTitle;
        if (isPackingList(docCode) && isPackingList(attTitle)) return false;
        if (isCNTRLoadPlan(docCode) && isCNTRLoadPlan(attTitle)) return false;
        return attTitle !== docCode;
      });
    } else {
      // For custom uploads, check if the exact same file (name and type) is already there to avoid duplicates
      const alreadyExists = formData.attachments.some(att =>
        (att.title || att.attTitle) === docCode && (att.name || att.attNm) === file.name
      );
      if (alreadyExists) {
        alert("This file is already attached for this document type.");
        return;
      }
      otherAttachments = formData.attachments;
    }

    onFormDataChange('attachments', '', [...otherAttachments, fileWithTitle]);
    if (event.target) event.target.value = '';
    setSelectedNewType('');
  };

  const handleRemoveFile = (docCode, fileName) => {
    const isMandatory = mandatoryCodes.includes(docCode);

    const newFiles = formData.attachments.filter(att => {
      const attTitle = att.title || att.attTitle;
      const attNm = att.name || att.attNm;

      if (isMandatory) {
        if (isPackingList(docCode) && isPackingList(attTitle)) return false;
        if (isCNTRLoadPlan(docCode) && isCNTRLoadPlan(attTitle)) return false;
        return attTitle !== docCode;
      } else {
        // Specific removal for custom files
        return !(attTitle === docCode && attNm === fileName);
      }
    });
    onFormDataChange('attachments', '', newFiles);
  };

  const getUploadedFileForType = (docCode) => {
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

      <TableContainer component={Paper} elevation={0} sx={{ borderTop: '2px solid #1a237e', borderRadius: 0, mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#fafafa' }}>
              <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>File Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>Upload</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allDisplayRows.map((row) => {
              const docCode = row.code;
              const isMandatory = !row.isCustom;
              const uploadedFile = isMandatory ? getUploadedFileForType(docCode) : row.file;

              const isRequired = row.required;
              const fileName = uploadedFile ? (uploadedFile.name || uploadedFile.attNm || "File Attached") : "";

              return (
                <TableRow key={row.uniqueKey} hover>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {row.name}
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
                              onChange={(e) => handleFileSelect(e, docCode)}
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
                      onClick={() => handleRemoveFile(docCode, fileName)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Row for adding new custom document */}
            <TableRow sx={{ bgcolor: '#fcfcfc' }}>
              <TableCell>
                <FormControl fullWidth size="small" variant="standard">
                  <Select
                    displayEmpty
                    value={selectedNewType}
                    onChange={(e) => setSelectedNewType(e.target.value)}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="" disabled>Select Document Type</MenuItem>
                    {Object.entries(ALL_DOC_TYPES)
                      .filter(([code]) => !mandatoryCodes.includes(code))
                      .map(([code, name]) => (
                        <MenuItem key={code} value={code}>{name}</MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  component="label"
                  size="small"
                  disabled={!selectedNewType}
                  startIcon={<UploadIcon />}
                  sx={{
                    textTransform: 'none',
                    bgcolor: selectedNewType ? '#1a237e' : '#bdbdbd',
                    '&:hover': { bgcolor: '#121858' }
                  }}
                >
                  Upload
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={(e) => handleFileSelect(e, selectedNewType)}
                  />
                </Button>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Form13AttachmentSection;
