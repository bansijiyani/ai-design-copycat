1. Database Integration & Schema
Tooling: Prisma ORM + PostgreSQL (hosted on Neon.tech). The database is strictly typed and managed using Prisma.

Core Schema Flow:

Users (User, Account, Address): Handles NextAuth OAuth linking. Users can save multiple delivery addresses.
Catalog (Category, Product, ProductVariant, ProductImage):
A Product holds the base details (Name, Description, Base Price).
A ProductVariant handles the physical inventory. One shirt can have 4 variants (Red-S, Red-M, Blue-S, Blue-M), each with its own stock count, SKU, and optional price override.
Orders (Order, OrderItem, Payment): When a user buys something, an Order is created. To prevent historical data corruption (e.g., if a product's price changes later or an address is edited), the system stores an addressSnapshot and productSnapshot (JSON) locked in time.
2. API Calling (Server Actions vs. Route Handlers)
Because this is a modern Next.js 15 app, it uses two different methods to communicate with the database:

Method A: Server Actions (src/app/actions) For internal operations (like creating a product or updating an address), the app uses Next.js Server Actions.

Flow: A user submits a form on the frontend (e.g., Add Product) -> React calls an async function imported directly from src/app/actions/products.ts -> This function runs securely on the server, validates the data, queries Prisma (prisma.product.create()), and calls revalidatePath() to instantly update the frontend without reloading the page.
Why? It's significantly faster to write and doesn't require building manual fetch() endpoints.
Method B: API Routes (src/app/api) For external integrations (like Stripe or NextAuth), standard REST endpoints are used.

Flow: Stripe needs an HTTP URL to send webhooks to. So, the app exposes /api/webhooks/stripe/route.ts.
3. Image Management Flow (Cloudinary)
Images are not stored in the PostgreSQL database directly, as that is slow and expensive.

Frontend Upload: When an admin uploads a product image, the CloudinaryUpload.tsx component opens a widget.
Direct-to-Cloud: The image is uploaded directly from the browser to Cloudinary's servers using an "unsigned upload preset" (fiztopz_preset). It never touches your Next.js server, saving bandwidth.
Database Storage: Cloudinary returns a highly optimized, CDN-hosted URL (e.g., https://res.cloudinary.com/.../image.jpg).
Save: The Server Action takes that URL and saves it into the Prisma ProductImage table.