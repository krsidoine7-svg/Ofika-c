"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function LogoutButton({ 
  variant = "outline", 
  size = "sm", 
  className 
}: LogoutButtonProps) {
  const { signOut } = useAuth()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleLogout = async () => {
    if (!isOnline) {
      toast.warning("La déconnexion est indisponible en mode hors-ligne pour protéger votre session.")
      return
    }
    try {
      await signOut()
      toast.success("Déconnexion réussie")
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Erreur lors de la déconnexion")
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={!isOnline}
      title={!isOnline ? "La déconnexion est désactivée en mode hors-ligne" : undefined}
      className={`${className || ''} ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Se déconnecter
    </Button>
  )
}
