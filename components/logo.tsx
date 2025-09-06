import { Sparkles } from "lucide-react"

export function Logo() {
  return (
    <div className="relative flex items-center">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
        <div className="relative flex items-center justify-center w-10 h-10 bg-white rounded-full">
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
      </div>
      <span className="ml-3 text-xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
        Praise Shot
      </span>
    </div>
  )
}
