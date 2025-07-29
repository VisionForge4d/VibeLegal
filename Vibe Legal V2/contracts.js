const express = require('express');
const path = require('path');
const ContractAssembler = require('../services/assemble');
const LLMAdapter = require('../services/llm');
const PDFRenderer = require('../services/renderPDF');
const DOCXRenderer = require('../services/renderDOCX');

const router = express.Router();

// New contract generation endpoint
router.post('/generate', async (req, res) => {
  try {
    const { 
      jurisdiction, 
      contractType, 
      userInputs, 
      requirements = '',
      enablePolish = true 
    } = req.body;
    
    const format = req.query.format || 'json';
    
    if (!jurisdiction || !contractType || !userInputs) {
      return res.status(400).json({ 
        error: 'jurisdiction, contractType, and userInputs are required' 
      });
    }

    // Validate format
    if (!['json', 'pdf', 'docx'].includes(format)) {
      return res.status(400).json({ 
        error: 'format must be json, pdf, or docx' 
      });
    }

    // Load jurisdiction data
    const jurisdictionPath = path.join(__dirname, '../../jurisdictions', jurisdiction);
    const assembler = new ContractAssembler(jurisdictionPath);
    
    // Assemble contract
    let contractText = assembler.assembleContract(contractType, userInputs);
    
    // Auto-attach Exhibit A if needed
    if (assembler.shouldAttachExhibitA(userInputs)) {
      const exhibitA = assembler.getExhibitA();
      if (exhibitA) {
        contractText += '\n\n---\n\n' + exhibitA;
      }
    }
    
    // Polish with LLM if enabled
    if (enablePolish) {
      const llm = new LLMAdapter();
      contractText = await llm.polish(contractText, requirements);
    }

    // Return based on format
    switch (format) {
      case 'json':
        res.json({
          contract: contractText,
          contractType,
          jurisdiction,
          format: 'markdown'
        });
        break;
        
      case 'pdf':
        const pdfRenderer = new PDFRenderer();
        const pdfBuffer = await pdfRenderer.renderToPDF(contractText);
        await pdfRenderer.close();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${contractType}_${jurisdiction}.pdf"`);
        res.send(pdfBuffer);
        break;
        
      case 'docx':
        const docxRenderer = new DOCXRenderer();
        const docxBuffer = await docxRenderer.renderToDOCX(contractText);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${contractType}_${jurisdiction}.docx"`);
        res.send(docxBuffer);
        break;
    }

  } catch (error) {
    console.error('Contract generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate contract' 
    });
  }
});

module.exports = router;

