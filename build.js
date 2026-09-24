#!/usr/bin/env node

/**
 * Build script for Vercel deployment
 * Copies src/members-map.html to public/index.html
 * Works cross-platform (Windows, macOS, Linux)
 */

const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'src', 'members-map.html');
const publicDir = path.join(__dirname, 'public');
const targetFile = path.join(publicDir, 'index.html');

try {
  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('✓ Created public directory');
  }

  // Read source file
  const content = fs.readFileSync(sourceFile, 'utf-8');

  // Write to public/index.html
  fs.writeFileSync(targetFile, content, 'utf-8');

  console.log('✓ Built public/index.html from src/members-map.html');
  process.exit(0);
} catch (error) {
  console.error('✗ Build failed:', error.message);
  process.exit(1);
}
