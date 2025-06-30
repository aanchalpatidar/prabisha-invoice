"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingButton } from "@/components/loading-button"
import { Building, Upload } from "lucide-react"
import { toast } from "sonner"

interface OrganizationData {
  name: string
  slug: string
  companyName: string
  email: string
  phone: string
  address: string
  logoUrl?: string
}

export default function OrganizationSetupPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [formData, setFormData] = useState<OrganizationData>({
    name: "",
    slug: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
  })

  const handleInputChange = (field: keyof OrganizationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from organization name
    if (field === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLogoUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()
      setFormData(prev => ({ ...prev, logoUrl: url }))
      toast.success("Logo uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload logo")
    } finally {
      setLogoUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create organization")

      const result = await response.json()
      
      // Update session with organization info
      await update({
        ...session,
        user: {
          ...session?.user,
          organizationId: result.organization.id,
          organization: result.organization
        }
      })

      toast.success("Organization created successfully!")
      router.push("/company")
    } catch (error) {
      toast.error("Failed to create organization")
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Building className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold">Set Up Your Organization</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create your organization and get started with invoice management
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Enter your organization information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter organization name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Organization Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="organization-slug"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    This will be used in URLs and cannot be changed later
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter company email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter company phone"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter company address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Company Logo (Optional)</Label>
                <div className="flex items-center gap-4">
                  {formData.logoUrl && (
                    <img
                      src={formData.logoUrl}
                      alt="Company logo"
                      className="h-16 w-16 rounded object-contain border"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo-upload")?.click()}
                      disabled={logoUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {logoUploading ? "Uploading..." : "Upload Logo"}
                    </Button>
                  </div>
                </div>
              </div>

              <LoadingButton type="submit" loading={loading} className="w-full">
                Create Organization
              </LoadingButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 