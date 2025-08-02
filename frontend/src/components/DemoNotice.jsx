// sr./DemoNotice.jsx

import React from 'react';

function DemoNotice() {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 text-sm flex justify-between items-center shadow-md">
      <span>
        ⚠️ <strong>Development Mode:</strong> This site is running in a local environment. Content may be incomplete or for testing only.
      </span>
      <span className="italic text-gray-600 ml-4">Not visible in production.</span>
    </div>
  );
}

export default DemoNotice;
