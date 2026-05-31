"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Users, CreditCard, Settings, BarChart3, TrendingUp, LayoutDashboard,
  UserCheck, Package, ShieldCheck, History, Megaphone, Terminal,
  Contact, Palette, Cpu, Link2, Building, Sparkles, Wallet, ArrowLeft,
  ChevronRight
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
      { label: 'Traffic & Trends', icon: TrendingUp, href: '/dashboard/admin/analytics' },
      { label: 'Stats Ventes', icon: BarChart3, href: '/dashboard/admin/stats' },
    ]
  },
  {
    title: 'Utilisateurs & Profils',
    items: [
      { label: 'Utilisateurs', icon: Users, href: '/dashboard/admin/users' },
      { label: 'Profils VCard', icon: Contact, href: '/dashboard/admin/profiles' },
      { label: 'Entreprises', icon: Building, href: '/dashboard/admin/companies' },
      { label: 'Modération', icon: ShieldCheck, href: '/dashboard/admin/moderation' },
    ]
  },
  {
    title: "Ventes & Logistique",
    items: [
      { label: "Commandes NFC", icon: CreditCard, href: "/dashboard/admin/orders" },
      { label: "Méthodes de Paiement", icon: Wallet, href: "/dashboard/admin/payments" },
      { label: "Leads & CRM", icon: Users, href: "/dashboard/admin/leads" },
      { label: "Produits NFC", icon: Package, href: "/dashboard/admin/products" },
    ]
  },
  {
    title: 'NFC & QR Codes',
    items: [
      { label: 'Cartes NFC', icon: UserCheck, href: '/dashboard/admin/nfc' },
      { label: 'Redirections QR', icon: Link2, href: '/dashboard/admin/qr-redirects' },
    ]
  },
  {
    title: 'Communication & Style',
    items: [
      { label: 'Broadcast', icon: Megaphone, href: '/dashboard/admin/broadcast' },
      { label: 'Templates', icon: Sparkles, href: '/dashboard/admin/templates' },
      { label: 'Thèmes & Design', icon: Palette, href: '/dashboard/admin/themes' },
    ]
  },
  {
    title: 'Système',
    items: [
      { label: 'Surveillance', icon: Terminal, href: '/dashboard/admin/monitoring' },
      { label: "Journal d'Audit", icon: History, href: '/dashboard/admin/audit' },
      { label: 'Paramètres', icon: Settings, href: '/dashboard/admin/settings' },
      { label: 'Config Avancée', icon: Cpu, href: '/dashboard/admin/settings/advanced' },
    ]
  }
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border p-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow shrink-0">
            <span className="text-white font-black text-lg leading-none">O</span>
          </div>
          <div>
            <p className="text-sm font-black tracking-widest text-sidebar-accent-foreground uppercase leading-none">Ofika</p>
            <p className="text-[10px] font-medium text-sidebar-foreground/50 tracking-widest mt-0.5">ADMIN PANEL</p>
          </div>
        </Link>

        {/* Superadmin badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse shrink-0" />
          <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Session SuperAdmin</span>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="py-2 gap-0">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title} className="px-3 py-0 mb-0.5">
            <SidebarGroupLabel className="px-2 py-1.5 text-[9px] font-bold text-sidebar-foreground/30 uppercase tracking-[0.15em] h-auto mb-0.5">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
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
                          ? "bg-orange-500/15 text-orange-400 hover:bg-orange-500/20 hover:text-orange-400"
                          : "text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-2.5 px-2.5">
                        {/* Active bar indicator */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                        )}
                        <item.icon className={cn("w-3.5 h-3.5 shrink-0 transition-colors", isActive ? "text-orange-400" : "text-sidebar-foreground/40 group-hover/link:text-sidebar-foreground/80")} />
                        <span className="text-xs font-medium truncate">{item.label}</span>
                        {isActive && <ChevronRight className="ml-auto w-3 h-3 text-orange-400/60 shrink-0" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent transition-all duration-150 group/back"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0 group-hover/back:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-medium">Espace Client</span>
        </Link>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
