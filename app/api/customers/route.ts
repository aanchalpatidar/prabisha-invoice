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

    const customers = await prisma.customer.findMany({
      where: { organizationId: session.user.organizationId! },
      include: {
        _count: {
          select: {
            invoices: true,
            quotations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(customers)
  } catch (error: any) {
    console.error("GET customers error:", error)
    return NextResponse.json({ error: `Failed to fetch customers: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const customer = await prisma.customer.create({
      data: {
        ...data,
        organizationId: session.user.organizationId!
      },
    })

    return NextResponse.json(customer)
  } catch (error: any) {
    console.error("POST customer error:", error)
    return NextResponse.json({ error: `Failed to create customer: ${error.message}` }, { status: 500 })
  }
}
