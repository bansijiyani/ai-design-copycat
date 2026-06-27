const fs = require('fs');
const path = require('path');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('@tanstack/react-start')) return;

  // Remove tanstack imports
  content = content.replace(/import\s+\{([^}]*)\}\s+from\s+["']@tanstack\/react-start(\/server)?["'];?\n?/g, '');
  
  // Replace auth-middleware with our own mock or remove it
  content = content.replace(/import\s+\{\s*requireSupabaseAuth\s*\}\s+from\s+["']@\/integrations\/supabase\/auth-middleware["'];?\n?/g, '');

  // Convert createServerFn
  // export const myFunc = createServerFn({ method: "POST" }).validator(...).handler(async ({ data: { a, b } }) => {
  // export const myFunc = createServerFn({ method: "GET" }).handler(async () => {
  
  const regex = /export\s+const\s+(\w+)\s*=\s*createServerFn\([^)]*\)(?:\s*\.validator\([^)]+\))?\s*\.handler\(\s*async\s*\(([^)]*)\)\s*=>\s*\{/g;
  
  content = content.replace(regex, (match, funcName, args) => {
    // args could be `{ data: { email } }` or empty
    if (!args.trim()) {
      return `export async function ${funcName}() {`;
    } else {
      // Add a generic type to any destructured argument to avoid TS errors
      return `export async function ${funcName}(${args}: any) {`;
    }
  });

  // Remove requireSupabaseAuth() calls from the body
  content = content.replace(/await\s+requireSupabaseAuth\(\);?/g, '');

  if (!content.startsWith('"use server";')) {
    content = '"use server";\n\n' + content;
  }

  fs.writeFileSync(file, content);
  console.log(`Converted ${file}`);
}

const apiDir = path.join(__dirname, 'src', 'lib', 'api');
if (fs.existsSync(apiDir)) {
  fs.readdirSync(apiDir).forEach(f => {
    if (f.endsWith('.functions.ts')) {
      processFile(path.join(apiDir, f));
    }
  });
}

// Also process auth-middleware.ts if needed, but since we remove requireSupabaseAuth, we can just delete it or empty it.
const authMiddleware = path.join(__dirname, 'src', 'integrations', 'supabase', 'auth-middleware.ts');
if (fs.existsSync(authMiddleware)) {
  fs.writeFileSync(authMiddleware, '"use server";\nexport async function requireSupabaseAuth() { return {}; }');
  console.log('Mocked auth-middleware.ts');
}

// Some components might have `import { createServerFn }` directly? No, usually just API files.
