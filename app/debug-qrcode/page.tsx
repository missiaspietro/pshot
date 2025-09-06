import { DebugQRCode } from "@/components/debug-qrcode"

export default function DebugQRCodePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Debug QR Code</h1>
      <DebugQRCode />
    </div>
  )
}