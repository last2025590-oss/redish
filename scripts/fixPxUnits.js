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
        
        // Replace all "px" values with numbers (but avoid changing comments and strings)
        content = content.replace(pxRegex, (match, number) => {
          // Don't replace px in commented code or strings
          if (isInCommentOrString(content, match)) {
            return match;
          }
          return number;
        });
        
        if (content !== originalContent) {
          const fixes = (content.match(/\d+/g) || []).length - (originalContent.match(/\d+/g) || []).length;
          totalFixes += fixes;
          filesFixed++;
          
          fs.writeFileSync(file, content, 'utf8');
          console.log(colorText(`✅ Fixed ${fixes} px units in: ${path.relative(process.cwd(), file)}`, 'green'));
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
  // Simple check - if the px is preceded by // or /* or within quotes
  const index = content.indexOf(match);
  const precedingText = content.substring(0, index);
  
  // Check if it's in a single line comment
  if (precedingText.includes('//')) {
    const lines = precedingText.split('\n');
    const lastLine = lines[lines.length - 1];
    if (lastLine.includes('//')) {
      return true;
    }
  }
  
  // Check if it's in a multi-line comment
  if (precedingText.includes('/*') && !precedingText.includes('*/')) {
    return true;
  }
  
  // Check if it's in a string (simple check)
  const singleQuotes = (precedingText.match(/'/g) || []).length;
  const doubleQuotes = (precedingText.match(/"/g) || []).length;
  
  // If odd number of quotes, we're inside a string
  if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
    return true;
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
        if (item.name === 'node_modules' || item.name === '.git' || item.name === '.expo') {
          continue;
        }
        files.push(...getAllFiles(fullPath));
      } else {
        files.push(fullPath);
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

const appResult = fixPxUnits('./app');
const componentsResult = fixPxUnits('./components');

console.log('\n' + colorText('📊 Fix Results:', 'blue'));
console.log(colorText(`   Files fixed: ${appResult.filesFixed + componentsResult.filesFixed}`, 'green'));
console.log(colorText(`   Total px units removed: ${appResult.totalFixes + componentsResult.totalFixes}`, 'green'));

console.log(colorText('\n🎉 All px units have been fixed!', 'green'));
console.log(colorText('💡 Remember to restart your Metro bundler: npm start -- --reset-cache', 'yellow'));