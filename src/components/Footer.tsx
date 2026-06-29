// import Link from "next/link";
// import { Instagram, Facebook, Phone, Mail } from "lucide-react";
// import { Logo } from "./Logo";

// export function Footer() {
//   return (
//     <footer className="bg-ink text-white/80 mt-20">
//       <div className="container mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
//         <div className="sm:col-span-2 lg:col-span-1">
//           <Logo variant="footer" className="h-16 lg:h-24 scale-[0.8] lg:scale-[0.5] origin-left" />
//           <p className="mt-4 text-sm leading-relaxed text-white/60 max-w-xs">
//             Premium fashion for every occasion. Ethnic roots, western wings — FizTopz dresses India's boldest.
//           </p>
          
//         </div>

//         {/* <div>
//           <h4 className="text-xs tracking-[0.2em] text-white mb-5">COMPANY</h4>
//           <ul className="space-y-3 text-sm">
//             {["About Us", "Our Story", "Careers", "Press", "Blog"].map((l) => (
//               <li key={l}><a href="#" className="hover:text-gold transition">{l}</a></li>
//             ))}
//           </ul>
//         </div> */}
//         <div>
//           <h3 className="text-md tracking-[0.2em] text-white mb-5">SHOP</h3>
//           <ul className="space-y-3 text-sm">
//             {["sarees", "kurtas", "lehengas", "dresses", "co-ords", "denim"].map((c) => (
//               <li key={c}>
//                 <Link href={{ pathname: "/products", query: { category: c } }} className="hover:text-gold transition capitalize">
//                   {c}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </div>


//         <div>
//           <h3 className="text-md tracking-[0.2em] text-white mb-5">HELP</h3>
//           <ul className="space-y-3 text-sm">
//             {["Shipping Policy", "Returns & Exchanges", "Size Guide", "Track Your Order", "Contact Us", "FAQs"].map((l) => (
//               <li key={l}>
//                 {l === "Size Guide" ? (
//                   <Link href="/size-guide" className="hover:text-gold transition">{l}</Link>
//                 ) : l === "Shipping Policy" ? (
//                   <Link href="/shipping-policy" className="hover:text-gold transition">{l}</Link>
//                 ) : l === "Returns & Exchanges" ? (
//                   <Link href="/returns-exchanges" className="hover:text-gold transition">{l}</Link>
//                 ) : l === "Track Your Order" ? (
//                   <Link href="/profile/orders" className="hover:text-gold transition">{l}</Link>
//                 ) : l === "Contact Us" ? (
//                   <Link href="/contact" className="hover:text-gold transition">{l}</Link>
//                 ) : l === "FAQs" ? (
//                   <Link href="/faq" className="hover:text-gold transition">{l}</Link>
//                 ) : (
//                   <a href="#" className="hover:text-gold transition">{l}</a>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div>
//           <div className="flex gap-3 mt-6">
//             {[
//               { Icon: Instagram, href: "https://www.instagram.com/fiztopz_saree/" },
//               { Icon: Facebook, href: "https://www.facebook.com/FizTopz" }
//             ].map(({ Icon, href }, i) => (
//               <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 grid place-items-center border border-white/20 rounded hover:border-gold hover:text-gold transition">
//                 <Icon className="w-4 h-4" />
//               </a>
//             ))}
//           </div>

//           <div className="mt-6 space-y-2 text-sm text-white/60">
//             <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 99048 60460</p>
//             <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> fiztopzfeb@gmail.com</p>
//           </div>

//         </div>
//       </div>
//       <div className="border-t border-white/10">
//         <div className="container mx-auto px-4 py-6 text-xs text-white/50 flex flex-wrap justify-between gap-2">
//           <p>© 2026 FizTopz. All rights reserved.</p>
//           <p>Designed with care in India.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }


import Link from "next/link";
import { Instagram, Facebook, Phone, Mail } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-ink text-white/80 mt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Desktop */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-10">
          {/* Logo */}
          <div>
            <Logo variant="footer" className="h-16 lg:h-24 scale-[0.8] lg:scale-[0.5] origin-left" />

            <p className="mt-4 text-sm leading-relaxed text-white/60 max-w-xs">
              Premium fashion for every occasion. Ethnic roots, western wings —
              FizTopz dresses India's boldest.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-md tracking-[0.2em] text-white mb-5">
              SHOP
            </h3>

            <ul className="space-y-3 text-sm">
              {[
                "sarees",
                "kurtas",
                "lehengas",
                "dresses",
                "co-ords",
                "denim",
              ].map((c) => (
                <li key={c}>
                  <Link
                    href={{
                      pathname: "/products",
                      query: { category: c },
                    }}
                    className="hover:text-gold transition capitalize"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-md tracking-[0.2em] text-white mb-5">
              HELP
            </h3>

            <ul className="space-y-3 text-sm">
              {[
                "Shipping Policy",
                "Returns & Exchanges",
                "Size Guide",
                "Track Your Order",
                "Contact Us",
                "FAQs",
              ].map((l) => (
                <li key={l}>
                  {l === "Size Guide" ? (
                    <Link
                      href="/size-guide"
                      className="hover:text-gold transition"
                    >
                      {l}
                    </Link>
                  ) : l === "Shipping Policy" ? (
                    <Link
                      href="/shipping-policy"
                      className="hover:text-gold transition"
                    >
                      {l}
                    </Link>
                  ) : l === "Returns & Exchanges" ? (
                    <Link
                      href="/returns-exchanges"
                      className="hover:text-gold transition"
                    >
                      {l}
                    </Link>
                  ) : l === "Track Your Order" ? (
                    <Link
                      href="/profile/orders"
                      className="hover:text-gold transition"
                    >
                      {l}
                    </Link>
                  ) : l === "Contact Us" ? (
                    <Link
                      href="/contact"
                      className="hover:text-gold transition"
                    >
                      {l}
                    </Link>
                  ) : l === "FAQs" ? (
                    <Link href="/faq" className="hover:text-gold transition">
                      {l}
                    </Link>
                  ) : (
                    <a href="#" className="hover:text-gold transition">
                      {l}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="flex gap-3">
              {[
                {
                  Icon: Instagram,
                  href: "https://www.instagram.com/fiztopz_saree/",
                },
                {
                  Icon: Facebook,
                  href: "https://www.facebook.com/FizTopz",
                },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 grid place-items-center border border-white/20 rounded hover:border-gold hover:text-gold transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <div className="mt-6 space-y-2 text-sm text-white/60">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +91 99048 60460
              </p>

              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                fiztopzfeb@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet */}
        <div className="lg:hidden">
          {/* Logo */}
          <div className="mb-10">
            <Logo
              variant="footer"
              className="h-16 w-auto"
            />

            <p className="mt-4 text-sm leading-relaxed text-white/60 max-w-xs">
              Premium fashion for every occasion. Ethnic roots, western wings —
              FizTopz dresses India's boldest.
            </p>
          </div>

          {/* Shop + Help */}
          <div className="grid grid-cols-2 gap-10">
            {/* Shop */}
            <div>
              <h3 className="text-md tracking-[0.2em] text-white mb-5">
                SHOP
              </h3>

              <ul className="space-y-3 text-sm">
                {[
                  "sarees",
                  "kurtas",
                  "lehengas",
                  "dresses",
                  "co-ords",
                  "denim",
                ].map((c) => (
                  <li key={c}>
                    <Link
                      href={{
                        pathname: "/products",
                        query: { category: c },
                      }}
                      className="hover:text-gold transition capitalize"
                    >
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="text-md tracking-[0.2em] text-white mb-5">
                HELP
              </h3>

              <ul className="space-y-3 text-sm">
                {[
                  "Shipping Policy",
                  "Returns & Exchanges",
                  "Size Guide",
                  "Track Your Order",
                  "Contact Us",
                  "FAQs",
                ].map((l) => (
                  <li key={l}>
                    {l === "Size Guide" ? (
                      <Link
                        href="/size-guide"
                        className="hover:text-gold transition"
                      >
                        {l}
                      </Link>
                    ) : l === "Shipping Policy" ? (
                      <Link
                        href="/shipping-policy"
                        className="hover:text-gold transition"
                      >
                        {l}
                      </Link>
                    ) : l === "Returns & Exchanges" ? (
                      <Link
                        href="/returns-exchanges"
                        className="hover:text-gold transition"
                      >
                        {l}
                      </Link>
                    ) : l === "Track Your Order" ? (
                      <Link
                        href="/profile/orders"
                        className="hover:text-gold transition"
                      >
                        {l}
                      </Link>
                    ) : l === "Contact Us" ? (
                      <Link
                        href="/contact"
                        className="hover:text-gold transition"
                      >
                        {l}
                      </Link>
                    ) : l === "FAQs" ? (
                      <Link
                        href="/faq"
                        className="hover:text-gold transition"
                      >
                        {l}
                      </Link>
                    ) : (
                      <a href="#" className="hover:text-gold transition">
                        {l}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-10">
            <div className="flex gap-3">
              {[
                {
                  Icon: Instagram,
                  href: "https://www.instagram.com/fiztopz_saree/",
                },
                {
                  Icon: Facebook,
                  href: "https://www.facebook.com/FizTopz",
                },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 grid place-items-center border border-white/20 rounded hover:border-gold hover:text-gold transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <div className="mt-6 space-y-2 text-sm text-white/60">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +91 99048 60460
              </p>

              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                fiztopzfeb@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/50">
          <p>© 2026 FizTopz. All rights reserved.</p>
          <p>Designed with care in India.</p>
        </div>
      </div>
    </footer>
  );
}
