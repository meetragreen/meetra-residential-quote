const express = require('express');
// --- MAGIC FIX FOR DNS ERROR ---
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Node.js to use Google DNS
// -------------------------------

const fs = require('fs-extra');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// --- 1. SETUP UPLOADS FOLDER ---
const uploadDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) { 
        cb(null, 'template.pdf'); 
    }
});
const upload = multer({ storage: storage });

// --- 2. DATABASE (Using your original SRV string) ---
const MONGO_URI = 'mongodb+srv://meetragreen:meetra123@cluster0.ray2juw.mongodb.net/meetraDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.log("❌ MongoDB Error:", err);
        console.log("👉 Tip: If this fails, try connecting to a mobile hotspot instead of WiFi.");
    });

const QuotationSchema = new mongoose.Schema({ seq: { type: Number, default: 0 } });
const Counter = mongoose.model('Counter', QuotationSchema);

// --- 3. ROUTES ---

// A. CHECK SETTINGS
app.get('/api/settings', async (req, res) => {
    try {
        const filePath = path.join(uploadDir, 'template.pdf');
        const hasTemplate = await fs.pathExists(filePath);
        
        let counter = await Counter.findOne();
        if (!counter) { counter = new Counter({ seq: 0 }); await counter.save(); }
        
        res.json({ 
            quotationSequence: counter.seq + 1, 
            hasTemplate: hasTemplate 
        });
    } catch (err) {
        console.error("❌ Settings Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// B. UPLOAD TEMPLATE
app.post('/api/settings/upload-template', upload.single('file'), (req, res) => {
    if (req.file) {
        console.log("✅ Template Uploaded");
        res.json({ message: "Success" });
    } else {
        res.status(400).json({ message: "Fail" });
    }
});

// C. DOWNLOAD TEMPLATE
app.get('/api/download-template', (req, res) => {
    const filePath = path.join(uploadDir, 'template.pdf');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Template not found on server');
    }
});

// D. UPDATE SEQUENCE
app.put('/api/settings/update-sequence', async (req, res) => {
    try {
        const { currentNo } = req.body;
        if (currentNo) {
            await Counter.updateOne({}, { seq: parseInt(currentNo) });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).send("Error updating sequence");
    }
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));