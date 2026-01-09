import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import FillQuote from './pages/FillQuote';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        {/* Navigation Bar */}
        <nav className="bg-green-700 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Zap className="text-yellow-400 fill-yellow-400"/> Meetra Green Energy
            </h1>
            <Link to="/" className="font-bold hover:text-green-200 bg-green-800 px-4 py-2 rounded-lg transition">
              New Quote
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto p-6">
          <Routes>
            {/* Make FillQuote the ONLY page */}
            <Route path="/" element={<FillQuote />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;