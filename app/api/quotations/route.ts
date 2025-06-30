import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateQuotationNumber } from "@/lib/utils"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quotations = await prisma.quotation.findMany({
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

    return NextResponse.json(quotations)
  } catch (error: any) {
    console.error("GET quotations error:", error)
    return NextResponse.json({ error: `Failed to fetch quotations: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { lineItems, ...quotationData } = data

    // Generate quotation number
    const lastQuotation = await prisma.quotation.findFirst({
      where: { organizationId: session.user.organizationId! },
      orderBy: { quotationNumber: 'desc' }
    })

    const lastNumber = lastQuotation ? parseInt(lastQuotation.quotationNumber.replace('QUO-', '')) : 0
    const nextNumber = lastNumber + 1
    const quotationNumber = `QUO-${nextNumber.toString().padStart(4, '0')}`

    const quotation = await prisma.quotation.create({
      data: {
        ...quotationData,
        organizationId: session.user.organizationId!,
        createdById: session.user.id,
        quotationNumber,
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

    return NextResponse.json(quotation)
  } catch (error: any) {
    console.error("POST quotation error:", error)
    return NextResponse.json({ error: `Failed to create quotation: ${error.message}` }, { status: 500 })
  }
}
