const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // 1. Literal $120 or $ 120 -> EGP 120 or EGP 120
      content = content.replace(/\$\s*([0-9]+\.?[0-9]*)/g, 'EGP $1');
      
      // 2. JSX Text: >${price}< -> >EGP {price}< or >$ {price}< -> >EGP {price}<
      content = content.replace(/>\s*\$\s*\{/g, '>EGP {');

      // 3. Template Literals (JS): `$${price}` -> `EGP ${price}`
      content = content.replace(/['"`]\$\$\{/g, match => match[0] + 'EGP ${');

      // 4. Sometimes people write '$' + price
      content = content.replace(/['"]\$['"]/g, "'EGP '");
      content = content.replace(/['"]\$ ['"]/g, "'EGP '");

      fs.writeFileSync(fullPath, content);
    }
  }
}
processDir('src');
console.log('Currency replaced.');
