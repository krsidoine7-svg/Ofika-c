"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MultiOrbitSemiCircleProps {
  className?: string;
  size?: number;
  orbitCount?: number;
  speed?: number;
  color?: string;
}

export function MultiOrbitSemiCircle({
  className,
  size = 200,
  orbitCount = 3,
  speed = 1,
  color = "currentColor",
}: MultiOrbitSemiCircleProps) {
  const orbits = Array.from({ length: orbitCount }, (_, i) => i);

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size / 2 }}
    >
      {orbits.map((orbit) => {
        const orbitSize = size - orbit * (size / orbitCount);
        const orbitDelay = orbit * 0.2;

        return (
          <motion.div
            key={orbit}
            className="absolute inset-0 border-2 border-dashed rounded-full"
            style={{
              width: orbitSize,
              height: orbitSize,
              borderColor: color,
              borderTopColor: "transparent",
              borderRightColor: "transparent",
              borderLeftColor: "transparent",
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2 / speed,
              repeat: Infinity,
              ease: "linear",
              delay: orbitDelay,
            }}
          />
        );
      })}
      
      {/* Point central */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-3 h-3 bg-current rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

interface OrbitSemiCircleProps {
  className?: string;
  size?: number;
  speed?: number;
  color?: string;
  strokeWidth?: number;
}

export function OrbitSemiCircle({
  className,
  size = 100,
  speed = 1,
  color = "currentColor",
  strokeWidth = 2,
}: OrbitSemiCircleProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size / 2 }}
    >
      <motion.div
        className="absolute inset-0 border-2 border-dashed rounded-full"
        style={{
          width: size,
          height: size,
          borderColor: color,
          borderTopColor: "transparent",
          borderRightColor: "transparent",
          borderLeftColor: "transparent",
          borderWidth: strokeWidth,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 2 / speed,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Point central */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-2 h-2 bg-current rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

interface AnimatedOrbitProps {
  className?: string;
  size?: number;
  speed?: number;
  color?: string;
  reverse?: boolean;
}

export function AnimatedOrbit({
  className,
  size = 150,
  speed = 1,
  color = "currentColor",
  reverse = false,
}: AnimatedOrbitProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      {/* Orbite extérieure */}
      <motion.div
        className="absolute inset-0 border-2 border-dashed rounded-full"
        style={{
          width: size,
          height: size,
          borderColor: color,
          opacity: 0.6,
        }}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{
          duration: 3 / speed,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Orbite intérieure */}
      <motion.div
        className="absolute inset-4 border-2 border-dashed rounded-full"
        style={{
          width: size - 32,
          height: size - 32,
          borderColor: color,
          opacity: 0.4,
        }}
        animate={{ rotate: reverse ? 360 : -360 }}
        transition={{
          duration: 2 / speed,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Point central */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-3 h-3 bg-current rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: color }}
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
