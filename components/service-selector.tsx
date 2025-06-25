"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Package, Search, Plus } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { toast } from "sonner"

interface Service {
  id: string
  name: string
  description?: string
  price: number
  taxRate: number
}

interface ServiceSelectorProps {
  onServiceSelect: (service: Service) => void
}

export function ServiceSelector({ onServiceSelect }: ServiceSelectorProps) {
  const { formatCurrency } = useCurrency()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultServices = async () => {
    const defaultServices = [
      { name: "Web Development", description: "Custom website development", price: 1000, taxRate: 10 },
      { name: "Graphic Design", description: "Logo and branding design", price: 500, taxRate: 10 },
      { name: "SEO Optimization", description: "Search engine optimization", price: 300, taxRate: 10 },
      { name: "Content Writing", description: "Professional content creation", price: 200, taxRate: 10 },
      { name: "Social Media Management", description: "Monthly social media management", price: 400, taxRate: 10 },
    ]

    try {
      for (const service of defaultServices) {
        await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(service),
        })
      }
      fetchServices()
      toast.success("Default services created!")
    } catch (error) {
      toast.error("Failed to create default services")
    }
  }

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Quick Add Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {services.length === 0 && (
            <Button variant="outline" onClick={createDefaultServices} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Defaults
            </Button>
          )}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onServiceSelect(service)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      {service.description && <p className="text-sm text-gray-600 mt-1">{service.description}</p>}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-lg text-green-600">{formatCurrency(service.price)}</p>
                      <p className="text-sm text-gray-500">{service.taxRate}% tax</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No services found</p>
                <Button variant="outline" onClick={createDefaultServices}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Default Services
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
