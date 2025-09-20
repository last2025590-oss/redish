#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function colorText(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function fixPxUnits(directory) {
  console.log(colorText(`🔍 Scanning directory: ${directory}`, 'blue'));
  
  const files = getAllFiles(directory);
  const pxRegex = /(\d+)px/g;
  let totalFixes = 0;
  let filesFixed = 0;

  files.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        const originalContent = content;
        
        // Count px units before replacement
        const pxMatches = content.match(pxRegex) || [];
        
        // Replace px units but preserve comments and strings
        content = content.replace(pxRegex, (match, number) => {
          // Don't replace px in commented code or strings
          if (isInCommentOrString(content, match)) {
            return match;
          }
          return number;
        });
        
        if (content !== originalContent) {
          totalFixes += pxMatches.length;
          filesFixed++;
          
          fs.writeFileSync(file, content, 'utf8');
          console.log(colorText(`✅ Fixed ${pxMatches.length} px units in: ${path.relative(process.cwd(), file)}`, 'green'));
        }
      } catch (error) {
        console.log(colorText(`❌ Error processing file: ${file}`, 'red'));
        console.log(colorText(`   Error: ${error.message}`, 'red'));
      }
    }
  });

  return { totalFixes, filesFixed };
}

function isInCommentOrString(content, match) {
  const index = content.indexOf(match);
  if (index === -1) return false;
  
  const precedingText = content.substring(0, index);
  
  // Check for single line comments (//)
  const lastLine = precedingText.split('\n').pop();
  if (lastLine.includes('//')) {
    return true;
  }
  
  // Check for multi-line comments (/* ... */)
  const lastMultiLineCommentStart = precedingText.lastIndexOf('/*');
  const lastMultiLineCommentEnd = precedingText.lastIndexOf('*/');
  
  if (lastMultiLineCommentStart > lastMultiLineCommentEnd) {
    return true; // Inside a multi-line comment
  }
  
  // Check for template literals (`...`)
  const backticks = (precedingText.match(/`/g) || []).length;
  if (backticks % 2 !== 0) {
    return true; // Inside template literal
  }
  
  // Check for single quotes
  const singleQuotes = (precedingText.match(/'/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    return true; // Inside single quotes
  }
  
  // Check for double quotes
  const doubleQuotes = (precedingText.match(/"/g) || []).length;
  if (doubleQuotes % 2 !== 0) {
    return true; // Inside double quotes
  }
  
  return false;
}

function getAllFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.log(colorText(`⚠️  Directory does not exist: ${dir}`, 'yellow'));
    return files;
  }
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      // Skip node_modules and other directories we don't want to scan
      if (item.isDirectory()) {
        if (item.name === 'node_modules' || item.name === '.git' || item.name === '.expo' || item.name === '.next') {
          continue;
        }
        files.push(...getAllFiles(fullPath));
      } else {
        // Only process React/TypeScript files
        if (item.name.endsWith('.js') || item.name.endsWith('.jsx') || item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.log(colorText(`❌ Could not read directory: ${dir}`, 'red'));
    console.log(colorText(`   Error: ${error.message}`, 'red'));
  }
  
  return files;
}

// Main execution
console.log(colorText('🚀 Starting px unit fix script...', 'blue'));
console.log(colorText('📁 Scanning app and components directories', 'blue'));

const directories = ['./app', './components', './src', './lib'];
let totalFixes = 0;
let totalFilesFixed = 0;

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    const result = fixPxUnits(dir);
    totalFixes += result.totalFixes;
    totalFilesFixed += result.filesFixed;
  }
});

console.log('\n' + colorText('📊 Fix Results:', 'blue'));
console.log(colorText(`   Files fixed: ${totalFilesFixed}`, 'green'));
console.log(colorText(`   Total px units removed: ${totalFixes}`, 'green'));

if (totalFixes > 0) {
  console.log(colorText('\n🎉 All px units have been fixed!', 'green'));
  console.log(colorText('💡 Remember to restart your Metro bundler: npm start -- --reset-cache', 'yellow'));
} else {
  console.log(colorText('\n✅ No px units found to fix!', 'green'));
}