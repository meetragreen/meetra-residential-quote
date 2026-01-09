import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="bg-white p-6 rounded shadow text-center">
        <p className="text-gray-500">No quotations found yet.</p>
        <p className="text-sm mt-2">Click "New Quote" to create one!</p>
      </div>
    </div>
  );
};

export default Dashboard;