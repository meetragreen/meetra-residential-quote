const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
  // --- NEW FIELDS ---
  quotationSequence: { type: Number, default: 1 },
  hasTemplate: { type: Boolean, default: false },
  pdfFile: { type: Buffer }, // <--- STORES THE PDF FILE DATA DIRECTLY

  // --- EXISTING DATA ---
  companyName: { type: String, default: 'Meetra Green Energy' },
  // ... (Keep all your existing fields below exactly as they were) ...
  address: { type: String, default: '907, Raiya Raj Complex, Oppo. Navrang Bungalow Dobariya Wadi, Jetpur-360370' },
  contact: {
    phone: { type: String, default: '+91 7359227562' },
    email: { type: String, default: 'meetragreen@gmail.com' },
    ownerName: { type: String, default: 'Mr. Meet Hirpara' }
  },
  bankDetails: {
    bankName: { type: String, default: 'Bank of Baroda' },
    accountNumber: { type: String, default: '80400200003267' },
    ifscCode: { type: String, default: 'BARBOVJJETP' },
    branchName: { type: String, default: 'Stand Chowk, Jetpur Navagadh' }
  },
  technicalSpecs: {
    structureDetails: { type: String, default: 'Hot Dip Galvanized Pipe, Withstand up to 150 kmph Wind Speed' },
    cableMake: { type: String, default: 'POLYCAB' },
    distributionBoxMake: { type: String, default: 'HAVELLS' },
    defaultPanelWarranty: { type: Number, default: 30 },
    defaultInverterWarranty: { type: Number, default: 10 }
  },
  termsAndConditions: {
    type: [String],
    default: [
      "PGVCL અથવા અન્ય કોઈ DISCOM દ્વારા મીટર ચાર્જ સંબંધિત જે પણ સૂચના મળશે, તેનું પાલન ગ્રાહકે કરવું ફરજિયાત રહેટો.",
      "DISCOM દ્વારા જે લોડ વધારો, MCB અથવા ELCB ની માંગણી કરવામાં આવરો, તેનો ખર્ચ ગ્રાહકે જાતે જ કરાવવાનો રહેશે.",
      "ઉપટ દર્શાવેલ ક્વોટેશન BILL OF MATERIAL મુજબ દર્શાવવામાં આવેલી વોટની પેનલના આધારે ગણવામાં આવ્યું છે.",
      "આ ક્વોટેશન 9 દિવસ સુધી માન્ય ગણારો.",
      "પ્રોજેક્ટ પૂર્ણ થયા બાદ સબસિડી સીધી જ ગ્રાહકના બેંક ખાતામાં જમા કરવામાં આવટો.",
      "સરકાર તરફથી સબસિડી વિતરણમાં થનારા કોઈપણ વિલંબ માટે કંપની જવાબદાર નહી હોય.",
      "પ્રોજેક્ટ પૂર્ણ થયા પછી કોઈ પણ પ્રકાટનો ફેટફાટ કરવામાં આવશે તો તેનો ખર્ચ ગ્રાહકને અલગથી ચૂકવવો રહેટો.",
      "STRUCTURE ની ડિઝાઇન કંપનીના એન્જિનિયરે ગ્રાહક સાથે કન્ફર્મ કર્યા મુજબ છે.",
      "ત્યારબાદ કરવામાં આવતા કોઈપણ ફેટફાટ માટે ગ્રાહક જ જવાબદાટ ટહેટો.",
      "સિસ્ટમની પૂર્ણ ટકમ ચૂકવ્યા બાદ મીટર ફાઈલ DISCOM માં જમા કરવામાં આવટો."
    ]
  },
  paymentTerms: {
    advance: { type: Number, default: 10 }, 
    materialDelivery: { type: Number, default: 50 },
    installation: { type: Number, default: 35 },
    commissioning: { type: Number, default: 5 }
  }
});

module.exports = mongoose.model('CompanySettings', companySettingsSchema);