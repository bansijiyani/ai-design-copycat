const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src', 'app'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Clean up => ({ meta: ... }) or => {children} ...
  let changed = false;
  
  const regexMeta = /^\s*=>\s*\(\{\s*meta[\s\S]*?\}\);\s*/m;
  if (regexMeta.test(content)) {
    content = content.replace(regexMeta, '');
    changed = true;
  }
  
  const regexChildren = /^\s*=>\s*\{children\},[\s\S]*?\}\);\s*/m;
  if (regexChildren.test(content)) {
    content = content.replace(regexChildren, '');
    changed = true;
  }

  // Replace router.push(/* TODO: fix navigate args */) -> router.push("/")
  // Or router.push({ to: "..." }) -> router.push("...")
  if (content.includes('router.push(/* TODO: fix navigate args */)')) {
    content = content.replace(/router\.push\(\/\*\s*TODO:\s*fix navigate args\s*\*\/\);?/g, 'router.push("/");');
    changed = true;
  }
  
  if (content.includes('router.replace(/* TODO: fix navigate args */)')) {
    content = content.replace(/router\.replace\(\/\*\s*TODO:\s*fix navigate args\s*\*\/\);?/g, 'router.replace("/");');
    changed = true;
  }
  
  // Add ReactNode import if { children: ReactNode } is used and not imported
  // But React.ReactNode is used, so it's fine.
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Cleaned up ${file}`);
  }
});
