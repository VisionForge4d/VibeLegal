import React, { useState } from 'react';
import { contractAPI } from '../lib/api';

function ContractGenerator() {
  const [formData, setFormData] = useState({
    jurisdiction: 'us_ca',
    contractType: 'employment_agreement',
    clientName: '',
    employeeName: '',
    requirements: '',
    enablePolish: true
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const userInputs = {
        client_name: formData.clientName,
        employee_name: formData.employeeName,
        employer_name: formData.clientName,
        other_party_name: formData.employeeName,
        requirements: formData.requirements
      };

      const response = await contractAPI.generate({
        jurisdiction: formData.jurisdiction,
        contractType: formData.contractType,
        userInputs,
        requirements: formData.requirements,
        enablePolish: formData.enablePolish
      });

      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate contract');
    } finally {
      setLoading(false);
    }
  };

  const downloadContract = async (format) => {
    try {
      const userInputs = {
        client_name: formData.clientName,
        employee_name: formData.employeeName,
        employer_name: formData.clientName,
        other_party_name: formData.employeeName,
        requirements: formData.requirements
      };

      const response = await contractAPI.generate({
        jurisdiction: formData.jurisdiction,
        contractType: formData.contractType,
        userInputs,
        requirements: formData.requirements,
        enablePolish: formData.enablePolish
      }, format);

      // Create download link
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.contractType}_${formData.jurisdiction}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(`Failed to download ${format.toUpperCase()}: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Generate Contract</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Jurisdiction
                </label>
                <select
                  name="jurisdiction"
                  value={formData.jurisdiction}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="us_ca">California</option>
                  <option value="us_tx">Texas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contract Type
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="employment_agreement">Employment Agreement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client/Employer Name
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employee Name
                </label>
                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Specify any additional requirements or clauses..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="enablePolish"
                  checked={formData.enablePolish}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Enable AI Polish (requires LLM provider)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Contract'}
              </button>
            </form>
          </div>

          {/* Result */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Result</h3>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadContract('pdf')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => downloadContract('docx')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Download DOCX
                  </button>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {result.contract}
                  </pre>
                </div>
              </div>
            )}

            {!result && !error && (
              <p className="text-gray-500 text-center py-8">
                Generate a contract to see the result here
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractGenerator;

