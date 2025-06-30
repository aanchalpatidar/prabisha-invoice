import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user with organization
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    })

    if (!currentUser?.organizationId) {
      return NextResponse.json({ error: "User not associated with any organization" }, { status: 400 })
    }

    // Get or create system settings for the organization
    let settings = await prisma.systemSettings.findUnique({
      where: { organizationId: currentUser.organizationId }
    })

    if (!settings) {
      // Create default settings
      settings = await prisma.systemSettings.create({
        data: {
          organizationId: currentUser.organizationId,
          siteTitle: "Prabisha Invoice",
          siteDescription: "Professional invoice and quotation management system",
          faviconUrl: "https://prabisha.com/wp-content/uploads/2023/10/Favicon-2.png",
          primaryColor: "#2563eb",
          secondaryColor: "#10b981"
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error("GET system settings error:", error)
    return NextResponse.json({ error: `Failed to fetch system settings: ${error.message}` }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (!currentUser?.role?.name || currentUser.role.name !== 'ADMIN') {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const data = await request.json()
    const {
      siteTitle,
      siteDescription,
      faviconUrl,
      primaryColor,
      secondaryColor,
      logoUrl,
      contactEmail,
      contactPhone,
      address,
      footerText
    } = data

    // Get or create system settings
    let settings = await prisma.systemSettings.findUnique({
      where: { organizationId: currentUser.organizationId! }
    })

    if (settings) {
      // Update existing settings
      settings = await prisma.systemSettings.update({
        where: { organizationId: currentUser.organizationId! },
        data: {
          siteTitle,
          siteDescription,
          faviconUrl,
          primaryColor,
          secondaryColor,
          logoUrl,
          contactEmail,
          contactPhone,
          address,
          footerText
        }
      })
    } else {
      // Create new settings
      settings = await prisma.systemSettings.create({
        data: {
          organizationId: currentUser.organizationId!,
          siteTitle,
          siteDescription,
          faviconUrl,
          primaryColor,
          secondaryColor,
          logoUrl,
          contactEmail,
          contactPhone,
          address,
          footerText
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error("PUT system settings error:", error)
    return NextResponse.json({ error: `Failed to update system settings: ${error.message}` }, { status: 500 })
  }
} 