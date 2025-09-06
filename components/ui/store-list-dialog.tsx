"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface StoreListDialogProps {
  isOpen: boolean
  onClose: () => void
  storeData: Array<{
    loja: string
    quantidade: number
    percentage: string
    color: string
  }>
  total: number
}

export function StoreListDialog({ isOpen, onClose, storeData, total }: StoreListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby="store-list-description">
        <DialogHeader>
          <DialogTitle className="text-center">Números Inválidos por Loja</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-3 p-2">
            {storeData.map((item, index) => (
              <div 
                key={`store-${index}`} 
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 shadow-sm"
              >
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.loja}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold">{item.quantidade}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-center">
          <div id="store-list-description" className="text-sm text-gray-500">Total: {total} números inválidos</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
