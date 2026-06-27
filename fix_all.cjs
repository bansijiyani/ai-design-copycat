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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Fix components importing @tanstack/react-router
  if (content.includes('@tanstack/react-router')) {
    content = content.replace(/import\s+\{([^}]*)\}\s+from\s+["']@tanstack\/react-router["'];?/g, (match, p1) => {
      let replacements = [];
      if (p1.includes('useNavigate')) replacements.push('useRouter');
      if (p1.includes('useRouter')) replacements.push('useRouter');
      if (p1.includes('useParams')) replacements.push('useParams');
      
      let imports = [];
      if (p1.includes('Link')) imports.push('import Link from "next/link";');
      if (replacements.length > 0) {
        imports.push(`import { ${[...new Set(replacements)].join(', ')} } from "next/navigation";`);
      }
      return imports.join('\n');
    });
    
    // Fix useNavigate().navigate({ to: ... }) to useRouter().push(...)
    content = content.replace(/const navigate = useNavigate\([^)]*\);?/g, 'const router = useRouter();');
    content = content.replace(/navigate\(\{\s*to:\s*["']([^"']+)["']\s*\}\)/g, 'router.push("$1")');
    content = content.replace(/<Link ([^>]*)to=([^>]+)>/g, '<Link $1href=$2>');
    
    changed = true;
  }

  // 2. Fix syntax errors like router.push("/");, -> router.push("/");
  if (content.includes('router.push("/");,')) {
    content = content.replace(/router\.push\([^)]+\);\s*,/g, 'router.push("/");');
    changed = true;
  }

  // Also fix setTimeout syntax error where a semicolon got injected before comma
  if (content.includes(');,')) {
    content = content.replace(/\);\s*,/g, '),');
    changed = true;
  }
  
  if (content.includes('";,')) {
    content = content.replace(/";,/g, '",');
    changed = true;
  }
  
  if (content.includes('});') && file.includes('functions.ts')) {
    // A bit hacky: if it's a server action file, and we see `});` on its own line, change it to `}`
    content = content.replace(/^\s*\}\);\s*$/gm, '}');
    changed = true;
  }
  
  // Specific fix for src/app/products/page.tsx:15 ` : Search => ({ `
  // The original script failed here
  if (file.endsWith('products/page.tsx') && content.includes(': Search => ({')) {
    content = content.replace(/:\s*Search\s*=>\s*\(\{/g, '({');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  }
});
