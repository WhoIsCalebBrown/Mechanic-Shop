#!/usr/bin/env node

/**
 * Generate TypeScript types from the backend OpenAPI spec
 * This script fetches the OpenAPI spec from the running backend and generates TypeScript types
 */

import { execSync } from 'child_process';
import http from 'http';

const BACKEND_URL = 'http://localhost:5000';
const OPENAPI_URL = `${BACKEND_URL}/swagger/v1/swagger.json`;
const OUTPUT_FILE = 'src/generated/api.ts';

console.log('🔧 Generating TypeScript types from backend API...\n');

// Check if backend is running
function checkBackend() {
  return new Promise((resolve) => {
    console.log('📡 Checking if backend is running...');
    http.get(OPENAPI_URL, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Backend is running!\n');
        resolve(true);
      } else {
        console.log(`❌ Backend returned status ${res.statusCode}\n`);
        resolve(false);
      }
    }).on('error', () => {
      console.log('❌ Backend is not running!\n');
      resolve(false);
    });
  });
}

async function main() {
  // Check if backend is running
  const backendRunning = await checkBackend();
  if (!backendRunning) {
    console.error('⚠️  Backend is not running!');
    console.log('\nPlease start the backend first:');
    console.log('  cd ../MechanicShopAPI && dotnet run\n');
    process.exit(1);
  }

  // Generate types
  console.log('⚙️  Generating TypeScript types...\n');

  try {
    // Use .NET tool instead of NPM package (works with .NET 9.0)
    execSync(`/Users/caleb/.dotnet/tools/nswag openapi2tsclient /input:${OPENAPI_URL} /output:${OUTPUT_FILE} /template:Fetch`, {
      stdio: 'inherit'
    });

    console.log('\n✅ TypeScript types generated successfully!');
    console.log(`📁 Types available at: ${OUTPUT_FILE}\n`);
    console.log('💡 Tip: Import generated types in your code:');
    console.log('   import { Customer, CustomersClient } from \'./generated/api\';');
  } catch (error) {
    console.error('\n❌ Failed to generate types!');
    console.error(error.message);
    process.exit(1);
  }
}

main();
