// 1. IMPORTS
import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Upload, FileText, Download, Calculator, Zap, CheckCircle } from 'lucide-react';
import axios from 'axios';

const FillQuote = () => {
  const [templateFile, setTemplateFile] = useState(null);
  const [hasSavedTemplate, setHasSavedTemplate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- HELPER 1: GET TODAY'S DATE (DD-MM-YYYY) ---
  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // --- HELPER 2: FORMAT CURRENCY (50000 -> 50,000) ---
  const formatCurrency = (amount) => {
    if (!amount) return "0";
    const num = parseFloat(amount);
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // --- HELPER 3: CAPITALIZE NAME (rajnikant -> Rajnikant) ---
  const toTitleCase = (str) => {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // --- FORM DATA STATE ---
  const [formData, setFormData] = useState({
    quotationSeq: '',
    date: getTodayDate(), 
    customerName: '',
    capacityKW: '',
    location: '',
    
    // Tech Specs
    panelWattage: '550',
    panelMake: 'Adani',
    panelSeries: 'Topcon',
    panelQty: '',
    inverterCapacity: '',
    inverterMake: 'UTL',
    
    rafterSize: '80x40',
    purlinSize: '40x40',
    structureBrand: 'Hindustar',
    structureQty: '150 Kg',
    laType: 'Conventional',

    // Commercials
    systemRate: '',
    structureTotalCost: '',
    discount: '0',
    inverterWarranty: '10',
  });

  // --- ON LOAD ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('https://meetra-residential-quote.onrender.com/api/settings');
        setFormData(prev => ({ ...prev, quotationSeq: res.data.quotationSequence }));
        setHasSavedTemplate(res.data.hasTemplate);
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  // --- UPLOAD TEMPLATE ---
  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTemplateFile(file);
      const data = new FormData();
      data.append('file', file);
      
      try {
        setIsUploading(true);
        await axios.post('https://meetra-residential-quote.onrender.com/api/settings/upload-template', data);
        setHasSavedTemplate(true);
        alert("Template Saved to Server!");
      } catch (err) {
        alert("Failed to save template.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FORMAT QUOTATION NUMBER ---
  const getFormattedQuoteNo = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const seq = formData.quotationSeq || '1';
    const paddedSeq = seq.toString().padStart(3, '0');
    return `MGE-R-${year}${paddedSeq}`;
  };

  // --- MATH ENGINE ---
  const calculateMath = () => {
    const kw = parseFloat(formData.capacityKW) || 0;
    const baseRate = parseFloat(formData.systemRate) || 0;
    const structCost = parseFloat(formData.structureTotalCost) || 0;
    const disc = parseFloat(formData.discount) || 0;

    const baseSystemCost = kw * baseRate;
    const gstAmount = baseSystemCost * 0.089;
    const totalSystemCost = (baseSystemCost + gstAmount).toFixed(0);

    const netSolarCost = (parseFloat(totalSystemCost) + structCost).toFixed(0);

    let subsidy = 0;
    if (kw <= 1) subsidy = 30000;
    else if (kw <= 2) subsidy = 60000;
    else subsidy = 78000;

    const payableAmount = (parseFloat(netSolarCost) - disc).toFixed(0);
    const afterSubsidy = (parseFloat(payableAmount) - subsidy).toFixed(0);

    return {
      baseSystemCost: baseSystemCost.toFixed(0),
      gstAmount: gstAmount.toFixed(0),
      field18: totalSystemCost,
      field20: netSolarCost,
      field21: netSolarCost,
      field23: payableAmount,
      field24: subsidy.toString(),
      field25: afterSubsidy,
      field26: subsidy.toString()
    };
  };

  // --- 3. PDF GENERATION ---
  const generatePDF = async () => {
    try {
      let pdfBytes;
      if (templateFile) {
        pdfBytes = await templateFile.arrayBuffer();
      } else if (hasSavedTemplate) {
        
        // --- THIS IS THE FIX ---
        // We now call the new route we just created in index.js
        const res = await fetch('https://meetra-residential-quote.onrender.com/api/download-template');
        
        if (!res.ok) throw new Error("Template not found on server");
        pdfBytes = await res.arrayBuffer();
        
      } else {
        alert("⚠️ No template found! Please upload 'Proposal (2).pdf' once.");
        return;
      }

      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDoc.registerFontkit(fontkit);
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const pages = pdfDoc.getPages();
      const currentMath = calculateMath();
      const finalQuoteNo = getFormattedQuoteNo();
      const formattedName = toTitleCase(formData.customerName); // Capitalize Name

      const draw = (pageIdx, text, x, y, size=10, isBold=false, color=rgb(0,0,0)) => {
        if (!pages[pageIdx]) return;
        pages[pageIdx].drawText(String(text || ''), { x, y, size, font: isBold ? fontBold : font, color });
      };

      // --- PAGE 2 ---
      const p2 = 1;
      draw(p2, finalQuoteNo, 252, 653, 10, true);
      draw(p2, formData.date, 252, 599); 
      draw(p2, formattedName, 252, 503, 12, true);
      draw(p2, `${formData.capacityKW} kW`, 252, 455, 12, true);
      draw(p2, formData.location, 252, 413);

      // CENTERED NAME (GREEN)
      const submittedSize = 12;
      const textWidth = fontBold.widthOfTextAtSize(formattedName, submittedSize);
      const pageWidth = pages[p2].getWidth();
      const centerX = (pageWidth - textWidth) / 2;
      draw(p2, formattedName, centerX, 174, submittedSize, true, rgb(0, 0.5, 0));

      // --- PAGE 5 ---
      const p5 = 4;
      draw(p5, formData.panelSeries, 119, 643);
      draw(p5, formData.panelWattage, 290, 658);
      draw(p5, formData.panelMake, 395, 652);
      draw(p5, formData.panelQty, 537, 652);
      draw(p5, `${formData.inverterCapacity} `, 192, 619);
      draw(p5, formData.inverterMake, 397, 613);
      draw(p5, formData.rafterSize, 161, 424);
      draw(p5, formData.rafterSize, 265, 424);
      draw(p5, formData.purlinSize, 161, 405);
      draw(p5, formData.structureBrand, 396, 436);
      draw(p5, formData.structureQty, 535, 436);

      // --- PAGE 6 ---
      const p6 = 5;
      draw(p6, formData.laType, 150, 450);

      // --- PAGE 7 ---
      const p7 = 6;
      draw(p7, formattedName, 40, 723, 11, true);
      draw(p7, finalQuoteNo, 341, 723, 10);
      draw(p7, formData.date, 506, 722, 10);

      draw(p7, formData.capacityKW, 279, 603);  
      draw(p7, formatCurrency(formData.systemRate), 382, 603); 
      draw(p7, formatCurrency(currentMath.field18), 476, 614, 11, true); 

      draw(p7, formData.capacityKW, 279, 567);
      draw(p7, formatCurrency(formData.structureTotalCost), 476, 567); 

      // Table A
      draw(p7, formatCurrency(currentMath.field20), 476, 486, 12, true, rgb(1, 1, 1) );
      
      // Table B
      draw(p7, formData.capacityKW, 280, 382);
      
      // FIX: Used field21 (Total) instead of field26 (Subsidy)
      draw(p7, formatCurrency(currentMath.field26), 476, 382); 
      
      // Subsidy Refundable
      draw(p7, formatCurrency(currentMath.field26), 476, 343,12, true, rgb(1, 1, 1));          

      draw(p7, formatCurrency(currentMath.field20), 476, 291);
      draw(p7, formatCurrency(formData.discount), 476, 266);      
      draw(p7, formatCurrency(currentMath.field23), 476, 239, 12, true, rgb(0,0.5,0));
      draw(p7, formatCurrency(currentMath.field24), 476, 214);          
      draw(p7, formatCurrency(currentMath.field25), 476, 184, 12, true, rgb(0,0.5,0));

      // --- PAGE 8 ---
      const p8 = 7;
      draw(p8, formData.inverterWarranty, 52, 553, 10, true);

      // SAVE
      const savedBytes = await pdfDoc.save();
      const blob = new Blob([savedBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Quote_${finalQuoteNo}.pdf`;
      link.click();

      // UPDATE SEQUENCE ON SERVER
      await axios.put('https://meetra-residential-quote.onrender.com/api/settings/update-sequence', { 
        currentNo: formData.quotationSeq 
      });
      const res = await axios.get('https://meetra-residential-quote.onrender.com/api/settings');
      setFormData(prev => ({ ...prev, quotationSeq: res.data.quotationSequence }));

    } catch (err) {
      console.error(err);
      alert("Error generating PDF. Please upload the template file again.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* HEADER */}
        <div className="bg-green-700 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold flex items-center gap-3">
              <Zap className="fill-yellow-400 text-yellow-400" /> Meetra Smart Quote
            </h2>
            <p className="opacity-90 mt-1">
              Current Quote No: <span className="font-bold text-yellow-300">{getFormattedQuoteNo()}</span>
            </p>
          </div>
          <label className={`px-6 py-3 rounded-xl font-bold cursor-pointer transition shadow-lg flex items-center gap-2 ${hasSavedTemplate ? 'bg-blue-100 text-blue-800' : 'bg-white text-green-800'}`}>
            {isUploading ? "Uploading..." : hasSavedTemplate ? <CheckCircle size={20} className="text-green-600"/> : <Upload size={20} />}
            {hasSavedTemplate ? "Template Saved" : "Upload Template Once"}
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {/* FORM GRID */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* BASICS */}
          <div className="space-y-5 bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-700 text-lg border-b pb-2 flex items-center gap-2"><FileText size={18}/> Project Basics</h3>
            <div className="space-y-3">
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Seq No</label>
                 <input name="quotationSeq" type="number" value={formData.quotationSeq} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 ring-green-500 font-bold" />
              </div>
              <input name="customerName" onChange={handleChange} className="w-full border p-2 rounded" placeholder="Customer Name" />
              <div className="grid grid-cols-2 gap-3">
                <input name="capacityKW" type="number" onChange={handleChange} className="w-full border p-2 rounded font-bold text-green-700" placeholder="Capacity (kW)" />
                <input name="location" onChange={handleChange} className="w-full border p-2 rounded" placeholder="Location" />
              </div>
            </div>
          </div>

          {/* TECH SPECS */}
          <div className="space-y-5 bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-700 text-lg border-b pb-2 flex items-center gap-2"><Zap size={18}/> Technical Specs</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                 <input name="panelMake" defaultValue="Adani" onChange={handleChange} className="border p-2 rounded" placeholder="Panel Make" />
                 <input name="panelQty" onChange={handleChange} className="border p-2 rounded" placeholder="Panel Qty" />
                 <select name="panelSeries" value={formData.panelSeries} onChange={handleChange} className="border p-2 rounded bg-white">
                   <option value="Bi-facial">Bi-facial</option>
                   <option value="Topcon">Topcon</option>
                   <option value="HJT">HJT</option>
                 </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <input name="inverterMake" defaultValue="UTL" onChange={handleChange} className="border p-2 rounded" placeholder="Inv Make" />
                 <input name="inverterCapacity" onChange={handleChange} className="border p-2 rounded" placeholder="Inv kw" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <input name="structureBrand" defaultValue="Hindustar" onChange={handleChange} className="border p-2 rounded" placeholder="Struct. Brand" />
                 <input name="structureQty" defaultValue="150 Kg" onChange={handleChange} className="border p-2 rounded" placeholder="Struct. Qty" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <input name="purlinSize" defaultValue="40x40" onChange={handleChange} className="border p-2 rounded" placeholder="Purlin" />
                 <input name="rafterSize" defaultValue="80x40" onChange={handleChange} className="border p-2 rounded" placeholder="Rafter/Lag" />
              </div>
            </div>
          </div>

          {/* PRICING */}
          <div className="space-y-5 bg-green-50 p-5 rounded-xl border border-green-200 shadow-inner">
             <h3 className="font-bold text-green-800 text-lg border-b border-green-200 pb-2 flex items-center gap-2"><Calculator size={18}/> Pricing</h3>
             
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Base Rate (Before GST)</label>
               <input name="systemRate" type="number" onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g. 30000" />
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Structure Cost (No GST added)</label>
               <input name="structureTotalCost" type="number" onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g. 25000" />
             </div>
             <input name="discount" type="number" defaultValue="0" onChange={handleChange} className="w-full border p-2 rounded" placeholder="Discount" />
             
             <div className="bg-white p-4 rounded-lg border border-green-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Base System Cost:</span> <span>₹ {formatCurrency(calculateMath().baseSystemCost)}</span></div>
                <div className="flex justify-between text-gray-600 border-b pb-1"><span>+ GST (8.9%):</span> <span>₹ {formatCurrency(calculateMath().gstAmount)}</span></div>
                <div className="flex justify-between font-bold text-green-800 pt-1"><span>System Total:</span> <span>₹ {formatCurrency(calculateMath().field18)}</span></div>
                
                <div className="border-t border-green-200 pt-2 mt-2">
                   <div className="flex justify-between font-bold text-lg text-green-900"><span>Payable:</span> <span>₹ {formatCurrency(calculateMath().field23)}</span></div>
                   <div className="flex justify-between text-xs text-green-600"><span>Effective (After Subsidy):</span> <span>₹ {formatCurrency(calculateMath().field25)}</span></div>
                </div>
             </div>

             <button onClick={generatePDF} className="w-full bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 hover:bg-green-800 transition">
                <Download size={20} /> Download Final PDF
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FillQuote;