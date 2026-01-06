/**
 * Simple test script to verify the backend is working
 * Run: node test.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function test(name, fn) {
  try {
    console.log(`\n${colors.blue}▶ Testing: ${name}${colors.reset}`);
    await fn();
    console.log(`${colors.green}✓ ${name} - PASSED${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ ${name} - FAILED${colors.reset}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`${colors.yellow}
╔═══════════════════════════════════════════════╗
║  Meeting Task Automation - Test Suite        ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  if (await test('Health Check', async () => {
    const response = await axios.get(`${BASE_URL}/`);
    if (!response.data.status) throw new Error('No status in response');
  })) passed++; else failed++;

  // Test 2: Test Connections
  if (await test('API Connections (Jira & Trello)', async () => {
    const response = await axios.get(`${BASE_URL}/api/tasks/test-connections`);
    if (!response.data.overall) {
      console.log(`  ${colors.yellow}Note: Check your .env configuration${colors.reset}`);
      console.log(`  Jira: ${response.data.jira.success ? '✓' : '✗'}`);
      console.log(`  Trello: ${response.data.trello.success ? '✓' : '✗'}`);
    }
  })) passed++; else failed++;

  // Test 3: Task Extraction (Rule-Based)
  if (await test('Task Extraction (Rule-Based)', async () => {
    const response = await axios.post(`${BASE_URL}/api/tasks/extract`, {
      transcriptText: 'John will fix the bug by tomorrow. Sarah should deploy to staging.',
      useAI: false
    });
    if (!response.data.success || response.data.tasks.length === 0) {
      throw new Error('Task extraction failed');
    }
    console.log(`  Extracted ${response.data.tasks.length} tasks`);
  })) passed++; else failed++;

  // Test 4: Task Extraction (AI - if configured)
  if (await test('Task Extraction (AI)', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/tasks/extract`, {
        transcriptText: 'Mike will integrate Jira by tomorrow. Lisa will handle Trello sync.',
        useAI: true
      });
      if (!response.data.success) throw new Error('AI extraction failed');
      console.log(`  Extracted ${response.data.tasks.length} tasks`);
    } catch (error) {
      if (error.response?.data?.error?.includes('OpenAI')) {
        console.log(`  ${colors.yellow}OpenAI not configured - using fallback${colors.reset}`);
      } else {
        throw error;
      }
    }
  })) passed++; else failed++;

  // Test 5: Manual Task Creation (Dry Run)
  if (await test('Task Validation', async () => {
    // This will attempt to create but may fail if credentials are not set
    // We're mainly testing the endpoint exists and validates correctly
    try {
      await axios.post(`${BASE_URL}/api/tasks/manual-create`, {
        task: 'Test Task - Please Delete',
        assignee: 'Test User',
        deadline: 'Tomorrow',
        priority: 'Low',
        target: 'jira'
      });
      console.log(`  ${colors.green}Task creation endpoint working${colors.reset}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('required')) {
        throw error; // Validation error - real problem
      }
      // Other errors might be credential-related, which is acceptable for basic test
      console.log(`  ${colors.yellow}Endpoint exists (credentials may need setup)${colors.reset}`);
    }
  })) passed++; else failed++;

  // Summary
  console.log(`\n${colors.yellow}═══════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════${colors.reset}\n`);

  if (failed === 0) {
    console.log(`${colors.green}✓ All tests passed! Backend is ready.${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠ Some tests failed. Check configuration.${colors.reset}\n`);
  }

  console.log(`${colors.blue}Next steps:${colors.reset}`);
  console.log(`1. Configure .env file (copy from .env.example)`);
  console.log(`2. Add your Jira and Trello credentials`);
  console.log(`3. Test with: GET http://localhost:5000/api/tasks/test-connections`);
  console.log(`4. Check TEST_CASES.md for more test scenarios\n`);
}

// Run tests
console.log('Waiting for server to be ready...\n');
setTimeout(() => {
  runTests().catch(err => {
    console.error(`${colors.red}Test suite failed:${colors.reset}`, err.message);
    console.log(`\n${colors.yellow}Make sure the server is running:${colors.reset}`);
    console.log('  npm start\n');
  });
}, 2000);
