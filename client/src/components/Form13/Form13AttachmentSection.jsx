// src/components/Form13/Form13AttachmentSection.jsx

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const Form13AttachmentSection = ({ 
  formData, 
  onFormDataChange,
  requiredAttachments = [],
  validationErrors = {}
}) => {
  const [selectedDocType, setSelectedDocType] = useState('BOOKING_COPY');

  // All possible document types from API specification
  const documentTypes = [
    { code: 'BOOKING_COPY', name: 'Booking Copy', description: 'Mandatory for all locations' },
    { code: 'BOOK_CNFRM_CPY', name: 'Booking Confirmation Copy', description: 'Location specific' },
    { code: 'BOOKING_CONF_COPY', name: 'Booking Confirmation Copy', description: 'Vishakapatnam specific' },
    { code: 'CHK_LIST', name: 'Check List', description: 'Location specific' },
    { code: 'CLN_CRTFCT', name: 'Cleaning Certificate', description: 'For HAZ cargo with empty container' },
    { code: 'CNTNR_LOAD_PLAN', name: 'Container Load Plan', description: 'For Dock Stuff origin' },
    { code: 'CUSTOMS_EXAM_REPORT', name: 'Customs Examination Report', description: 'For On Wheel origin' },
    { code: 'DG_DCLRTION', name: 'DG Declaration', description: 'For HAZ/ODC cargo' },
    { code: 'DLVRY_ORDER', name: 'Delivery Order', description: 'Origin specific' },
    { code: 'FIRE_OFC_CRTFCT', name: 'Fire Office Certificate', description: 'For HAZ/ODC cargo' },
    { code: 'HAZ_DG_DECLARATION', name: 'HAZ DG Declaration', description: 'For HAZ/ODC cargo' },
    { code: 'INVOICE', name: 'Invoice', description: 'Origin specific' },
    { code: 'LASHING_CERTIFICATE', name: 'Lashing Certificate', description: 'For HAZ/ODC cargo' },
    { code: 'MMD_APPRVL', name: 'MMD Approval', description: 'For HAZ/ODC cargo' },
    { code: 'MSDS', name: 'MSDS', description: 'Material Safety Data Sheet' },
    { code: 'MSDS_SHEET', name: 'MSDS Sheet', description: 'For HAZ/ODC cargo' },
    { code: 'ODC_SURVEYOR_REPORT_PHOTOS', name: 'ODC Surveyor Report + Photos', description: 'For ODC cargo' },
    { code: 'PACK_LIST', name: 'Packing List', description: 'For Factory Stuff' },
    { code: 'PRE_EGM', name: 'Pre-EGM', description: 'Chennai specific - Optional' },
    { code: 'SHIP_BILL', name: 'Shipping Bill', description: 'Origin specific' },
    { code: 'SHIPPING_INSTRUCTION', name: 'Shipping Instruction (SI)', description: 'Vishakapatnam specific' },
    { code: 'SURVY_RPRT', name: 'Survey Report', description: 'For HAZ/ODC cargo' },
    { code: 'VGM_ANXR1', name: 'VGM-Annexure 1', description: 'Origin specific' },
    { code: 'OTHER_DOCUMENT', name: 'Other Document', description: 'Any other supporting document' },
  ];

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (file.type !== 'application/pdf') {
        alert(`File ${file.name} is not a PDF. Only PDF files are allowed.`);
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB (5242880 bytes as per API spec)
        alert(`File ${file.name} exceeds the maximum size of 5MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      // Add title property to each file based on selected document type
      const filesWithTitle = validFiles.map(file => {
        // Create a new File object with additional properties
        const fileWithTitle = new File([file], file.name, { type: file.type });
        fileWithTitle.title = selectedDocType; // Attach title for API submission
        return fileWithTitle;
      });

      onFormDataChange('attachments', '', [...formData.attachments, ...filesWithTitle]);
      
      // Reset to BOOKING_COPY after upload
      setSelectedDocType('BOOKING_COPY');
    }
    
    // Reset input
    event.target.value = '';
  };

  const handleRemoveFile = (index) => {
    const newFiles = formData.attachments.filter((_, i) => i !== index);
    onFormDataChange('attachments', '', newFiles);
  };

  const handleChangeDocumentType = (index, newType) => {
    const updatedFiles = [...formData.attachments];
    const file = updatedFiles[index];
    
    // Create new file object with updated title
    const updatedFile = new File([file], file.name, { type: file.type });
    updatedFile.title = newType;
    updatedFiles[index] = updatedFile;
    
    onFormDataChange('attachments', '', updatedFiles);
  };

  // Get document type details
  const getDocumentTypeDetails = (code) => {
    return documentTypes.find(dt => dt.code === code) || { code, name: code, description: '' };
  };

  // Check if a required document is uploaded
  const isRequiredDocumentUploaded = (docCode) => {
    return formData.attachments.some(file => file.title === docCode);
  };

  // Count validation errors related to attachments
  const attachmentErrors = Object.keys(validationErrors).filter(key => 
    key.startsWith('attachment_')
  );

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
          Document Attachments
        </Typography>

        {/* Show validation errors */}
        {attachmentErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Missing Required Documents:
            </Typography>
            {attachmentErrors.map(errorKey => (
              <Typography key={errorKey} variant="body2">
                • {validationErrors[errorKey]}
              </Typography>
            ))}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Upload required documents in PDF format (Max 5MB per file)
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  label="Document Type"
                >
                  {documentTypes.map(docType => (
                    <MenuItem key={docType.code} value={docType.code}>
                      {docType.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ height: '40px' }}
              >
                Upload PDF
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Required Documents Checklist */}
        {requiredAttachments.length > 0 && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Required Documents for this submission:
            </Typography>
            <List dense>
              {requiredAttachments.map(reqDoc => {
                const isUploaded = isRequiredDocumentUploaded(reqDoc.code);
                return (
                  <ListItem key={reqDoc.code} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {isUploaded ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : reqDoc.required ? (
                        <WarningIcon color="error" fontSize="small" />
                      ) : (
                        <AttachFileIcon color="disabled" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          {reqDoc.name}
                          {reqDoc.required && (
                            <Chip 
                              label="Required" 
                              size="small" 
                              color="error" 
                              sx={{ ml: 1, height: 20 }} 
                            />
                          )}
                          {isUploaded && (
                            <Chip 
                              label="Uploaded" 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1, height: 20 }} 
                            />
                          )}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* Uploaded Files List */}
        {formData.attachments.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Uploaded Documents ({formData.attachments.length})
            </Typography>
            <List>
              {formData.attachments.map((file, index) => {
                const docDetails = getDocumentTypeDetails(file.title || 'OTHER_DOCUMENT');
                return (
                  <ListItem
                    key={index}
                    sx={{ 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      mb: 1,
                      flexDirection: 'column',
                      alignItems: 'stretch'
                    }}
                  >
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                      <ListItemIcon>
                        <AttachFileIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        }
                      />
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveFile(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ mt: 1, pl: 7 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Document Type</InputLabel>
                        <Select
                          value={file.title || 'OTHER_DOCUMENT'}
                          onChange={(e) => handleChangeDocumentType(index, e.target.value)}
                          label="Document Type"
                        >
                          {documentTypes.map(docType => (
                            <MenuItem key={docType.code} value={docType.code}>
                              {docType.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {docDetails.description}
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
            <AttachFileIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.disabled">
              No documents uploaded
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Select document type and click upload button to add PDF documents
            </Typography>
          </Box>
        )}

        {/* Information Box */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Document Upload Guidelines:
          </Typography>
          <Typography variant="body2" component="div">
            • Only PDF files are accepted (Max 5MB per file)
            <br />
            • Select the correct document type before uploading
            <br />
            • You can change document type after upload using the dropdown
            <br />
            • Required documents are determined by your location, cargo type, and origin
            <br />
            • Ensure all mandatory documents are uploaded before submission
            <br />
            • File names should be clear and identify the document content
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Form13AttachmentSection;
