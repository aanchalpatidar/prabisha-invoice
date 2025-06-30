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

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (!currentUser?.role?.name || currentUser.role.name !== 'ADMIN') {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Delete all sessions for the specified user
    await prisma.session.deleteMany({
      where: { userId }
    })

    return NextResponse.json({ 
      message: "User sessions invalidated successfully",
      userId 
    })
  } catch (error: any) {
    console.error("Invalidate session error:", error)
    return NextResponse.json({ error: `Failed to invalidate sessions: ${error.message}` }, { status: 500 })
  }
} 