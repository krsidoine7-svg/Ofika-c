'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface ScrollRevealProps {
    children: ReactNode
    width?: "fit-content" | "100%"
    direction?: "up" | "down" | "left" | "right" | "none"
    delay?: number
    duration?: number
    className?: string
    id?: string
}

export const ScrollReveal = ({
    children,
    width = "100%",
    direction = "up",
    delay = 0.2,
    duration = 0.6,
    className,
    id
}: ScrollRevealProps) => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    const getVariants = () => {
        const variants = {
            hidden: {
                opacity: 0,
                y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
                x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
            },
            visible: {
                opacity: 1,
                y: 0,
                x: 0,
            },
        }
        return variants
    }

    return (
        <div ref={ref} style={{ position: "relative", width, overflow: "visible" }} className={className} id={id}>
            <motion.div
                variants={getVariants()}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration, delay, ease: "easeOut" }}
                className={className?.includes('h-full') ? 'h-full flex flex-col' : ''}
            >
                {children}
            </motion.div>
        </div>
    )
}
