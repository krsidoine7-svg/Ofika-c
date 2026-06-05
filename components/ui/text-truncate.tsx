"use client"

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TextTruncateProps {
  children: React.ReactNode
  lines?: number
  className?: string
  title?: string
}

export function TextTruncate({ 
  children, 
  lines = 1, 
  className,
  title 
}: TextTruncateProps) {
  const [isTruncated, setIsTruncated] = useState(false)
  const [showFull, setShowFull] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight)
        const maxHeight = lineHeight * lines
        const actualHeight = textRef.current.scrollHeight
        
        setIsTruncated(actualHeight > maxHeight)
      }
    }

    checkTruncation()
    window.addEventListener('resize', checkTruncation)
    
    return () => window.removeEventListener('resize', checkTruncation)
  }, [lines, children])

  if (!isTruncated || showFull) {
    return (
      <div 
        ref={textRef}
        className={cn(className)}
        title={title}
      >
        {children}
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <div 
        ref={textRef}
        className="overflow-hidden"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
        }}
        title={title}
      >
        {children}
      </div>
      <button
        onClick={() => setShowFull(true)}
        className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-1"
      >
        Voir plus
      </button>
    </div>
  )
}
