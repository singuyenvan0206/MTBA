const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Tai/tttn/code/frontend/src/app/pos';

function walkDir(d) {
  const files = fs.readdirSync(d);
  files.forEach(file => {
    const filePath = path.join(d, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content.replace(/\/pos2/g, '/pos');
        if (content !== newContent) {
          fs.writeFileSync(filePath, newContent);
          console.log('Updated', filePath);
        }
      }
    }
  });
}

walkDir(dir);
