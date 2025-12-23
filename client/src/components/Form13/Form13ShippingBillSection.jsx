// src/components/Form13/Form13ShippingBillSection.jsx

import React from 'react';
import {
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
} from '@mui/material';

const Form13ShippingBillSection = ({ 
  formData, 
  containerIndex = 0, 
  onFormDataChange,
  validationErrors = {}
}) => {
  const container = formData.containers?.[containerIndex];
  const shippingBill = container?.sbDtlsVo?.[0] || {};

  if (!container) {
    return (
      <Alert severity="error">
        Container data not found for index {containerIndex}
      </Alert>
    );
  }

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
          Shipping Bill Information - Container {containerIndex + 1}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Container: {container.cntnrNo || 'Not specified'}
        </Typography>

        <Grid container spacing={2}>
          {/* Shipping Bill/Invoice No */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Shipping Bill/Invoice No *"
              value={shippingBill.shipBillInvNo || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'shipBillInvNo', e.target.value, containerIndex)}
              required
              error={!!validationErrors[`container_${containerIndex}_shipBillInvNo`]}
              helperText={validationErrors[`container_${containerIndex}_shipBillInvNo`]}
            />
          </Grid>

          {/* Shipping Bill Date */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Shipping Bill Date *"
              value={shippingBill.shipBillDt || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'shipBillDt', e.target.value, containerIndex)}
              InputLabelProps={{ shrink: true }}
              required
              error={!!validationErrors[`container_${containerIndex}_shipBillDt`]}
              helperText={validationErrors[`container_${containerIndex}_shipBillDt`]}
            />
          </Grid>

          {/* LEO No */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="LEO No"
              value={shippingBill.leoNo || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'leoNo', e.target.value, containerIndex)}
              helperText="Let Export Order Number (Optional)"
            />
          </Grid>

          {/* LEO Date - Conditional when LEO No is provided */}
          {shippingBill.leoNo && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="date"
                label="LEO Date *"
                value={shippingBill.leoDt || ''}
                onChange={(e) => onFormDataChange('shippingBills', 'leoDt', e.target.value, containerIndex)}
                InputLabelProps={{ shrink: true }}
                required
                error={!!validationErrors[`container_${containerIndex}_leoDt`]}
                helperText={validationErrors[`container_${containerIndex}_leoDt`] || "Required when LEO No is provided"}
              />
            </Grid>
          )}

          {/* CHA Name */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="CHA Name *"
              value={shippingBill.chaNm || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'chaNm', e.target.value, containerIndex)}
              required
              error={!!validationErrors[`container_${containerIndex}_chaNm`]}
              helperText={validationErrors[`container_${containerIndex}_chaNm`] || "Customs House Agent Name"}
            />
          </Grid>

          {/* CHA PAN */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="CHA PAN *"
              value={shippingBill.chaPan || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'chaPan', e.target.value.toUpperCase(), containerIndex)}
              required
              inputProps={{ 
                pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}',
                maxLength: 10
              }}
              error={!!validationErrors[`container_${containerIndex}_chaPan`]}
              helperText={validationErrors[`container_${containerIndex}_chaPan`] || "Format: ABCDE1234F"}
            />
          </Grid>

          {/* Exporter Name */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Exporter Name *"
              value={shippingBill.exporterNm || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'exporterNm', e.target.value, containerIndex)}
              required
              error={!!validationErrors[`container_${containerIndex}_exporterNm`]}
              helperText={validationErrors[`container_${containerIndex}_exporterNm`]}
            />
          </Grid>

          {/* Exporter IEC */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Exporter IEC *"
              value={shippingBill.exporterIec || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'exporterIec', e.target.value, containerIndex)}
              required
              inputProps={{ 
                pattern: '[0-9]{10}',
                maxLength: 10
              }}
              error={!!validationErrors[`container_${containerIndex}_exporterIec`]}
              helperText={validationErrors[`container_${containerIndex}_exporterIec`] || "10 digit numeric IEC code"}
            />
          </Grid>

          {/* Number of Packages */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Number of Packages *"
              value={shippingBill.noOfPkg || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'noOfPkg', parseInt(e.target.value) || 0, containerIndex)}
              required
              inputProps={{ min: "1" }}
              error={!!validationErrors[`container_${containerIndex}_noOfPkg`]}
              helperText={validationErrors[`container_${containerIndex}_noOfPkg`]}
            />
          </Grid>
        </Grid>

        {/* Information Box */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Shipping Bill Requirements:
          </Typography>
          <Typography variant="body2" component="div">
            • All fields are mandatory for customs documentation
            <br />
            • LEO (Let Export Order) number and date are optional but recommended
            <br />
            • CHA PAN must be in valid format (5 letters + 4 digits + 1 letter)
            <br />
            • Exporter IEC code must be 10 digits numeric
            <br />
            • Each container requires separate shipping bill details
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Form13ShippingBillSection;