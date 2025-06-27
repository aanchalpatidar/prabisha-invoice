import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendInvoiceEmail } from "@/lib/email"
import { generatePDF } from "@/lib/pdf-generator"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("=== ENTERED SEND INVOICE API ROUTE ===");
  let includePdf = true;
  let template = "template1";
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // If body is empty, use defaults
      body = {};
    }
    includePdf = body.includePdf ?? true;
    template = body.template ?? "template1";
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        customer: true,
        lineItems: true,
      },
    })
    console.log("Fetched invoice:", invoice);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Log invoice data for debugging
    console.log("Invoice data for email:", JSON.stringify(invoice, null, 2));

    let pdfBuffer = null;
    
    // Generate PDF if requested
    if (includePdf) {
      try {
        // This needs to be run on client-side, so we'll just prepare for it
        // In a real implementation, you would use a server-side PDF generation service
        console.log("PDF generation would happen here in a server environment");
        // pdfBuffer = await generatePDF(invoice, template, "invoice", true);
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        // Continue without PDF if generation fails
      }
    }

    // Send email with optional PDF attachment
    await sendInvoiceEmail(invoice, pdfBuffer)

    // Update invoice status to SENT
    await prisma.invoice.update({
      where: { id: params.id },
      data: { status: "SENT" },
    })

    return NextResponse.json({ 
      success: true, 
      message: "Invoice sent successfully",
      pdfIncluded: !!pdfBuffer
    })
  } catch (error: any) {
    // Log full error and stack for debugging
    console.error("Error sending invoice:", error, error?.stack);
    return NextResponse.json({ 
      error: "Failed to send invoice", 
      message: error.message 
    }, { status: 500 })
  }
}
