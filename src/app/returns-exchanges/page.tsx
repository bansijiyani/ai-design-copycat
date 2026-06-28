"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RefreshCcw } from "lucide-react";

export default function ReturnsExchangesPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl text-ink font-light tracking-wide mb-4 flex items-center justify-center gap-4">
              <RefreshCcw className="w-8 h-8 text-gold" />
              Return & Exchange Policy
            </h1>
            <p className="text-ink/70 max-w-2xl mx-auto font-sans">
              Please carefully review our policies regarding domestic and international returns, exchanges, and handloom product characteristics.
            </p>
          </div>

          <div className="space-y-8 font-sans">
            
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">Domestic Orders</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <ul className="list-disc pl-5 space-y-2">
                  <li>An order is eligible for Return/ Exchange within <strong>3 days</strong> from the date of delivery.</li>
                  <li>No returns or exchanges will be accepted for products on special sale and any clearance sale.</li>
                  <li>Please do not accept the package if it is delivered to you in a bad condition.</li>
                </ul>

                <h3 className="font-semibold text-ink text-lg mt-6 mb-3">Return Reason Resolution:</h3>
                <div className="overflow-x-auto rounded-xl border border-gold/20 mb-6">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-ink text-white">
                      <tr>
                        <th className="p-4 font-medium">Return Reason</th>
                        <th className="p-4 font-medium">Resolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/10">
                      <tr className="hover:bg-gold/5 transition-colors">
                        <td className="p-4 text-ink/70">Damage / Defective</td>
                        <td className="p-4 font-semibold text-ink">Replacement / Coupon</td>
                      </tr>
                      <tr className="hover:bg-gold/5 transition-colors">
                        <td className="p-4 text-ink/70">Incorrect Product</td>
                        <td className="p-4 font-semibold text-ink">Refund / Coupon</td>
                      </tr>
                      <tr className="hover:bg-gold/5 transition-colors">
                        <td className="p-4 text-ink/70">Colour different from description</td>
                        <td className="p-4 font-semibold text-ink">Exchange / Coupon</td>
                      </tr>
                      <tr className="hover:bg-gold/5 transition-colors">
                        <td className="p-4 text-ink/70">I do not like this material</td>
                        <td className="p-4 font-semibold text-ink">Exchange / Coupon</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>Please ensure that products are returned in original condition and packaging in order to get your full credit. Kindly note that this is a non-negotiable policy.</p>
                <p>The photos of all products are taken under neutral lighting conditions, and we make the best possible effort to reproduce the exact color. Sometimes the colors may look different due to the temperature of your monitor and/or device settings.</p>
                <p>Please note that once a refund is approved it would take <strong>7-9 business days</strong> for the refund to process.</p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">Return / Exchange Process</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p><strong className="text-ink">Step 1:</strong> Contact our customer service at +91 99048 60460 / fiztopzfeb@gmail.com [ Mon – Sat ; 10:30 am to 7 pm IST ] within 3 days of receiving your order to request a return /exchange authorization.</p>
                <p><strong className="text-ink">Step 2:</strong> Include your order number, reason for return / exchange, and photos of the product if there is a defect/damage.</p>
                <p><strong className="text-ink">Step 3:</strong> Our support team will analyze the return / exchange request and approve the same.</p>
                
                
                <div className="mt-4 p-4 bg-gold/10 rounded-lg text-ink font-medium text-center">
                  * Reverse pickup service is available for damaged / defective / incorrect items. *
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">International Orders</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p>We unfortunately do not have a return or exchange policy for our international customers. If you do wish to return the product, you can contact our customer care, provide photos and ship it back to us at your own expense. We can provide a refund to your original mode of payment or as a coupon.</p>
                <p>Make sure the original product is intact as we do a quality check before approving a refund. <strong>*Shipping charges are non-refundable.</strong></p>
                <p>If you have to cancel an order, please do so before your order is shipped and we will refund the entire amount. Once your order is shipped we cannot cancel the order and no refund will be provided.</p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">Usual Inconsistencies in Handloom Products</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p>Below points come under weaving inconsistencies of a handloom product and are <strong>NOT</strong> considered defects / damages:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The small knots or bumps in threads you often see occur when broken threads are pieced together. This is not considered a defect.</li>
                  <li>The uneven threads connecting the border to the body are not considered defects.</li>
                  <li>Slubs - residual threads bundled together in tiny knots.</li>
                  <li>Missing Line / Minute gaps in and around motif.</li>
                  <li>Minute thread gaps around a motif and in body/pallu.</li>
                  <li>The dyed threads sometimes run over the pallu with Zari threads, which looks like the color has 'bled' from the body to the pallu. Rest assured, it is the powerloom working with a dyed thread that often gets added to the pallu, and is not considered a defect.</li>
                </ul>
                <p>Colors can be a tricky topic too. We state the colors based on the color of the threads used on the warp and weft. But when two different hues come together, it may happen that they mix to become an entirely different color when seen on our website.</p>
                <p>A good example is brown and red coming together to look like maroon when photographed. We take great pains to ensure you get what you see, but in case the user's device has its own monitor/display settings, the colors may look different.</p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">What We Do Consider As Defects</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <ul className="list-disc pl-5 space-y-2 font-medium">
                  <li>Tear in the product</li>
                  <li>Incorrect length (instead of what was stated)</li>
                  <li>Missing blouse piece (if mentioned that the saree has a blouse piece)</li>
                </ul>
                <p className="mt-6 italic">The decision to accept returns rests solely with the FizTopz team.</p>
                <p className="font-medium text-gold text-lg">But rest assured, we have a robust quality check team that goes through each product meticulously to ensure you get only the best quality of products!</p>
              </div>
            </section>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
