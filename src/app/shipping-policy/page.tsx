"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Truck } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl text-ink font-light tracking-wide mb-4 flex items-center justify-center gap-4">
              <Truck className="w-8 h-8 text-gold" />
              Shipping Policy
            </h1>
            <p className="text-ink/70 max-w-2xl mx-auto font-sans">
              Please review our shipping timelines, international delivery rules, and Cash on Delivery (COD) structures.
            </p>
          </div>

          <div className="space-y-8 font-sans">
            
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">Delivery & Shipping Timings</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p>
                  <strong className="text-ink">Processing time:</strong> Orders are processed and dispatched within 24 to 48 hours (excluding Sundays and public holidays).
                </p>
                <p>
                  <strong className="text-ink">Transit time:</strong> National shipping within India takes approximately 7 to 15 days.
                </p>
                <p>
                  <strong className="text-ink">Delivery window:</strong> Shipments are delivered on business days between 9:00 AM and 6:00 PM.
                </p>
                <p>
                  <strong className="text-ink">Tracking:</strong> Customers will receive tracking details via email/SMS once the order is shipped.
                </p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">Order Tracking</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p>Once your order is shipped, you will receive an email / message with the tracking number and a link to track your package.</p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">Delivery Partners</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p>We partner with leading courier services such as DHL, FedEx, Blue Dart, and India Post to ensure reliable delivery.</p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">Handling and Packaging</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p>All sarees are carefully packed to prevent damage during transit.</p>
                <p>Each package includes an invoice.</p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">Pincode Serviceability & Delivery Issues</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p><strong className="text-ink">Pincode Serviceability:</strong> We deliver to most pincodes across India. In case your pincode is not serviceable, our customer service team will contact you to make alternate arrangements.</p>
                <p><strong className="text-ink">Delivery Issues:</strong> If you are not available at the time of delivery, our delivery partner will attempt to deliver your package up to three times. After the third attempt, the package will be returned to us.</p>
                <p>In case of delays due to unforeseen circumstances like weather, strikes, or public holidays, delivery times may be extended. We will keep you informed in such cases.</p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">International Shipping & Customs</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p><strong className="text-ink">Availability:</strong> We ship to multiple countries worldwide.</p>
                <p><strong className="text-ink">Processing Time:</strong> Orders are processed and dispatched within 10-15 business days.</p>
                <p><strong className="text-ink">Delivery Time:</strong> International delivery times vary by destination: 10 – 20 days.</p>
                <p><strong className="text-ink">Shipping Charges:</strong> Calculated at checkout based on destination and weight of the package. Customers are responsible for any customs duties and taxes.</p>
                <p><strong className="text-ink">Customs and Duties:</strong> International shipments may be subject to customs duties and taxes, which are levied by the destination country. Customers are responsible for paying any additional charges for customs clearance. We have no control over these charges and cannot predict what they may be. If you refuse to pay the customs charges, the package will be returned to us, and we will issue a refund minus the shipping costs.</p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">Cash on Delivery (COD) Policy</h2>
              
              <div className="space-y-6 text-ink/80 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-ink text-lg mb-2">COD Eligibility</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Allowed only for order values between ₹600 and ₹30,000.</li>
                    <li>Orders below ₹600: COD option is not available.</li>
                    <li>Orders above ₹30,000: Prepaid orders only.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-ink text-lg mb-3">COD Charge Slabs</h3>
                  <div className="overflow-x-auto rounded-xl border border-gold/20">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-ink text-white">
                        <tr>
                          <th className="p-4 font-medium">Order Value</th>
                          <th className="p-4 font-medium">COD Charge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold/10">
                        <tr className="hover:bg-gold/5 transition-colors">
                          <td className="p-4 text-ink/70">₹601 – ₹1,995</td>
                          <td className="p-4 font-semibold text-ink">₹95</td>
                        </tr>
                        <tr className="hover:bg-gold/5 transition-colors">
                          <td className="p-4 text-ink/70">₹1,996 – ₹3,995</td>
                          <td className="p-4 font-semibold text-ink">₹200</td>
                        </tr>
                        <tr className="hover:bg-gold/5 transition-colors">
                          <td className="p-4 text-ink/70">₹3,996 – ₹4,995</td>
                          <td className="p-4 font-semibold text-ink">₹300</td>
                        </tr>
                        <tr className="hover:bg-gold/5 transition-colors">
                          <td className="p-4 text-ink/70">₹4,996 – ₹9,995</td>
                          <td className="p-4 font-semibold text-ink">₹500</td>
                        </tr>
                        <tr className="hover:bg-gold/5 transition-colors">
                          <td className="p-4 text-ink/70">₹9,996 – ₹14,995</td>
                          <td className="p-4 font-semibold text-ink">₹1,000</td>
                        </tr>
                        <tr className="hover:bg-gold/5 transition-colors">
                          <td className="p-4 text-ink/70">₹14,996 – ₹19,995</td>
                          <td className="p-4 font-semibold text-ink">₹2,000</td>
                        </tr>
                        <tr className="hover:bg-gold/5 transition-colors">
                          <td className="p-4 text-ink/70">₹19,996 – ₹30,000</td>
                          <td className="p-4 font-semibold text-ink">₹3,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-ink text-lg mb-2">Other COD Terms</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Prices shown are inclusive of GST.</li>
                    <li>COD charges are non-refundable.</li>
                    <li>Delivery charges, if applicable, are added separately.</li>
                  </ul>
                </div>

              </div>
            </section>
            
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">Contact Us</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p>For any shipping-related queries, please contact our customer service team at  +91 99048 60460 / fiztopzfeb@gmail.com [ Mon – Sat; 10:30 am to 7 pm IST]</p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20">
              <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4 font-serif">Changes to Shipping Policy</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p>We reserve the right to update this shipping policy at any time. Changes will be posted on our website and will take effect immediately.</p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
