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

    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform the data to include user count
    const rolesWithUserCount = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isDefault: role.isDefault,
      isSystem: role.isSystem,
      userCount: role._count.users,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    }))

    return NextResponse.json(rolesWithUserCount)
  } catch (error: any) {
    console.error("GET roles error:", error)
    return NextResponse.json({ error: `Failed to fetch roles: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { name, description, permissions } = data

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    })

    if (existingRole) {
      return NextResponse.json({ error: "Role with this name already exists" }, { status: 400 })
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions,
        isSystem: false,
        isDefault: false
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    return NextResponse.json({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isDefault: role.isDefault,
      isSystem: role.isSystem,
      userCount: role._count.users,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    })
  } catch (error: any) {
    console.error("POST role error:", error)
    return NextResponse.json({ error: `Failed to create role: ${error.message}` }, { status: 500 })
  }
} 