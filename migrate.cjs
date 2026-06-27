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
  
  // Basic Next.js Client Component assumption
  if (newContent.includes('useQuery') || newContent.includes('useState') || newContent.includes('useEffect') || newContent.includes('useAuth') || newContent.includes('useRouter') || newContent.includes('useParams') || newContent.includes('useForm') || newContent.includes('useToast')) {
    if (!newContent.startsWith('"use client";')) {
      newContent = '"use client";\n\n' + newContent;
    }
  }

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
    
    // Some routes import Outlet or other things we don't need in Next.js, we can just remove them for now
    // Actually we might need children in Layouts, we'll fix Layouts manually if needed.
    return imports.join('\n');
  });

  // Remove route definitions
  newContent = newContent.replace(/export const Route = createFileRoute\([^)]+\)\([^)]+\);?/g, '');
  newContent = newContent.replace(/export const Route = createFileRoute\([^)]+\)\(\{[\s\S]*?\}\);/g, ''); // multiline
  
  // Replace useNavigate().navigate({ to: "..." }) with useRouter().push("...")
  newContent = newContent.replace(/const navigate = useNavigate\([^)]*\);?/g, 'const router = useRouter();');
  newContent = newContent.replace(/navigate\(\{\s*to:\s*["']([^"']+)["']\s*\}\)/g, 'router.push("$1")');
  newContent = newContent.replace(/navigate\(\{([^}]+)\}\)/g, 'router.push(/* TODO: fix navigate args */)');
  
  // Replace to="..." in Link with href="..."
  newContent = newContent.replace(/<Link ([^>]*)to=([^>]+)>/g, '<Link $1href=$2>');
  // search={{ category: "..." }}
  // It's a bit complex with regex, we'll try to do basic replacements
  newContent = newContent.replace(/search=\{\{\s*([^:]+):\s*([^}]+)\s*\}\}/g, 'query={{ $1: $2 }}');
  
  // Replace router.state.location.pathname with usePathname() if it was used
  newContent = newContent.replace(/router\.state\.location\.pathname/g, 'pathname');
  
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
    const fnRegex = new RegExp(`function ${comp}\\s*\\(`, 'g');
    if (content.match(fnRegex)) {
        content = content.replace(fnRegex, `export default function ${comp}(`);
    } else {
        const constRegex = new RegExp(`const ${comp}\\s*=`, 'g');
        if (content.match(constRegex)) {
            content = content.replace(constRegex, `export default const ${comp} =`);
        }
    }
    
    // In layouts, we need to replace Outlet with children
    if (newPath.endsWith('layout.tsx')) {
        content = content.replace(/import\s+\{\s*Outlet\s*\}\s+from\s+["']@tanstack\/react-router["'];?/g, '');
        content = content.replace(/<Outlet\s*\/?>(<\/Outlet>)?/g, '{children}');
        
        // Add children to props if not there
        const layoutFn = `export default function ${comp}(`;
        if (content.includes(layoutFn + ')')) {
            content = content.replace(layoutFn + ')', layoutFn + '{ children }: { children: React.ReactNode })');
        } else if (!content.includes('children')) {
            content = content.replace(layoutFn, layoutFn + '{ children }: { children: React.ReactNode }, ');
        }
    }

    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, content);
    console.log(`Migrated ${old} -> ${newPath}`);
  }
});
