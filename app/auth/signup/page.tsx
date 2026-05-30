import { SignupForm } from "@/components/core/auth/SignupForm"
import { Suspense } from "react"

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
