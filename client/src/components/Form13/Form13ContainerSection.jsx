// src/components/Form13/Form13ContainerSection.jsx

import React, { useState } from "react";
import {
  Typography,
  Button,
  IconButton,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  Collapse,
  Grid,
  Divider,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  LocalShipping as TruckIcon,
  Assignment as SBIcon,
  Warning as HazardIcon,
  AcUnit as ReeferIcon,
  OpenInFull as ODCIcon,
} from "@mui/icons-material";
import { masterData, getIsoCodesBySize } from "../../data/masterData";
import { isSpecialStowRequired } from "../../utils/form13Validations";

const ContainerRow = ({
  container,
  index,
  onFormDataChange,
  onRemoveContainer,
  validationErrors,
  containerSizes,
  cargoTp,
  locId,
  terminalCode,
  bnfCode,
  origin
}) => {
  const [open, setOpen] = useState(false);
  const availableIsoCodes = getIsoCodesBySize(container.cntnrSize);
  const sb = container.sbDtlsVo && container.sbDtlsVo[0] ? container.sbDtlsVo[0] : {};

  const handleContainerChange = (field, value) => {
    onFormDataChange("containers", field, value, index);
  };

  const handleSBChange = (field, value) => {
    onFormDataChange("shippingBills", field, value, index);
  };

  // Condition checks for field visibility
  const isHazardous = cargoTp?.includes("HAZ") || cargoTp === "HAZ";
  const isReefer = cargoTp?.includes("REF") || cargoTp === "REF";
  const isODC = cargoTp?.includes("ODC") || cargoTp === "ODC";
  const isMSC = bnfCode?.toUpperCase() === "MSCU";
  const isSpecialStowNeeded = isSpecialStowRequired(locId, terminalCode);
  const isCFS = origin === "F_CFS" || origin === "C";

  return (
    <React.Fragment>
      <TableRow hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fff' } }}>
        <TableCell sx={{ width: 40 }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ p: 0.5, minWidth: 150 }}>
          <TextField
            fullWidth
            placeholder="ABCD1234567"
            size="small"
            variant="standard"
            value={container.cntnrNo}
            onChange={(e) => handleContainerChange("cntnrNo", e.target.value.toUpperCase())}
            error={!!validationErrors[`container_${index}_cntnrNo`]}
            inputProps={{ style: { fontSize: '0.875rem' }, maxLength: 11 }}
            helperText={validationErrors[`container_${index}_cntnrNo`]}
          />
        </TableCell>
        <TableCell sx={{ p: 0.5 }}>
          <Select
            fullWidth
            size="small"
            variant="standard"
            value={container.cntnrSize}
            onChange={(e) => handleContainerChange("cntnrSize", e.target.value)}
          >
            {containerSizes.map((size) => (
              <MenuItem key={size.value} value={size.value}>{size.label}</MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell sx={{ p: 0.5, minWidth: 120 }}>
          <Select
            fullWidth
            size="small"
            variant="standard"
            value={container.iso}
            onChange={(e) => handleContainerChange("iso", e.target.value)}
          >
            {availableIsoCodes.map((iso) => (
              <MenuItem key={iso.value} value={iso.value}>{iso.label}</MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell sx={{ p: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            variant="standard"
            value={container.agentSealNo}
            onChange={(e) => handleContainerChange("agentSealNo", e.target.value)}
            inputProps={{ style: { fontSize: '0.875rem' } }}
          />
        </TableCell>
        <TableCell sx={{ p: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            variant="standard"
            value={container.vgmWt}
            onChange={(e) => handleContainerChange("vgmWt", e.target.value)}
            disabled={container.vgmViaODeX === 'Y'}
            type="number"
            inputProps={{ style: { fontSize: '0.875rem', textAlign: 'right' } }}
            error={!!validationErrors[`container_${index}_vgmWt`]}
          />
        </TableCell>
        <TableCell sx={{ textAlign: 'center' }}>
          <Checkbox
            size="small"
            checked={container.vgmViaODeX === 'Y'}
            onChange={(e) => handleContainerChange("vgmViaODeX", e.target.checked ? 'Y' : 'N')}
          />
        </TableCell>
        <TableCell>
          <IconButton size="small" color="error" onClick={() => onRemoveContainer(index)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Expanded Details Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: '#fbfbfb', border: '1px solid #eee', borderRadius: '4px' }}>
              <Grid container spacing={4}>
                {/* Section 1: Logistics */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TruckIcon sx={{ color: '#1a237e', mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e' }}>TRUCK & LOGISTICS</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Driver Name *</Typography>
                      <TextField
                        fullWidth size="small" variant="standard"
                        value={container.driverNm}
                        onChange={(e) => handleContainerChange("driverNm", e.target.value)}
                        error={!!validationErrors[`container_${index}_driverNm`]}
                        helperText={validationErrors[`container_${index}_driverNm`]}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Vehicle No</Typography>
                      <TextField
                        fullWidth size="small" variant="standard"
                        value={container.vehicleNo}
                        onChange={(e) => handleContainerChange("vehicleNo", e.target.value)}
                        error={!!validationErrors[`container_${index}_vehicleNo`]}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Custom Seal No *</Typography>
                      <TextField
                        fullWidth size="small" variant="standard"
                        value={container.customSealNo}
                        onChange={(e) => handleContainerChange("customSealNo", e.target.value)}
                        error={!!validationErrors[`container_${index}_customSealNo`]}
                      />
                    </Grid>
                    {isMSC && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Shipping Instruction No *</Typography>
                        <TextField
                          fullWidth size="small" variant="standard"
                          value={container.shpInstructNo}
                          onChange={(e) => handleContainerChange("shpInstructNo", e.target.value)}
                          error={!!validationErrors[`container_${index}_shpInstructNo`]}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Haulier</Typography>
                      <TextField
                        fullWidth size="small" variant="standard"
                        value={container.haulier}
                        onChange={(e) => handleContainerChange("haulier", e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

                {/* Section 2: Document Detail */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SBIcon sx={{ color: '#1a237e', mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e' }}>DOCUMENT DETAILS</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">SB No *</Typography>
                      <TextField fullWidth size="small" variant="standard" value={sb.shipBillInvNo || ""} onChange={(e) => handleSBChange("shipBillInvNo", e.target.value)} error={!!validationErrors[`container_${index}_shipBillInvNo`]} />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">SB Date *</Typography>
                      <TextField fullWidth size="small" variant="standard" type="date" value={sb.shipBillDt || ""} onChange={(e) => handleSBChange("shipBillDt", e.target.value)} InputLabelProps={{ shrink: true }} error={!!validationErrors[`container_${index}_shipBillDt`]} />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">LEO No</Typography>
                      <TextField fullWidth size="small" variant="standard" value={sb.leoNo || ""} onChange={(e) => handleSBChange("leoNo", e.target.value)} />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">LEO Date {sb.leoNo && "*"}</Typography>
                      <TextField fullWidth size="small" variant="standard" type="date" value={sb.leoDt || ""} onChange={(e) => handleSBChange("leoDt", e.target.value)} InputLabelProps={{ shrink: true }} error={!!validationErrors[`container_${index}_leoDt`]} disabled={!sb.leoNo} />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Packages *</Typography>
                      <TextField fullWidth size="small" variant="standard" type="number" value={sb.noOfPkg || ""} onChange={(e) => handleSBChange("noOfPkg", e.target.value)} error={!!validationErrors[`container_${index}_noOfPkg`]} />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Exporter IEC *</Typography>
                      <TextField fullWidth size="small" variant="standard" value={sb.exporterIec || ""} onChange={(e) => handleSBChange("exporterIec", e.target.value)} error={!!validationErrors[`container_${index}_exporterIec`]} />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">CHA Name *</Typography>
                      <TextField fullWidth size="small" variant="standard" value={sb.chaNm || ""} onChange={(e) => handleSBChange("chaNm", e.target.value)} error={!!validationErrors[`container_${index}_chaNm`]} />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">CHA PAN *</Typography>
                      <TextField
                        fullWidth size="small" variant="standard"
                        value={sb.chaPan || ""}
                        onChange={(e) => handleSBChange("chaPan", e.target.value.toUpperCase())}
                        error={!!validationErrors[`container_${index}_chaPan`]}
                        inputProps={{ maxLength: 10 }}
                        helperText={validationErrors[`container_${index}_chaPan`] ? "" : "Format: ABCDE1234F"}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Exporter Name *</Typography>
                      <TextField fullWidth size="small" variant="standard" value={sb.exporterNm || ""} onChange={(e) => handleSBChange("exporterNm", e.target.value)} error={!!validationErrors[`container_${index}_exporterNm`]} />
                    </Grid>
                  </Grid>
                </Grid>

                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

                {/* Section 3: Specialized Info */}
                <Grid item xs={12} md={3}>
                  {isHazardous && (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HazardIcon sx={{ color: '#d32f2f', mr: 1, fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#d32f2f' }}>HAZ CARGO INFO</Typography>
                      </Box>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">IMO No 1 *</Typography>
                          <Select
                            fullWidth
                            size="small"
                            variant="standard"
                            value={container.imoNo1 || ""}
                            onChange={(e) => handleContainerChange("imoNo1", e.target.value)}
                            error={!!validationErrors[`container_${index}_imoNo1`]}
                          >
                            {masterData.imoNumbers.map((imo) => (
                              <MenuItem key={imo.value} value={imo.value}>{imo.label}</MenuItem>
                            ))}
                          </Select>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">UN No 1 *</Typography>
                          <TextField fullWidth size="small" variant="standard" value={container.unNo1} onChange={(e) => handleContainerChange("unNo1", e.target.value)} error={!!validationErrors[`container_${index}_unNo1`]} />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">IMO No 2</Typography>
                          <Select
                            fullWidth
                            size="small"
                            variant="standard"
                            value={container.imoNo2 || ""}
                            onChange={(e) => handleContainerChange("imoNo2", e.target.value)}
                          >
                            {masterData.imoNumbers.map((imo) => (
                              <MenuItem key={imo.value} value={imo.value}>{imo.label}</MenuItem>
                            ))}
                          </Select>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">UN No 2</Typography>
                          <TextField fullWidth size="small" variant="standard" value={container.unNo2} onChange={(e) => handleContainerChange("unNo2", e.target.value)} />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {isReefer && (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ReeferIcon sx={{ color: '#0288d1', mr: 1, fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0288d1' }}>REEFER CARGO INFO</Typography>
                      </Box>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Temp (C) *</Typography>
                          <TextField fullWidth size="small" variant="standard" value={container.temp} onChange={(e) => handleContainerChange("temp", e.target.value)} error={!!validationErrors[`container_${index}_temp`]} />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Voltage</Typography>
                          <TextField fullWidth size="small" variant="standard" value={container.volt} onChange={(e) => handleContainerChange("volt", e.target.value)} />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {isODC && (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ODCIcon sx={{ color: '#ef6c00', mr: 1, fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ef6c00' }}>ODC CARGO INFO</Typography>
                      </Box>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Top (m)</Typography>
                          <TextField fullWidth size="small" variant="standard" value={container.topDimensions} onChange={(e) => handleContainerChange("topDimensions", e.target.value)} error={!!validationErrors[`container_${index}_topDimensions`]} />
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Front (m)</Typography>
                          <TextField fullWidth size="small" variant="standard" value={container.frontDimensions} onChange={(e) => handleContainerChange("frontDimensions", e.target.value)} error={!!validationErrors[`container_${index}_frontDimensions`]} />
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Back (m)</Typography>
                          <TextField fullWidth size="small" variant="standard" value={container.backDimensions} onChange={(e) => handleContainerChange("backDimensions", e.target.value)} error={!!validationErrors[`container_${index}_backDimensions`]} />
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Left (m)</Typography>
                          <TextField fullWidth size="small" variant="standard" value={container.leftDimensions} onChange={(e) => handleContainerChange("leftDimensions", e.target.value)} error={!!validationErrors[`container_${index}_leftDimensions`]} />
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Right (m)</Typography>
                          <TextField fullWidth size="small" variant="standard" value={container.rightDimensions} onChange={(e) => handleContainerChange("rightDimensions", e.target.value)} error={!!validationErrors[`container_${index}_rightDimensions`]} />
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">ODC Units</Typography>
                          <TextField fullWidth size="small" variant="standard" value={container.odcUnits} onChange={(e) => handleContainerChange("odcUnits", e.target.value)} error={!!validationErrors[`container_${index}_odcUnits`]} />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {isSpecialStowNeeded && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Special Stow *</Typography>
                      <TextField fullWidth size="small" variant="standard" value={container.spclStow} onChange={(e) => handleContainerChange("spclStow", e.target.value)} error={!!validationErrors[`container_${index}_spclStow`]} />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Special Stow Remark *</Typography>
                      <TextField fullWidth size="small" variant="standard" value={container.spclStowRemark} onChange={(e) => handleContainerChange("spclStowRemark", e.target.value)} error={!!validationErrors[`container_${index}_spclStowRemark`]} />
                    </Box>
                  )}

                  {!isHazardous && !isReefer && !isODC && !isSpecialStowNeeded && (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                      <Typography variant="caption" fontStyle="italic">No specialized info required for General Cargo</Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const Form13ContainerSection = ({
  formData,
  onFormDataChange,
  onAddContainer,
  onRemoveContainer,
  validationErrors = {},
}) => {
  const { containerSizes } = masterData;

  const SectionHeader = ({ title, showRedBar }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
      {showRedBar && <Box sx={{ width: 4, height: 24, bgcolor: '#1a237e', mr: 1.5, borderRadius: '2px' }} />}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', textTransform: 'uppercase' }}>
        {title}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <SectionHeader title="Container & Cargo Details" showRedBar />

      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {formData.containers.length} Container(s) added
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onAddContainer()}
          sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#43a047' }, textTransform: 'none' }}
        >
          Add Container
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell />
              <TableCell sx={{ fontWeight: 'bold' }}>Container No *</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Size *</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ISO Code *</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Agent Seal *</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>VGM (MT) *</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>via ODeX</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.containers.map((container, index) => (
              <ContainerRow
                key={index}
                index={index}
                container={container}
                onFormDataChange={onFormDataChange}
                onRemoveContainer={onRemoveContainer}
                validationErrors={validationErrors}
                containerSizes={containerSizes}
                cargoTp={formData.cargoTp}
                locId={formData.locId}
                terminalCode={formData.terminalCode}
                bnfCode={formData.bnfCode}
                origin={formData.origin}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
        <HazardIcon sx={{ color: '#1976d2', mr: 1.5, fontSize: 20 }} />
        <Typography variant="caption" sx={{ color: '#0d47a1', fontWeight: 600 }}>
          IMPORTANT: If your cargo is Hazardous (HAZ), Reefer (REF), or ODC, specialized fields will automatically appear in the expanded section. Click the arrow icon next to the container number to fill them.
        </Typography>
      </Box>
    </Box>
  );
};

export default Form13ContainerSection;