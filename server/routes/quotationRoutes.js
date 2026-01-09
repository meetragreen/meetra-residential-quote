// server/routes/quotationRoutes.js
const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');

// Helper Function: Calculate Govt Subsidy (PM Surya Ghar Logic)
// 1kW = 30,000 | 2kW = 60,000 | 3kW+ = 78,000 (Max)
const calculateSubsidy = (capacityKW) => {
  if (capacityKW <= 1) return 30000;
  if (capacityKW <= 2) return 60000;
  return 78000; // Capped at 3kW subsidy for anything higher
};

// POST: Create a new Quotation
router.post('/', async (req, res) => {
  try {
    const data = req.body;

    // 1. Auto-Calculate Subsidy if not provided
    const subsidy = calculateSubsidy(data.systemCapacity);
    
    // 2. Calculate Final Net Payable
    // Formula: Total Cost - Subsidy = Net Payable
    const netPayable = data.costs.totalAmountBeforeSubsidy - subsidy;

    // 3. Prepare the object to save
    const newQuote = new Quotation({
      ...data,
      costs: {
        ...data.costs,
        subsidyAmount: subsidy,
        netPayableByUser: netPayable
      }
    });

    const savedQuote = await newQuote.save();
    res.status(201).json(savedQuote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET: Get All Quotations (For your Dashboard list)
router.get('/', async (req, res) => {
  try {
    const quotes = await Quotation.find().sort({ date: -1 }); // Newest first
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Get Single Quotation by ID (For the PDF Page)
router.get('/:id', async (req, res) => {
  try {
    const quote = await Quotation.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;