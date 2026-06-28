"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What fabrics are available at FizTopz?",
    answer: "We offer a wide variety of premium fabrics including pure cotton, silk, georgette, chiffon, organza, and linen. Each product page specifies the exact fabric composition under the 'Product Description' section."
  },
  {
    question: "How do I identify pure cotton or silk sarees?",
    answer: "All our pure cotton and silk sarees come with detailed material descriptions and authenticity guarantees. Pure silk sarees feature the Silk Mark, and our cottons are certified 100% breathable natural weaves."
  },
  {
    question: "Do you sell festive and wedding collections?",
    answer: "Yes! We have an exclusive range of heavy-work lehengas, bridal sarees, and premium festive kurtas designed specifically for weddings and grand celebrations. Check out our 'Ethnic' category."
  },
  {
    question: "Are your sarees suitable for office wear?",
    answer: "Absolutely. We have a dedicated collection of lightweight, comfortable, and elegant sarees in linen, cotton, and georgette that are perfect for long office hours and corporate wear."
  },
  {
    question: "Do you offer plus-size ethnic wear?",
    answer: "Yes, inclusivity is important to us. We offer sizes up to XXL and 'Free Size' options for many of our garments. We also provide custom tailoring services for specific fits."
  },
  {
    question: "How often do you launch new collections?",
    answer: "We launch new collections every season (Spring, Summer, Autumn, Winter) along with special capsule collections for major Indian festivals like Diwali, Eid, and Navratri."
  },
  {
    question: "Can I gift-wrap my order?",
    answer: "Yes! During checkout, you can select the 'Gift Wrap' option. We use premium FizTopz signature packaging and can even include a personalized handwritten note for your loved ones."
  },
  {
    question: "Are there discounts during festive seasons?",
    answer: "We frequently run festive sales and offer special discount codes to our newsletter subscribers. Keep an eye on our homepage banner or subscribe to our emails to stay updated on upcoming sales!"
  },
  {
    question: "How can I check if a product is back in stock?",
    answer: "If a product is marked 'OUT OF STOCK', you can add it to your Wishlist. We will notify you via email as soon as the item is restocked."
  },
  {
    question: "What should I do if I receive a damaged or incorrect product?",
    answer: "We have a strict quality check process, but if this happens, please contact our support team within 48 hours of delivery at fiztopzfeb@gmail.com with photos of the product. We will arrange a free return and replacement."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">Find answers to commonly asked questions about our collections, materials, and policies.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="border border-border/60 rounded-lg overflow-hidden bg-card/30">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none transition-colors hover:bg-muted/50"
                  >
                    <span className="font-semibold pr-4">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gold flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
                  >
                    <div className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center bg-muted/30 p-8 rounded-lg border border-border/40">
            <h3 className="text-xl font-display mb-2">Still have questions?</h3>
            <p className="text-muted-foreground text-sm mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
            <a href="/contact" className="inline-block bg-gold text-white px-8 py-3 font-semibold text-sm rounded-sm hover:bg-gold/90 transition">
              CONTACT US
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
