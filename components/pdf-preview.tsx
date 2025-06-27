"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingButton } from "@/components/loading-button"
import { InvoiceTemplate1 } from "@/components/templates/invoice-template-1"
import { InvoiceTemplate2 } from "@/components/templates/invoice-template-2"
import { InvoiceTemplate3 } from "@/components/templates/invoice-template-3"
import { InvoiceTemplate4 } from "@/components/templates/invoice-template-4"
import { InvoiceTemplate5 } from "@/components/templates/invoice-template-5"
import { Download, X } from "lucide-react"
import { generatePDF } from "@/lib/pdf-generator"
import { toast } from "sonner"

interface PDFPreviewProps {
  type: "invoice" | "quotation"
  data: any
  onClose: () => void
  onDownload: () => void
}

export function PDFPreview({ type, data, onClose, onDownload }: PDFPreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("template1")
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setDownloading(true)
      await generatePDF(data, selectedTemplate, type)
      onDownload()
      toast.success("PDF downloaded successfully")
    } catch (error) {
      toast.error("Failed to generate PDF")
    } finally {
      setDownloading(false)
    }
  }

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case "template1":
        return <InvoiceTemplate1 data={data} type={type} />
      case "template2":
        return <InvoiceTemplate2 data={data} type={type} />
      case "template3":
        return <InvoiceTemplate3 data={data} type={type} />
      case "template4":
        return <InvoiceTemplate4 data={data} type={type} />
      case "template5":
        return <InvoiceTemplate5 data={data} type={type} />
      default:
        return <InvoiceTemplate1 data={data} type={type} />
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>PDF Preview - {type === "invoice" ? "Invoice" : "Quotation"}</DialogTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template1">Template 1</SelectItem>
                  <SelectItem value="template2">Template 2</SelectItem>
                  <SelectItem value="template3">Template 3</SelectItem>
                  <SelectItem value="template4">Template 4</SelectItem>
                  <SelectItem value="template5">Template 5</SelectItem>
                </SelectContent>
              </Select>
              <LoadingButton onClick={handleDownload} loading={downloading}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </LoadingButton>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          <div className="bg-white p-8 shadow-lg" style={{ minHeight: "297mm", width: "210mm", margin: "0 auto" }}>
            {renderTemplate()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}