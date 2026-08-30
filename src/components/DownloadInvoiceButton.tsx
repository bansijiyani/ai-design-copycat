"use client";

import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/api/settings.functions";

export function DownloadInvoiceButton({ order, className = "" }: { order: any, className?: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: () => getSettings(),
  });

  const generatePDF = () => {
    try {
      setIsGenerating(true);
      const doc = new jsPDF();
      
      const storeName = settings?.store_name || "FizTopz";
      const storeAddress = settings?.store_address || "123 Fashion Street, Mumbai, India";
      const storeEmail = settings?.store_email || "support@fiztopz.com";
      const storePhone = settings?.store_phone || "+91 9876543210";

      // Header
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(storeName, 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(storeAddress, 14, 28);
      doc.text(`Email: ${storeEmail}`, 14, 33);
      doc.text(`Phone: ${storePhone}`, 14, 38);

      // Invoice Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", 150, 25);

      // Order Details
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Order ID: #${order.id.slice(0, 8).toUpperCase()}`, 130, 35);
      doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 130, 40);
      doc.text(`Status: ${order.status.toUpperCase()}`, 130, 45);

      // Customer Details
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Bill To:", 14, 55);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      // We assume user profile name is available in order.profiles or we use shipping address
      const customerName = order.profiles?.full_name || order.shipping_address?.split(",")[0] || "Customer";
      doc.text(customerName, 14, 62);
      
      const addressLines = doc.splitTextToSize(order.shipping_address || "No address provided", 80);
      doc.text(addressLines, 14, 67);

      // Items Table
      const tableColumn = ["Item", "Unit Price", "Qty", "Total"];
      const tableRows: any[] = [];

      let subtotal = 0;
      order.order_items?.forEach((item: any) => {
        const itemTotal = Number(item.price) * Number(item.quantity);
        subtotal += itemTotal;
        tableRows.push([
          item.product_name,
          `Rs. ${Number(item.price).toFixed(2)}`,
          item.quantity,
          `Rs. ${itemTotal.toFixed(2)}`
        ]);
      });

      autoTable(doc, {
        startY: 85,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [114, 47, 55] }, // Maroon header
        styles: { fontSize: 10, cellPadding: 5 },
      });

      // Totals
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.setFont("helvetica", "bold");
      doc.text("Total Amount:", 130, finalY + 15);
      doc.text(`Rs. ${Number(order.total).toFixed(2)}`, 170, finalY + 15);

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("Thank you for shopping with us!", 105, finalY + 40, { align: "center" });

      doc.save(`Invoice_${storeName}_${order.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
      toast.error("Failed to generate invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={`flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-semibold rounded-sm hover:bg-foreground/90 disabled:opacity-50 transition ${className}`}
    >
      <Download className="w-4 h-4" />
      {isGenerating ? "Generating..." : "Download Invoice"}
    </button>
  );
}
