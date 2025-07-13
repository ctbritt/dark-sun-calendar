#!/usr/bin/env node

/**
 * Script to update module.json with version and URL tokens for development
 * This script replaces the tokens in module.json with actual values for local development
 * 
 * Usage:
 *   node scripts/update-module-version.js [version] [--dev]
 * 
 * Examples:
 *   node scripts/update-module-version.js 2.1.0-dev --dev
 *   node scripts/update-module-version.js 2.1.0
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const version = args[0] || '2.0.0';
const isDev = args.includes('--dev');

// Configuration
const moduleJsonPath = path.join(__dirname, '..', 'module.json');
const repository = 'ctbritt/dark-sun-calendar';

// URLs for development
const projectUrl = `https://github.com/${repository}`;
const manifestUrl = `https://github.com/${repository}/releases/latest/download/module.json`;
const downloadUrl = `https://github.com/${repository}/releases/latest/download/dark-sun-calendar.zip`;

// Read the module.json file
let moduleJson = fs.readFileSync(moduleJsonPath, 'utf8');

if (isDev) {
    // Replace tokens with actual values for development
    moduleJson = moduleJson
        .replace(/\${{ env\.VERSION }}/g, version)
        .replace(/\${{ env\.URL }}/g, projectUrl)
        .replace(/\${{ env\.MANIFEST }}/g, manifestUrl)
        .replace(/\${{ env\.DOWNLOAD }}/g, downloadUrl);
    
    console.log(`✅ Updated module.json for development with version ${version}`);
    console.log(`📦 Project URL: ${projectUrl}`);
    console.log(`📋 Manifest URL: ${manifestUrl}`);
    console.log(`⬇️  Download URL: ${downloadUrl}`);
    console.log(`\n💡 To restore tokens for repository: git checkout module.json`);
} else {
    // Replace actual values with tokens for repository
    moduleJson = moduleJson
        .replace(/"version": "[^"]*"/g, '"version": "${{ env.VERSION }}"')
        .replace(/"url": "[^"]*"/g, '"url": "${{ env.URL }}"')
        .replace(/"manifest": "[^"]*"/g, '"manifest": "${{ env.MANIFEST }}"')
        .replace(/"download": "[^"]*"/g, '"download": "${{ env.DOWNLOAD }}"');
    
    console.log(`✅ Restored module.json tokens for repository`);
    console.log(`🔧 Version will be set by GitHub Actions during release`);
    console.log(`🔧 URLs will be updated to point to specific release`);
}

// Write the updated file
fs.writeFileSync(moduleJsonPath, moduleJson, 'utf8'); 