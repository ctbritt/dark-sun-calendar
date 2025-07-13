#!/usr/bin/env node

/**
 * Test script to simulate the GitHub Actions workflow locally
 * This helps debug issues before creating a release
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Testing GitHub Actions workflow locally...\n');

// Configuration
const moduleJsonPath = path.join(__dirname, '..', 'module.json');
const testVersion = '2.1.0';
const repository = 'ctbritt/dark-sun-calendar';

// URLs for testing
const projectUrl = `https://github.com/${repository}`;
const releaseTag = 'v2.1.0';
const releaseManifestUrl = `https://github.com/${repository}/releases/download/${releaseTag}/module.json`;
const releaseModuleUrl = `https://github.com/${repository}/releases/download/${releaseTag}/module.zip`;

console.log('📋 Test Configuration:');
console.log(`  Version: ${testVersion}`);
console.log(`  Tag: ${releaseTag}`);
console.log(`  Project URL: ${projectUrl}`);
console.log(`  Manifest URL: ${releaseManifestUrl}`);
console.log(`  Download URL: ${releaseModuleUrl}\n`);

// Step 1: Check if module.json exists and has tokens
console.log('1️⃣ Checking module.json...');
if (!fs.existsSync(moduleJsonPath)) {
    console.error('❌ module.json not found!');
    process.exit(1);
}

let moduleJson = fs.readFileSync(moduleJsonPath, 'utf8');
console.log('✅ module.json found');

// Check for tokens
const hasTokens = moduleJson.includes('${{ env.VERSION }}') && 
                  moduleJson.includes('${{ env.URL }}') && 
                  moduleJson.includes('${{ env.MANIFEST }}') && 
                  moduleJson.includes('${{ env.DOWNLOAD }}');

if (hasTokens) {
    console.log('✅ module.json contains required tokens');
} else {
    console.error('❌ module.json missing required tokens!');
    console.log('Expected tokens: ${{ env.VERSION }}, ${{ env.URL }}, ${{ env.MANIFEST }}, ${{ env.DOWNLOAD }}');
    process.exit(1);
}

// Step 2: Simulate token replacement
console.log('\n2️⃣ Simulating token replacement...');
const updatedModuleJson = moduleJson
    .replace(/\${{ env\.VERSION }}/g, testVersion)
    .replace(/\${{ env\.URL }}/g, projectUrl)
    .replace(/\${{ env\.MANIFEST }}/g, releaseManifestUrl)
    .replace(/\${{ env\.DOWNLOAD }}/g, releaseModuleUrl);

console.log('✅ Token replacement completed');

// Step 3: Validate JSON
console.log('\n3️⃣ Validating JSON...');
try {
    JSON.parse(updatedModuleJson);
    console.log('✅ JSON is valid');
} catch (error) {
    console.error('❌ Invalid JSON after token replacement:', error.message);
    process.exit(1);
}

// Step 4: Check required files for zip
console.log('\n4️⃣ Checking files for zip creation...');
const requiredFiles = [
    'module.json',
    'README.md',
    'historical_events.json',
    'LICENSE',
    'macro-example.js',
    'templates/',
    'calendar/',
    'scripts/',
    'styles/',
    'lang/'
];

const missingFiles = [];
for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
    }
}

if (missingFiles.length > 0) {
    console.error('❌ Missing files for zip:', missingFiles.join(', '));
    process.exit(1);
} else {
    console.log('✅ All required files exist');
}

// Step 5: Test zip creation
console.log('\n5️⃣ Testing zip creation...');
try {
    // Create a temporary module.json with replaced tokens
    const tempModuleJsonPath = path.join(__dirname, '..', 'module.json.temp');
    fs.writeFileSync(tempModuleJsonPath, updatedModuleJson);
    
    // Create zip
    const zipCommand = `cd "${path.join(__dirname, '..')}" && zip -r module.zip module.json.temp README.md historical_events.json LICENSE macro-example.js templates/ calendar/ scripts/ styles/ lang/`;
    execSync(zipCommand, { stdio: 'pipe' });
    
    // Check if zip was created
    const zipPath = path.join(__dirname, '..', 'module.zip');
    if (fs.existsSync(zipPath)) {
        const stats = fs.statSync(zipPath);
        console.log(`✅ module.zip created (${(stats.size / 1024).toFixed(1)} KB)`);
        
        // Clean up
        fs.unlinkSync(tempModuleJsonPath);
        fs.unlinkSync(zipPath);
    } else {
        console.error('❌ module.zip was not created');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error creating zip:', error.message);
    process.exit(1);
}

console.log('\n🎉 All tests passed! Your workflow should work correctly.');
console.log('\n📝 Next steps:');
console.log('1. Commit and push your changes');
console.log('2. Create a new release on GitHub with a tag (e.g., v2.1.0)');
console.log('3. Check the Actions tab to see the workflow run');
console.log('4. The release should have module.json and module.zip attached'); 