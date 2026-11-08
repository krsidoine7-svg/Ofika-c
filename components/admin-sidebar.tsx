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
          <div className="relative w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 group-hover:bg-orange-100 transition-colors">
            <span className="text-orange-600 font-bold text-base leading-none">O</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-gray-900 leading-none">Ofika</p>
            <p className="text-[11px] font-normal text-gray-400 mt-1">Administration</p>
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
