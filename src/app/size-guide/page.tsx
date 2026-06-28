"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Ruler } from "lucide-react";

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl text-ink font-light tracking-wide mb-4 flex items-center justify-center gap-4">
              <Ruler className="w-8 h-8 text-gold" />
              Size Guide
            </h1>
            <p className="text-ink/70 max-w-2xl mx-auto font-sans">
              Not sure how to measure apparel? When shopping online, knowing your measurements will help you select the best size for your body without trying the product on. Use our comprehensive clothing size charts below for reference.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gold/20 mb-12">
            <h2 className="text-2xl text-ink mb-6 border-b border-gold/20 pb-4">How to Measure</h2>
            <div className="grid md:grid-cols-2 gap-8 font-sans text-ink/80">
              <div>
                <h3 className="font-semibold text-ink mb-2">Chest / Bust</h3>
                <p className="text-sm">Keep the tape parallel to the floor and measure around the fullest part of your chest/bust. Use this measurement for tops, kurtas, and dresses.</p>
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-2">Waist</h3>
                <p className="text-sm">Measure around your natural waistline, which is the narrowest part of your waist, keeping the tape comfortably loose.</p>
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-2">Hips</h3>
                <p className="text-sm">Measure the fullest part of your hips standing with your feet together. Make sure to measure over your buttocks as well.</p>
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-2">Inseam</h3>
                <p className="text-sm">Measure from the crotch to the inside seam of the leg while wearing your best fitting pair of pants. Wearing shoes is recommended.</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="womens" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-ink/5 p-1 rounded-xl">
              <TabsTrigger 
                value="womens"
                className="rounded-lg data-[state=active]:bg-ink data-[state=active]:text-white transition-all font-sans"
              >
                Women's Sizes
              </TabsTrigger>
              <TabsTrigger 
                value="mens"
                className="rounded-lg data-[state=active]:bg-ink data-[state=active]:text-white transition-all font-sans"
              >
                Men's Sizes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="womens" className="space-y-8 animate-in fade-in duration-500">
              <div className="overflow-x-auto rounded-xl border border-gold/20">
                <table className="w-full text-left font-sans text-sm">
                  <thead className="bg-ink text-white">
                    <tr>
                      <th className="p-4 font-medium">Size</th>
                      <th className="p-4 font-medium">Bust (Inches)</th>
                      <th className="p-4 font-medium">Waist (Inches)</th>
                      <th className="p-4 font-medium">Hips (Inches)</th>
                      <th className="p-4 font-medium">UK Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    {[
                      { size: "XS", bust: "32", waist: "26", hips: "36", uk: "6" },
                      { size: "S", bust: "34", waist: "28", hips: "38", uk: "8" },
                      { size: "M", bust: "36", waist: "30", hips: "40", uk: "10" },
                      { size: "L", bust: "38", waist: "32", hips: "42", uk: "12" },
                      { size: "XL", bust: "40", waist: "34", hips: "44", uk: "14" },
                      { size: "XXL", bust: "42", waist: "36", hips: "46", uk: "16" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-gold/5 transition-colors">
                        <td className="p-4 font-semibold text-ink">{row.size}</td>
                        <td className="p-4 text-ink/70">{row.bust}</td>
                        <td className="p-4 text-ink/70">{row.waist}</td>
                        <td className="p-4 text-ink/70">{row.hips}</td>
                        <td className="p-4 text-ink/70">{row.uk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink/50 text-center font-sans italic">
                * Note: Sizes can vary between specific brands and styles. This chart is intended for general reference only.
              </p>
            </TabsContent>

            <TabsContent value="mens" className="space-y-8 animate-in fade-in duration-500">
              <div className="overflow-x-auto rounded-xl border border-gold/20">
                <table className="w-full text-left font-sans text-sm">
                  <thead className="bg-ink text-white">
                    <tr>
                      <th className="p-4 font-medium">Size</th>
                      <th className="p-4 font-medium">Chest (Inches)</th>
                      <th className="p-4 font-medium">Waist (Inches)</th>
                      <th className="p-4 font-medium">Neck (Inches)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    {[
                      { size: "S", chest: "34 - 36", waist: "28 - 30", neck: "14 - 14.5" },
                      { size: "M", chest: "38 - 40", waist: "32 - 34", neck: "15 - 15.5" },
                      { size: "L", chest: "42 - 44", waist: "36 - 38", neck: "16 - 16.5" },
                      { size: "XL", chest: "46 - 48", waist: "40 - 42", neck: "17 - 17.5" },
                      { size: "XXL", chest: "50 - 52", waist: "44 - 46", neck: "18 - 18.5" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-gold/5 transition-colors">
                        <td className="p-4 font-semibold text-ink">{row.size}</td>
                        <td className="p-4 text-ink/70">{row.chest}</td>
                        <td className="p-4 text-ink/70">{row.waist}</td>
                        <td className="p-4 text-ink/70">{row.neck}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink/50 text-center font-sans italic">
                * Note: Sizes can vary between specific brands and styles. This chart is intended for general reference only.
              </p>
            </TabsContent>
          </Tabs>

        </div>
      </main>

      <Footer />
    </div>
  );
}
