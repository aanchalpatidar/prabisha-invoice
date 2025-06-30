import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { name, slug, companyName, email, phone, address, logoUrl } = data

    // Check if slug is already taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug }
    })

    if (existingOrg) {
      return NextResponse.json({ error: "Organization slug already exists" }, { status: 400 })
    }

    // Create organization and company in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name,
          slug,
          isActive: true
        }
      })

      // Create company
      const company = await tx.company.create({
        data: {
          organizationId: organization.id,
          name: companyName,
          email,
          phone,
          address,
          logoUrl
        }
      })

      // Update user to belong to this organization
      await tx.user.update({
        where: { id: session.user.id },
        data: { organizationId: organization.id }
      })

      return { organization, company }
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("POST organization error:", error)
    return NextResponse.json({ error: `Failed to create organization: ${error.message}` }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId! },
      include: {
        company: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            lastLoginAt: true
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error: any) {
    console.error("GET organization error:", error)
    return NextResponse.json({ error: `Failed to fetch organization: ${error.message}` }, { status: 500 })
  }
} 