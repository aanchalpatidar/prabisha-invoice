"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { LoadingButton } from "@/components/loading-button"
import { Shield, Plus, Edit, Trash2, Users, Lock } from "lucide-react"
import { toast } from "sonner"

interface Role {
  id: string
  name: string
  description: string
  permissions: string[] // Array of permission strings like ["invoices:read", "customers:create"]
  isDefault: boolean
  isSystem: boolean
  userCount: number
  createdAt: string
}

const PERMISSION_RESOURCES = [
  {
    name: "Dashboard",
    key: "dashboard",
    description: "Access to dashboard and overview"
  },
  {
    name: "Invoices",
    key: "invoices",
    description: "Manage invoices"
  },
  {
    name: "Quotations",
    key: "quotations",
    description: "Manage quotations"
  },
  {
    name: "Customers",
    key: "customers",
    description: "Manage customers"
  },
  {
    name: "Services",
    key: "services",
    description: "Manage services"
  },
  {
    name: "Company",
    key: "company",
    description: "Manage company settings"
  },
  {
    name: "Reports",
    key: "reports",
    description: "Access to reports and analytics"
  },
  {
    name: "Users",
    key: "users",
    description: "Manage users (Admin only)"
  },
  {
    name: "Roles",
    key: "roles",
    description: "Manage roles (Admin only)"
  }
]

const PERMISSION_ACTIONS = [
  { key: "read", label: "View" },
  { key: "create", label: "Create" },
  { key: "update", label: "Edit" },
  { key: "delete", label: "Delete" }
]

export default function AdminRolesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: {} as Record<string, string[]>
  })

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      toast.error("Failed to fetch roles")
    } finally {
      setLoading(false)
    }
  }

  const initializeForm = (role?: Role) => {
    if (role) {
      // Convert permissions back to form format
      const permissionsObj: Record<string, string[]> = {}
      
      if (Array.isArray(role.permissions)) {
        // Check if it's the admin case with ['*']
        if (role.permissions.length === 1 && role.permissions[0] === '*') {
          // Set all permissions for admin
          PERMISSION_RESOURCES.forEach(resource => {
            permissionsObj[resource.key] = PERMISSION_ACTIONS.map(action => action.key);
          });
        } else {
          role.permissions.forEach(perm => {
            if (typeof perm === 'string' && perm.includes(':')) {
              const [resource, action] = perm.split(':')
              if (resource && action) {
                if (!permissionsObj[resource]) {
                  permissionsObj[resource] = []
                }
                permissionsObj[resource].push(action)
              }
            } else if (typeof perm === 'object' && perm !== null) {
              // Handle object format: { resource: string, actions: string[] }
              if ('resource' in perm && 'actions' in perm && Array.isArray(perm.actions)) {
                if (!permissionsObj[perm.resource]) {
                  permissionsObj[perm.resource] = []
                }
                permissionsObj[perm.resource].push(...perm.actions)
              }
            }
          })
        }
      }

      setFormData({
        name: role.name,
        description: role.description,
        permissions: permissionsObj
      })
      setEditingRole(role)
    } else {
      setFormData({
        name: "",
        description: "",
        permissions: {}
      })
      setEditingRole(null)
    }
  }

  const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
    setFormData(prev => {
      const currentActions = prev.permissions[resource] || []
      const newActions = checked
        ? [...currentActions, action]
        : currentActions.filter(a => a !== action)
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [resource]: newActions
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Convert permissions object to array format
      const permissionsArray = Object.entries(formData.permissions)
        .filter(([_, actions]) => actions.length > 0)
        .map(([resource, actions]) => ({
          resource,
          actions
        }))

      const payload = {
        name: formData.name,
        description: formData.description,
        permissions: permissionsArray
      }

      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles"
      const method = editingRole ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      const result = await response.json()
      
      if (editingRole) {
        setRoles(prev => prev.map(role => role.id === editingRole.id ? result : role))
        toast.success("Role updated successfully")
      } else {
        setRoles(prev => [result, ...prev])
        toast.success("Role created successfully")
      }

      setDialogOpen(false)
      initializeForm()
    } catch (error: any) {
      toast.error(error.message || "Failed to save role")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setRoles(prev => prev.filter(role => role.id !== roleId))
        toast.success("Role deleted successfully")
      }
    } catch (error) {
      toast.error("Failed to delete role")
    }
  }

  const getPermissionLabel = (resource: string) => {
    return PERMISSION_RESOURCES.find(r => r.key === resource)?.name || resource
  }

  if (!session?.user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage user roles and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles
              </CardTitle>
              <CardDescription>
                Define roles and their permissions
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => initializeForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
                  <DialogDescription>
                    Define role permissions and access levels
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Role Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter role name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter role description"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Permissions</Label>
                    <div className="border rounded-lg p-4 space-y-4">
                      {PERMISSION_RESOURCES.map((resource) => (
                        <div key={resource.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{resource.name}</h4>
                              <p className="text-sm text-gray-500">{resource.description}</p>
                            </div>
                            <div className="flex gap-4">
                              {PERMISSION_ACTIONS.map((action) => (
                                <div key={action.key} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${resource.key}-${action.key}`}
                                    checked={formData.permissions[resource.key]?.includes(action.key) || false}
                                    onCheckedChange={(checked) => 
                                      handlePermissionChange(resource.key, action.key, checked as boolean)
                                    }
                                  />
                                  <Label htmlFor={`${resource.key}-${action.key}`} className="text-sm">
                                    {action.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <LoadingButton type="submit" loading={saving}>
                      {editingRole ? "Update Role" : "Create Role"}
                    </LoadingButton>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading roles...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {role.name}
                        {role.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        {role.isSystem && (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          // Handle different permission formats
                          let permissionsArray: string[] = [];
                          
                          if (Array.isArray(role.permissions)) {
                            // Check if it's the admin case with ['*']
                            if (role.permissions.length === 1 && role.permissions[0] === '*') {
                              return (
                                <Badge variant="outline" className="text-xs">
                                  All Permissions
                                </Badge>
                              );
                            }
                            
                            permissionsArray = role.permissions.map(perm => {
                              if (typeof perm === 'string') {
                                return perm;
                              } else if (typeof perm === 'object' && perm !== null) {
                                // Handle object format: { resource: string, actions: string[] }
                                if ('resource' in perm && 'actions' in perm && Array.isArray(perm.actions)) {
                                  return perm.actions.map(action => `${perm.resource}:${action}`).join(',');
                                }
                              }
                              return '';
                            }).filter(Boolean);
                          }
                          
                          // Group permissions by resource
                          const groupedPerms: Record<string, string[]> = {}
                          permissionsArray.forEach(perm => {
                            if (typeof perm === 'string' && perm.includes(':')) {
                              const [resource, action] = perm.split(':')
                              if (resource && action) {
                                if (!groupedPerms[resource]) {
                                  groupedPerms[resource] = []
                                }
                                groupedPerms[resource].push(action)
                              }
                            }
                          })

                          return Object.entries(groupedPerms).map(([resource, actions], index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {getPermissionLabel(resource)}: {actions.join(", ")}
                            </Badge>
                          ))
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {role.userCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      {role.isSystem ? (
                        <Badge variant="secondary">System</Badge>
                      ) : (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            initializeForm(role)
                            setDialogOpen(true)
                          }}
                          disabled={role.isSystem}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!role.isSystem && role.userCount === 0 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 