import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      where: { organizationId: session.user.organizationId! },
      include: {
        company: true,
        customer: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lineItems: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(invoices)
  } catch (error: any) {
    console.error("GET invoices error:", error)
    return NextResponse.json({ error: `Failed to fetch invoices: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { lineItems, ...invoiceData } = data

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { organizationId: session.user.organizationId! },
      orderBy: { invoiceNumber: 'desc' }
    })

    const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.replace('INV-', '')) : 0
    const nextNumber = lastNumber + 1
    const invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`

    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        organizationId: session.user.organizationId!,
        createdById: session.user.id,
        invoiceNumber,
        lineItems: {
          create: lineItems.map((item: any) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            taxRate: item.taxRate,
            total: item.quantity * item.price
          }))
        }
      },
      include: {
        company: true,
        customer: true,
        lineItems: true,
      }
    })

    return NextResponse.json(invoice)
  } catch (error: any) {
    console.error("POST invoice error:", error)
    return NextResponse.json({ error: `Failed to create invoice: ${error.message}` }, { status: 500 })
  }
}
