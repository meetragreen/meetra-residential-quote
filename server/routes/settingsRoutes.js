const express = require('express');
const router = express.Router();
const multer = require('multer');
const CompanySettings = require('../models/CompanySettings');

// Configure Multer to hold file in Memory (RAM) temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- 1. GET SETTINGS ---
router.get('/', async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = new CompanySettings();
      await settings.save();
    }
    // Check if the pdfBuffer exists in DB
    const hasFile = !!settings.pdfFile;

    res.json({ 
      quotationSequence: settings.quotationSequence,
      hasTemplate: hasFile 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 2. UPLOAD TEMPLATE (Save to DB) ---
router.post('/upload-template', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let settings = await CompanySettings.findOne();
    if (!settings) settings = new CompanySettings();
    
    settings.pdfFile = req.file.buffer; // Save binary data
    settings.hasTemplate = true;
    await settings.save();
    
    res.json({ message: 'Success', hasTemplate: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 3. DOWNLOAD TEMPLATE (Fetch from DB) ---
router.get('/download-template', async (req, res) => {
  try {
    const settings = await CompanySettings.findOne();
    if (!settings || !settings.pdfFile) {
        return res.status(404).send("Template not found");
    }
    // Send the buffer back as a PDF file
    res.contentType("application/pdf");
    res.send(settings.pdfFile);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- 4. UPDATE SEQUENCE ---
router.put('/update-sequence', async (req, res) => {
  try {
    const { currentNo } = req.body;
    let settings = await CompanySettings.findOne();
    settings.quotationSequence = parseInt(currentNo) + 1;
    await settings.save();
    res.json({ nextSequence: settings.quotationSequence });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;