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

    console.log("Company API - User ID:", session.user.id)
    console.log("Company API - Organization ID:", session.user.organizationId)

    // First try to find user-specific company
    let company = await prisma.company.findUnique({
      where: { userId: session.user.id }
    })

    // If no user-specific company, try to find organization-shared company
    if (!company && session.user.organizationId) {
      company = await prisma.company.findFirst({
        where: { 
          organizationId: session.user.organizationId,
          isShared: true
        }
      })
    }

    console.log("Company API - Found company:", company?.name || "No company found")

    return NextResponse.json(company || null)
  } catch (error: any) {
    console.error("GET company error:", error)
    return NextResponse.json({ error: `Failed to fetch company: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { isShared = false, ...companyData } = data

    // Check if user already has a company
    const existingUserCompany = await prisma.company.findUnique({
      where: { userId: session.user.id }
    })

    if (existingUserCompany) {
      return NextResponse.json({ error: "User already has a company" }, { status: 400 })
    }

    // If creating shared company, check if organization already has one
    if (isShared && session.user.organizationId) {
      const existingOrgCompany = await prisma.company.findFirst({
        where: { 
          organizationId: session.user.organizationId,
          isShared: true
        }
      })

      if (existingOrgCompany) {
        return NextResponse.json({ error: "Organization already has a shared company" }, { status: 400 })
      }
    }

    const company = await prisma.company.create({
      data: {
        ...companyData,
        userId: isShared ? null : session.user.id,
        organizationId: isShared ? session.user.organizationId : null,
        isShared
      },
    })

    return NextResponse.json(company)
  } catch (error: any) {
    console.error("POST company error:", error)
    return NextResponse.json({ error: `Failed to create company: ${error.message}` }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // First try to find user-specific company
    let existingCompany = await prisma.company.findUnique({
      where: { userId: session.user.id }
    })

    // If no user-specific company, try to find organization-shared company
    if (!existingCompany && session.user.organizationId) {
      existingCompany = await prisma.company.findFirst({
        where: { 
          organizationId: session.user.organizationId,
          isShared: true
        }
      })
    }

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const company = await prisma.company.update({
      where: { id: existingCompany.id },
      data,
    })

    return NextResponse.json(company)
  } catch (error: any) {
    console.error("PUT company error:", error)
    return NextResponse.json({ error: `Failed to update company: ${error.message}` }, { status: 500 })
  }
}
