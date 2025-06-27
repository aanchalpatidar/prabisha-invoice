import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateQuotationNumber } from "@/lib/utils"

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(quotations)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { customerId, issueDate, validUntil, currency, subtotal, taxAmount, total, notes, lineItems } = data

    const quotationNumber = generateQuotationNumber()

    // Get company for the quotation
    const company = await prisma.company.findFirst()
    if (!company) {
      return NextResponse.json({ error: "Company not found. Please set up company details first." }, { status: 400 })
    }

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        companyId: company.id,
        customerId,
        issueDate: new Date(issueDate),
        validUntil: new Date(validUntil),
        currency,
        subtotal,
        taxAmount,
        total,
        notes,
        lineItems: {
          create: lineItems.map((item: any) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            taxRate: item.taxRate,
            total: item.quantity * item.price,
          })),
        },
      },
      include: {
        customer: true,
        lineItems: true,
      },
    })

    return NextResponse.json(quotation)
  } catch (error) {
    console.error("Error creating quotation:", error)
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 })
  }
}
