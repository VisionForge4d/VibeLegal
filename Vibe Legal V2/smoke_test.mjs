#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import axios from 'axios';

class SmokeTest {
  constructor(jurisdiction, baseUrl = 'http://localhost:5000') {
    this.jurisdiction = jurisdiction;
    this.baseUrl = baseUrl;
    this.token = null;
  }

  async run() {
    console.log(`Running smoke tests for ${this.jurisdiction}`);
    
    try {
      await this.testHealth();
      await this.testAuth();
      await this.testContractGeneration();
      await this.testComplianceRules();
      
      console.log('\n✅ All smoke tests passed!');
      return true;
    } catch (error) {
      console.error('\n❌ Smoke test failed:', error.message);
      return false;
    }
  }

  async testHealth() {
    console.log('Testing health endpoint...');
    const response = await axios.get(`${this.baseUrl}/api/health`);
    
    if (response.status !== 200) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    console.log('✓ Health endpoint OK');
  }

  async testAuth() {
    console.log('Testing authentication...');
    
    // Register test user
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const registerResponse = await axios.post(`${this.baseUrl}/api/register`, {
      email: testEmail,
      password: testPassword
    });
    
    if (registerResponse.status !== 201) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    this.token = registerResponse.data.token;
    console.log('✓ User registration OK');
    
    // Test login
    const loginResponse = await axios.post(`${this.baseUrl}/api/login`, {
      email: testEmail,
      password: testPassword
    });
    
    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    console.log('✓ User login OK');
  }

  async testContractGeneration() {
    console.log('Testing contract generation...');
    
    const testData = {
      jurisdiction: this.jurisdiction,
      contractType: 'employment_agreement',
      userInputs: {
        client_name: 'Test Company Inc.',
        employee_name: 'John Doe',
        employer_name: 'Test Company Inc.',
        other_party_name: 'John Doe',
        requirements: 'Standard employment terms'
      },
      requirements: 'Standard employment terms',
      enablePolish: false
    };

    // Test JSON generation
    const jsonResponse = await axios.post(
      `${this.baseUrl}/api/contracts/generate?format=json`,
      testData,
      {
        headers: { Authorization: `Bearer ${this.token}` }
      }
    );
    
    if (jsonResponse.status !== 200 || !jsonResponse.data.contract) {
      throw new Error('JSON contract generation failed');
    }
    
    console.log('✓ JSON contract generation OK');

    // Test PDF generation
    const pdfResponse = await axios.post(
      `${this.baseUrl}/api/contracts/generate?format=pdf`,
      testData,
      {
        headers: { Authorization: `Bearer ${this.token}` },
        responseType: 'arraybuffer'
      }
    );
    
    if (pdfResponse.status !== 200 || pdfResponse.data.byteLength === 0) {
      throw new Error('PDF contract generation failed');
    }
    
    console.log('✓ PDF contract generation OK');

    // Test DOCX generation
    const docxResponse = await axios.post(
      `${this.baseUrl}/api/contracts/generate?format=docx`,
      testData,
      {
        headers: { Authorization: `Bearer ${this.token}` },
        responseType: 'arraybuffer'
      }
    );
    
    if (docxResponse.status !== 200 || docxResponse.data.byteLength === 0) {
      throw new Error('DOCX contract generation failed');
    }
    
    console.log('✓ DOCX contract generation OK');

    // Test legacy adapter
    const legacyResponse = await axios.post(
      `${this.baseUrl}/api/generate-contract`,
      {
        contractType: 'Employment Agreement',
        requirements: 'Standard employment terms',
        clientName: 'Test Company Inc.',
        otherPartyName: 'John Doe',
        jurisdiction: this.jurisdiction === 'us_ca' ? 'California' : 'Texas'
      },
      {
        headers: { Authorization: `Bearer ${this.token}` }
      }
    );
    
    if (legacyResponse.status !== 200 || !legacyResponse.data.contract) {
      throw new Error('Legacy adapter failed');
    }
    
    console.log('✓ Legacy adapter OK');
  }

  async testComplianceRules() {
    console.log('Testing compliance rules...');
    
    if (this.jurisdiction === 'us_ca') {
      await this.testCaliforniaCompliance();
    }
    
    await this.testDisclaimerPlacement();
  }

  async testCaliforniaCompliance() {
    console.log('Testing California compliance...');
    
    // Test non-compete rejection
    try {
      const nonCompeteData = {
        jurisdiction: 'us_ca',
        contractType: 'employment_agreement',
        userInputs: {
          client_name: 'Test Company Inc.',
          employee_name: 'John Doe',
          requirements: 'Include non-compete clause'
        },
        requirements: 'Include non-compete clause',
        enablePolish: false
      };

      const response = await axios.post(
        `${this.baseUrl}/api/contracts/generate?format=json`,
        nonCompeteData,
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );
      
      // Should either reject or not include non-compete language
      const contract = response.data.contract.toLowerCase();
      if (contract.includes('non-compete') || contract.includes('noncompete')) {
        console.log('⚠️  Warning: Non-compete language found in CA contract');
      } else {
        console.log('✓ Non-compete compliance OK');
      }
      
    } catch (error) {
      if (error.response?.status === 500 && error.response?.data?.error?.includes('non-compete')) {
        console.log('✓ Non-compete properly rejected');
      } else {
        throw error;
      }
    }

    // Test Exhibit A attachment
    const ipData = {
      jurisdiction: 'us_ca',
      contractType: 'employment_agreement',
      userInputs: {
        client_name: 'Test Company Inc.',
        employee_name: 'John Doe',
        ip_assignment: true
      },
      enablePolish: false
    };

    const ipResponse = await axios.post(
      `${this.baseUrl}/api/contracts/generate?format=json`,
      ipData,
      {
        headers: { Authorization: `Bearer ${this.token}` }
      }
    );
    
    const contract = ipResponse.data.contract;
    if (contract.includes('2870') || contract.includes('Exhibit A')) {
      console.log('✓ Exhibit A auto-attachment OK');
    } else {
      console.log('⚠️  Warning: Exhibit A not found when IP assignment present');
    }
  }

  async testDisclaimerPlacement() {
    console.log('Testing disclaimer placement...');
    
    const testData = {
      jurisdiction: this.jurisdiction,
      contractType: 'employment_agreement',
      userInputs: {
        client_name: 'Test Company Inc.',
        employee_name: 'John Doe'
      },
      enablePolish: false
    };

    const response = await axios.post(
      `${this.baseUrl}/api/contracts/generate?format=json`,
      testData,
      {
        headers: { Authorization: `Bearer ${this.token}` }
      }
    );
    
    const contract = response.data.contract;
    if (contract.includes('LEGAL DISCLAIMER')) {
      throw new Error('Legal disclaimer found in contract body - should be on cover/UI only');
    }
    
    console.log('✓ Disclaimer placement OK');
  }
}

// CLI usage
const jurisdiction = process.argv[2];
const baseUrl = process.argv[3] || 'http://localhost:5000';

if (!jurisdiction) {
  console.error('Usage: node smoke_test.mjs <jurisdiction> [base_url]');
  console.error('Example: node smoke_test.mjs us_ca http://localhost:5000');
  process.exit(1);
}

const smokeTest = new SmokeTest(jurisdiction, baseUrl);
const success = await smokeTest.run();

process.exit(success ? 0 : 1);

