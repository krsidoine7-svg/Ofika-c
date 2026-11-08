import React from 'react'
import Link from 'next/link'
import { Activity, ShieldCheck, Database, Server, Terminal, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function TechDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider font-semibold">Serveur & API</span>
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">Opérationnel</p>
          <p className="text-xs text-slate-400">Next.js App Router (Node.js runtime)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider font-semibold">Base de Données</span>
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">Supabase PG</p>
          <p className="text-xs text-slate-400">RLS actif + Trigger de rôles synchronisé</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider font-semibold">Audit Sécurité</span>
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">Renforcé</p>
          <p className="text-xs text-slate-400">Double barrière Middleware + RSC</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-orange-400" />
          Accès Rapides & Outils Développeur
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Link
            href="/dashboard/admin/audit"
            className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between text-sm text-slate-300 hover:text-white"
          >
            <span>Journaux d&apos;audit</span>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </Link>
          <Link
            href="/dashboard/admin/monitoring"
            className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between text-sm text-slate-300 hover:text-white"
          >
            <span>Monitoring performances</span>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </Link>
          <Link
            href="/dashboard/admin"
            className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between text-sm text-slate-300 hover:text-white"
          >
            <span>Panneau Administration Métier</span>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </Link>
        </div>
      </div>
    </div>
  )
}
