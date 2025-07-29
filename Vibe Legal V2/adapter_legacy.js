const express = require('express');
const axios = require('axios');

const router = express.Router();

// Legacy adapter endpoint
router.post('/generate-contract', async (req, res) => {
  try {
    const { contractType, requirements, clientName, otherPartyName, jurisdiction } = req.body;
    
    if (!contractType || !requirements || !clientName || !otherPartyName || !jurisdiction) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Map legacy jurisdiction format to new format
    const jurisdictionMap = {
      'California': 'us_ca',
      'Texas': 'us_tx'
    };
    
    const mappedJurisdiction = jurisdictionMap[jurisdiction] || jurisdiction.toLowerCase().replace(' ', '_');
    
    // Map legacy contract type to new format
    const contractTypeMap = {
      'Employment Agreement': 'employment_agreement'
    };
    
    const mappedContractType = contractTypeMap[contractType] || contractType.toLowerCase().replace(' ', '_');
    
    // Create user inputs from legacy format
    const userInputs = {
      client_name: clientName,
      other_party_name: otherPartyName,
      employee_name: otherPartyName,
      employer_name: clientName,
      requirements: requirements
    };

    // Call new API
    const newApiUrl = `${req.protocol}://${req.get('host')}/api/contracts/generate?format=json`;
    
    const response = await axios.post(newApiUrl, {
      jurisdiction: mappedJurisdiction,
      contractType: mappedContractType,
      userInputs: userInputs,
      requirements: requirements,
      enablePolish: true
    }, {
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json'
      }
    });

    // Return in legacy format
    res.json({
      contract: response.data.contract,
      contractType,
      clientName,
      otherPartyName,
      jurisdiction
    });

  } catch (error) {
    console.error('Legacy adapter error:', error);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to generate contract' });
    }
  }
});

module.exports = router;

