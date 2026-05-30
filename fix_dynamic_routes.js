const fs = require('fs');
const path = require('path');

function findRouteFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...findRouteFiles(fullPath));
    } else if (item.name === 'route.ts') {
      results.push(fullPath);
    }
  }
  return results;
}

const apiDir = path.join(__dirname, 'app', 'api');
const routeFiles = findRouteFiles(apiDir);

let fixed = 0;
for (const file of routeFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("export const dynamic")) {
    const lines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
            lastImportIndex = i;
        }
    }
    
    // Insert export const dynamic = 'force-dynamic' after the last import
    lines.splice(lastImportIndex + 1, 0, "\nexport const dynamic = 'force-dynamic'\n");
    fs.writeFileSync(file, lines.join('\n'));
    console.log(`Fixed: ${file}`);
    fixed++;
  }
}

console.log(`Total route files checked: ${routeFiles.length}`);
console.log(`Fixed missing dynamic export: ${fixed}`);
