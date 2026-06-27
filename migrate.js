const fs = require('fs');
const path = require('path');

const srcRoutes = path.join(__dirname, 'src', 'routes');
const srcApp = path.join(__dirname, 'src', 'app');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function replaceImports(content) {
  let newContent = content;
  // Replace TanStack router Link with next/link
  newContent = newContent.replace(/import\s+\{([^}]*)\}\s+from\s+["']@tanstack\/react-router["'];?/g, (match, p1) => {
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

  // Remove route definitions
  newContent = newContent.replace(/export const Route = createFileRoute\([^)]+\)\([^)]+\);?/g, '');
  
  // Basic Next.js Client Component assumption
  if (newContent.includes('useQuery') || newContent.includes('useState') || newContent.includes('useEffect') || newContent.includes('useAuth') || newContent.includes('useRouter') || newContent.includes('useParams')) {
    newContent = '"use client";\n\n' + newContent;
  }
  
  // Replace useNavigate().navigate({ to: "..." }) with useRouter().push("...")
  newContent = newContent.replace(/const navigate = useNavigate\([^)]*\);?/g, 'const router = useRouter();');
  newContent = newContent.replace(/navigate\(\{ to: ([^}]+) \}\)/g, 'router.push($1)');
  
  // Replace to="..." in Link with href="..."
  newContent = newContent.replace(/<Link ([^>]*)to=([^>]+)>/g, '<Link $1href=$2>');
  // search={{ category: "..." }}
  // It's a bit complex with regex, we'll try to do basic replacements
  newContent = newContent.replace(/search=\{\{\s*([^:]+):\s*([^}]+)\s*\}\}/g, 'query={{ $1: $2 }}');
  
  // Also we need to export default the main component
  // We'll replace `function ComponentName` with `export default function ComponentName` if it's the main route component
  
  return newContent;
}

const filesToMigrate = [
  { old: 'login.tsx', new: 'login/page.tsx', comp: 'Login' },
  { old: 'signup.tsx', new: 'signup/page.tsx', comp: 'SignUp' },
  { old: 'verify-email.tsx', new: 'verify-email/page.tsx', comp: 'VerifyEmail' },
  { old: 'cart.tsx', new: 'cart/page.tsx', comp: 'Cart' },
  { old: 'wishlist.tsx', new: 'wishlist/page.tsx', comp: 'Wishlist' },
  { old: 'admin.tsx', new: 'admin/layout.tsx', comp: 'AdminLayout' },
  { old: 'admin.index.tsx', new: 'admin/page.tsx', comp: 'AdminDashboard' },
  { old: 'admin.categories.tsx', new: 'admin/categories/page.tsx', comp: 'AdminCategories' },
  { old: 'admin.orders.tsx', new: 'admin/orders/page.tsx', comp: 'AdminOrders' },
  { old: 'admin.products.tsx', new: 'admin/products/page.tsx', comp: 'AdminProducts' },
  { old: 'admin.settings.tsx', new: 'admin/settings/page.tsx', comp: 'AdminSettings' },
  { old: 'admin.users.tsx', new: 'admin/users/page.tsx', comp: 'AdminUsers' },
  { old: 'admin.verify-mfa.tsx', new: 'admin/verify-mfa/page.tsx', comp: 'AdminVerifyMFA' },
  { old: 'products.tsx', new: 'products/layout.tsx', comp: 'ProductsLayout' },
  { old: 'products.index.tsx', new: 'products/page.tsx', comp: 'ProductsIndex' },
  { old: 'products.$id.tsx', new: 'products/[id]/page.tsx', comp: 'ProductDetail' },
  { old: 'profile.tsx', new: 'profile/layout.tsx', comp: 'ProfileLayout' },
  { old: 'profile.index.tsx', new: 'profile/page.tsx', comp: 'ProfileInfo' },
  { old: 'profile.addresses.tsx', new: 'profile/addresses/page.tsx', comp: 'ProfileAddresses' },
  { old: 'profile.orders.tsx', new: 'profile/orders/page.tsx', comp: 'ProfileOrders' }
];

filesToMigrate.forEach(({ old, new: newPath, comp }) => {
  const oldPath = path.join(srcRoutes, old);
  const destPath = path.join(srcApp, newPath);
  
  if (fs.existsSync(oldPath)) {
    let content = fs.readFileSync(oldPath, 'utf8');
    content = replaceImports(content);
    // Find the main component and export it
    const fnRegex = new RegExp(`function ${comp}\\\\s*\\\\(`, 'g');
    if (content.match(fnRegex)) {
        content = content.replace(fnRegex, `export default function ${comp}(`);
    } else {
        // sometimes they are const comp = () =>
        const constRegex = new RegExp(`const ${comp}\\\\s*=`, 'g');
        if (content.match(constRegex)) {
            content = content.replace(constRegex, `export default function ${comp}`);
        }
    }
    
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, content);
    console.log(`Migrated ${old} -> ${newPath}`);
  }
});
