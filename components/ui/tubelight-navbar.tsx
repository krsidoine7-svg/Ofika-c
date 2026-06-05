"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
}

interface TubelightNavbarProps {
  items: NavItem[];
  className?: string;
  logo?: React.ReactNode;
  onItemClick?: (item: NavItem) => void;
  activeItem?: string;
  variant?: "default" | "minimal" | "glass";
  size?: "sm" | "md" | "lg";
}

export function TubelightNavbar({
  items,
  className,
  logo,
  onItemClick,
  activeItem,
  variant = "default",
  size = "md",
}: TubelightNavbarProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (activeItem) {
      const index = items.findIndex(item => item.href === activeItem);
      if (index !== -1) {
        setActiveIndex(index);
      }
    }
  }, [activeItem, items]);

  const handleItemClick = (item: NavItem, index: number) => {
    setActiveIndex(index);
    setIsMobileMenuOpen(false);
    onItemClick?.(item);
  };

  const sizeClasses = {
    sm: "h-12 px-4",
    md: "h-16 px-6",
    lg: "h-20 px-8",
  };

  const variantClasses = {
    default: "bg-background border-b border-border",
    minimal: "bg-transparent",
    glass: "bg-background/80 backdrop-blur-md border-b border-border/50",
  };

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", variantClasses[variant], className)}>
      <div className={cn("container mx-auto flex items-center justify-between", sizeClasses[size])}>
        {/* Logo */}
        <div className="flex items-center space-x-2">
          {logo}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {items.map((item, index) => (
            <NavItem
              key={item.href}
              item={item}
              index={index}
              isActive={index === activeIndex}
              onClick={() => handleItemClick(item, index)}
              size={size}
            />
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-6 py-4">
              <div className="flex flex-col space-y-2">
                {items.map((item, index) => (
                  <MobileNavItem
                    key={item.href}
                    item={item}
                    index={index}
                    isActive={index === activeIndex}
                    onClick={() => handleItemClick(item, index)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

interface NavItemProps {
  item: NavItem;
  index: number;
  isActive: boolean;
  onClick: () => void;
  size: "sm" | "md" | "lg";
}

function NavItem({ item, index, isActive, onClick, size }: NavItemProps) {
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <div className="relative">
      <button
        className={cn(
          "relative px-4 py-2 rounded-md transition-all duration-300 font-medium",
          sizeClasses[size],
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={onClick}
      >
        <span className="relative z-10 flex items-center space-x-2">
          {item.icon && <item.icon className="h-4 w-4" />}
          <span>{item.label}</span>
        </span>
        
        {/* Tubelight Effect */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-md"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(var(--primary), 0.3), transparent)",
                boxShadow: "0 0 20px rgba(var(--primary), 0.5)",
              }}
            />
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

interface MobileNavItemProps {
  item: NavItem;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function MobileNavItem({ item, index, isActive, onClick }: MobileNavItemProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-300 text-left w-full",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
      onClick={onClick}
    >
      {item.icon && <item.icon className="h-5 w-5" />}
      <span className="font-medium">{item.label}</span>
    </motion.button>
  );
}

interface TubelightButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function TubelightButton({
  children,
  onClick,
  className,
  variant = "default",
  size = "md",
  disabled = false,
}: TubelightButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <motion.button
      className={cn(
        "relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">{children}</span>
      
      {/* Tubelight Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-md opacity-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(var(--primary), 0.3), transparent)",
          boxShadow: "0 0 20px rgba(var(--primary), 0.5)",
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
