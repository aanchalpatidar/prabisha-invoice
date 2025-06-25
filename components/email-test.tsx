"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LoadingButton } from "@/components/loading-button"
import { Mail, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

export function EmailTest() {
  const [testing, setTesting] = useState(false)
  const [sending, setSending] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [testEmail, setTestEmail] = useState("")
  const [testSubject, setTestSubject] = useState("Test Email from Invoice Generator")
  const [testMessage, setTestMessage] = useState("This is a test email to verify email configuration.")

  const testConnection = async () => {
    try {
      setTesting(true)
      const response = await fetch("/api/test-email")
      const result = await response.json()
      setTestResult(result)

      if (result.success) {
        toast.success("Email configuration test passed!")
      } else {
        toast.error("Email configuration test failed!")
      }
    } catch (error) {
      setTestResult({ success: false, message: "Failed to test email configuration" })
      toast.error("Failed to test email configuration")
    } finally {
      setTesting(false)
    }
  }

  const sendTestEmail = async () => {
    try {
      setSending(true)
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          subject: testSubject,
          message: testMessage,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Test email sent successfully!")
      } else {
        toast.error(`Failed to send test email: ${result.message}`)
      }
    } catch (error) {
      toast.error("Failed to send test email")
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Configuration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Test */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Test SMTP Connection</h3>
              <p className="text-sm text-gray-600">Verify your email server connection</p>
            </div>
            <LoadingButton onClick={testConnection} loading={testing} variant="outline">
              Test Connection
            </LoadingButton>
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {testResult.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Send Test Email</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">To Email (leave empty to send to yourself)</label>
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input value={testSubject} onChange={(e) => setTestSubject(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea value={testMessage} onChange={(e) => setTestMessage(e.target.value)} rows={3} />
            </div>

            <LoadingButton onClick={sendTestEmail} loading={sending} className="w-full">
              Send Test Email
            </LoadingButton>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Email Configuration Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• For cPanel hosting, use: mail.yourdomain.com</li>
            <li>• Port 587 for STARTTLS, Port 465 for SSL</li>
            <li>• Make sure your email password is correct</li>
            <li>• Check if your hosting provider requires specific settings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
