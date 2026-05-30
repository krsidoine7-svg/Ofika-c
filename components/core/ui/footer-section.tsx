"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Github,
  ArrowRight,
  ExternalLink
} from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  icon: React.ComponentType<any>;
  href: string;
  label: string;
}

interface FooterSectionProps {
  className?: string;
  logo?: React.ReactNode;
  description?: string;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  copyright?: string;
  variant?: "default" | "minimal" | "dark";
}

export function FooterSection({
  className,
  logo,
  description,
  sections = [],
  socialLinks = [],
  contactInfo,
  copyright,
  variant = "default",
}: FooterSectionProps) {
  const variantClasses = {
    default: "bg-background border-t border-border",
    minimal: "bg-muted/30",
    dark: "bg-slate-900 text-slate-100",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <footer className={cn("w-full", variantClasses[variant], className)}>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Logo and Description */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              {logo}
            </div>
            {description && (
              <p className="text-muted-foreground mb-6 max-w-sm">
                {description}
              </p>
            )}
            
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md hover:bg-accent transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Footer Sections */}
          {sections.map((section, index) => (
            <motion.div key={index} variants={itemVariants}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Info */}
          {contactInfo && (
            <motion.div variants={itemVariants}>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <div className="space-y-3">
                {contactInfo.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                )}
                {contactInfo.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                )}
                {contactInfo.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">
                      {contactInfo.address}
                    </span>
                  </div>
                )}
                {contactInfo.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                    >
                      <span>Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span>{copyright || `© ${new Date().getFullYear()} All rights reserved.`}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="h-4 w-4 text-red-500 fill-current" />
            </motion.div>
            <span>by your team</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

interface FooterLinkProps {
  link: FooterLink;
}

function FooterLink({ link }: FooterLinkProps) {
  return (
    <motion.a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noopener noreferrer" : undefined}
      className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 group"
      whileHover={{ x: 5 }}
    >
      <span>{link.label}</span>
      {link.external && (
        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.a>
  );
}

interface NewsletterSignupProps {
  className?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  onSubmit?: (email: string) => void;
}

export function NewsletterSignup({
  className,
  title = "Stay Updated",
  description = "Subscribe to our newsletter for the latest updates and news.",
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  onSubmit,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email);
    setEmail("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("bg-muted/50 rounded-lg p-6", className)}
    >
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          required
        />
        <motion.button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{buttonText}</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </form>
    </motion.div>
  );
}

// Composant de footer simple pour les cas d'usage basiques
interface SimpleFooterProps {
  className?: string;
  logo?: React.ReactNode;
  links?: FooterLink[];
  socialLinks?: SocialLink[];
  copyright?: string;
}

export function SimpleFooter({
  className,
  logo,
  links = [],
  socialLinks = [],
  copyright,
}: SimpleFooterProps) {
  return (
    <footer className={cn("bg-background border-t border-border", className)}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            {logo}
          </div>
          
          <div className="flex items-center space-x-6">
            {links.map((link, index) => (
              <FooterLink key={index} link={link} />
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
        </div>
        
        <div className="border-t border-border mt-6 pt-6 text-center text-muted-foreground">
          <span>{copyright || `© ${new Date().getFullYear()} All rights reserved.`}</span>
        </div>
      </div>
    </footer>
  );
}
