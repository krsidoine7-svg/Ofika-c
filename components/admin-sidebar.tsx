"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Users, CreditCard, Settings, BarChart3, TrendingUp, LayoutDashboard,
  UserCheck, Package, ShieldCheck, History, Megaphone, Terminal,
  Contact, Palette, Cpu, Link2, Building, Sparkles, Wallet, ArrowLeft,
  ChevronRight, QrCode, LifeBuoy
} from "lucide-react"

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,
  SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    title: 'Général',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/admin' },
      // { label: 'Stats Ventes', icon: BarChart3, href: '/dashboard/admin/stats' }, // Masqué à la demande de l'utilisateur
    ]
  },
  {
    title: 'Utilisateurs & Profils',
    items: [
      { label: 'Utilisateurs', icon: Users, href: '/dashboard/admin/users' },
      { label: 'Profils VCard', icon: Contact, href: '/dashboard/admin/profiles' },
      { label: 'Modération', icon: ShieldCheck, href: '/dashboard/admin/moderation' },
    ]
  },
  {
    title: "Ventes & Logistique",
    items: [
      { label: "Commandes NFC", icon: CreditCard, href: "/dashboard/admin/orders" },
      { label: "Paiements & Config", icon: Wallet, href: "/dashboard/admin/payments" },
      { label: "Leads & CRM", icon: Users, href: "/dashboard/admin/leads" },
      { label: "Produits NFC", icon: Package, href: "/dashboard/admin/products" },
    ]
  },
  {
    title: 'NFC & QR Codes',
    items: [
      { label: 'Gestion NFC & QR', icon: QrCode, href: '/dashboard/admin/nfc' },
    ]
  },
  {
    title: 'Communication & Style',
    items: [
      { label: 'Tickets & Support', icon: LifeBuoy, href: '/dashboard/admin/tickets' },
      { label: 'Broadcast', icon: Megaphone, href: '/dashboard/admin/broadcast' },
      { label: 'Design & Templates', icon: Palette, href: '/dashboard/admin/themes' },
    ]
  },
  {
    title: 'Système',
    items: [
      { label: 'Surveillance', icon: Terminal, href: '/dashboard/admin/monitoring' },
      { label: "Journal d'Audit", icon: History, href: '/dashboard/admin/audit' },
    ]
  }
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-gray-100 bg-white">
      {/* Header */}
      <SidebarHeader className="border-b border-gray-100 p-4 bg-white">
        <Link href="/" className="flex items-center gap-3 group px-2">
          <div className="relative w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-200 p-1.5 shadow-sm group-hover:border-orange-200 transition-colors">
            <svg className="w-full h-full" viewBox="0 0 344.19 347" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="#f97316" d="m171.53,210.3c18.45-.4,33.06,14.47,35.37,35.99,3.63,33.84,6.13,36.76,39.2,43.6,15.85,3.28,28.36,10.81,27.96,28.65-.34,15.3-8.3,27.53-25,28.39-17.96.93-27.86-8.99-31.68-27.08-6.7-31.7-14.18-37.22-45.56-37.28-30.74-.07-38.03,5.7-45.29,37.21-4.01,17.42-13.7,28.27-31.97,27.06-15.25-1.01-23.5-11.31-24.12-26.41-.8-19.2,10.84-29.18,28.17-30.37,26.21-1.8,35.43-16.65,37.79-40.93,2.5-25.76,15.17-38.4,35.16-38.84Z"/>
              <path fill="#f97316" d="m315.27,69.66c15.82,2.09,27.1,9.65,28.49,25.92,1.49,17.46-9.59,27.39-24.91,31.78-35.39,10.15-48.44,35.46-35.83,71.17,4.3,12.18,12.92,19.25,25.7,20.01,9.58.57,18.08,2.92,25.28,9.61,8.71,8.1,12.57,17.79,8.66,29.33-3.8,11.22-12.19,18.02-23.77,19.44-11.82,1.45-21.11-3.89-26.82-14.31-2.53-4.62-3.78-10.1-4.88-15.35-6.44-30.91-11.39-35.54-42.24-38.73-22.53-2.33-35.85-15.15-35.99-34.64-.15-20.49,13.82-34.73,37.22-35.34,23.89-.63,37.54-11.29,40.16-35.56,1.96-18.1,9.89-30.76,28.92-33.34Z"/>
              <path fill="#f97316" d="m0,246.93c2.03-17.01,13.36-25.17,30.31-28.05,25.82-4.39,34.21-15.98,33.97-45.71-.24-29.84-8.12-40.03-34.88-44.91C12.57,125.18.2,117.06.4,98.14c.17-16.18,9.49-26.71,25.48-27.61,18.39-1.04,29.02,10.48,30.66,27.98,2.71,28.91,17.83,39.85,45.7,40.36,19.9.36,33.61,17.14,32.38,35.3-1.4,20.65-12.49,32.33-33.42,34.53-34.79,3.67-36.73,5.46-44.63,40.82-3.87,17.34-13.15,28.74-31.49,27.2-15.96-1.34-23.95-12.35-25.07-29.79Z"/>
              <path fill="#f97316" d="m175.22,136.35c-21.57.7-36.87-12.44-38.89-36.85-2.23-27.02-13.33-40.92-40.98-43.03-16.37-1.25-26.33-12.68-24.86-30.58,1.24-15.12,9.77-24.94,24.97-25.59,17.05-.74,26.62,9.31,30.72,25.72,9.04,36.12,37.33,49.61,71.39,35.03,16.41-7.03,17.63-21.67,20.72-36.25C221.54,9.51,231.31.15,247.42,0c14.59-.14,22.45,9.06,25.82,22.28,3.91,15.31-2.86,29.54-16.61,31.1-36.6,4.14-51.52,22.87-52.85,59.25-.52,14.14-14.94,22.72-28.56,23.72Z"/>
            </svg>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-gray-900 leading-none">Ofika</p>
            <p className="text-[11px] font-normal text-gray-400 mt-1">Console Exécutive</p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="py-4 gap-4 scrollbar-hide bg-white">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title} className="px-3 py-0">
            <SidebarGroupLabel className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1 mt-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "group/link relative h-9 rounded-lg transition-all duration-150",
                        isActive
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-600 hover:text-gray-950 hover:bg-gray-50 font-normal"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3 px-3">
                        <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-orange-600" : "text-gray-400 group-hover/link:text-gray-700")} strokeWidth={isActive ? 2 : 1.75} />
                        <span className="text-[13px] group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
