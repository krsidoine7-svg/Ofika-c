"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function TextReveal({
  text,
  className,
  delay = 0,
  duration = 0.5,
  direction = "up",
}: TextRevealProps) {
  const directionVariants = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: 20, opacity: 0 },
    right: { x: -20, opacity: 0 },
  };

  const animateTo = {
    up: { y: 0, opacity: 1 },
    down: { y: 0, opacity: 1 },
    left: { x: 0, opacity: 1 },
    right: { x: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial={directionVariants[direction]}
      animate={animateTo[direction]}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={cn("inline-block", className)}
    >
      {text}
    </motion.div>
  );
}

interface TextRevealByWordsProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  stagger?: number;
}

export function TextRevealByWords({
  text,
  className,
  delay = 0,
  duration = 0.5,
  direction = "up",
  stagger = 0.1,
}: TextRevealByWordsProps) {
  const words = text.split(" ");

  const directionVariants = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: 20, opacity: 0 },
    right: { x: -20, opacity: 0 },
  };

  const animateTo = {
    up: { y: 0, opacity: 1 },
    down: { y: 0, opacity: 1 },
    left: { x: 0, opacity: 1 },
    right: { x: 0, opacity: 1 },
  };

  return (
    <div className={cn("inline-block", className)}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={directionVariants[direction]}
          animate={animateTo[direction]}
          transition={{
            duration,
            delay: delay + index * stagger,
            ease: "easeOut",
          }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

interface TextRevealByCharactersProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  stagger?: number;
}

export function TextRevealByCharacters({
  text,
  className,
  delay = 0,
  duration = 0.5,
  direction = "up",
  stagger = 0.05,
}: TextRevealByCharactersProps) {
  const characters = text.split("");

  const directionVariants = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: 20, opacity: 0 },
    right: { x: -20, opacity: 0 },
  };

  const animateTo = {
    up: { y: 0, opacity: 1 },
    down: { y: 0, opacity: 1 },
    left: { x: 0, opacity: 1 },
    right: { x: 0, opacity: 1 },
  };

  return (
    <div className={cn("inline-block", className)}>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={directionVariants[direction]}
          animate={animateTo[direction]}
          transition={{
            duration,
            delay: delay + index * stagger,
            ease: "easeOut",
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
}
