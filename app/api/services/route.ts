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

    const services = await prisma.service.findMany({
      where: { organizationId: session.user.organizationId! },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(services)
  } catch (error: any) {
    console.error("GET services error:", error)
    return NextResponse.json({ error: `Failed to fetch services: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const service = await prisma.service.create({
      data: {
        ...data,
        organizationId: session.user.organizationId!
      },
    })

    return NextResponse.json(service)
  } catch (error: any) {
    console.error("POST service error:", error)
    return NextResponse.json({ error: `Failed to create service: ${error.message}` }, { status: 500 })
  }
}
