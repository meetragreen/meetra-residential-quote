// server/models/Quotation.js
const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  // 1. Customer Info
  quotationNumber: { type: String, required: true }, // e.g., MGE-001
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: Date, default: Date.now },

  // 2. Project Requirements
  systemCapacity: { type: Number, required: true }, // e.g., 6 (KW)
  solarPanelName: { type: String, required: true }, // e.g., Raynex 550Wp
  inverterName: { type: String, required: true }, // e.g., Growatt 6kW

  // 3. Cost Calculation (Page 7)
  costs: {
    ratePerKw: { type: Number, required: true }, // e.g., 45000
    basicSystemCost: { type: Number, required: true }, // Capacity * Rate
    gstAmount: { type: Number, default: 0 }, 
    netMeterCharges: { type: Number, default: 0 }, // Extra charges
    totalAmountBeforeSubsidy: { type: Number, required: true },
    
    // Subsidy Logic
    subsidyAmount: { type: Number, default: 0 }, // Calculated automatically
    netPayableByUser: { type: Number, required: true } // Total - Subsidy
  },

  // Link this quote to the Settings used at that time (Optional but good practice)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quotation', quotationSchema);