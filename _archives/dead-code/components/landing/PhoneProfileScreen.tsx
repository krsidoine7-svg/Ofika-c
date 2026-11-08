'use client'

import { motion } from 'framer-motion'
import { UserPlus, Share2, MessageCircle, Instagram, Github, Facebook, ExternalLink, ShieldCheck, Zap } from 'lucide-react'

export default function PhoneProfileScreen() {
    return (
        <div className="w-full h-full bg-[#0a0a0a] text-white font-sans overflow-hidden flex flex-col relative">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[60px] rounded-full"></div>
            <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[60px] rounded-full"></div>

            {/* Header Profile */}
            <div className="pt-12 pb-6 px-6 relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-orange-500 to-rose-600 p-[2px] shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                        <div className="w-full h-full rounded-[22px] bg-[#111] flex items-center justify-center text-4xl">
                            📸
                        </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 p-1.5 rounded-full border-4 border-[#0a0a0a]">
                        <ShieldCheck className="w-3 h-3 text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-black tracking-tight mb-1 italic">ALEX RIVERA</h2>
                <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Lead Product Designer</p>

                <div className="flex gap-2 mb-8">
                    <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-medium text-gray-400">@arivera.design</span>
                    <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-medium text-gray-400 font-mono">ID: 045-OFK</span>
                </div>
            </div>

            {/* Quick Actions - Bento Style */}
            <div className="px-6 grid grid-cols-2 gap-3 mb-6 relative z-10">
                <button className="bg-white text-black py-4 rounded-2xl flex flex-col items-center gap-1 group overflow-hidden relative transition-transform active:scale-95">
                    <UserPlus className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Add Contact</span>
                    <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform -z-10 opacity-10"></div>
                </button>
                <button className="bg-white/5 border border-white/10 py-4 rounded-2xl flex flex-col items-center gap-1 backdrop-blur-md transition-all hover:bg-white/10 active:scale-95">
                    <Share2 className="w-5 h-5 text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Exchange</span>
                </button>
            </div>

            {/* Social Row */}
            <div className="px-6 flex justify-between mb-8 relative z-10">
                {[MessageCircle, Instagram, Github, Facebook].map((Icon, i) => (
                    <div key={i} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all cursor-pointer group">
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </div>
                ))}
            </div>

            {/* Links - Vertical Cards */}
            <div className="px-6 space-y-3 pb-12 relative z-10 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {[
                    { title: "Personal Portfolio", sub: "arivera.com", icon: "🌐" },
                    { title: "Dribbble Shots", sub: "Creative works", icon: "🏀" },
                    { title: "Work with me", sub: "Calendly link", icon: "🤝" },
                    { title: "My Newsletter", sub: "Design tips", icon: "📧" }
                ].map((item, i) => (
                    <div key={i} className="flex items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
                        <div className="w-10 h-10 bg-[#151515] rounded-xl flex items-center justify-center text-lg mr-4 group-hover:scale-110 transition-transform">
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <div className="text-[11px] font-black uppercase tracking-tighter text-white">{item.title}</div>
                            <div className="text-[9px] text-gray-500 font-medium">{item.sub}</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-orange-500" />
                    </div>
                ))}
            </div>

            {/* Bottom Branding */}
            <div className="mt-auto py-6 flex flex-col items-center justify-center border-t border-white/5 bg-black/50 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black tracking-[0.3em] uppercase opacity-40">Powered by</span>
                </div>
                <div className="h-6 w-20 relative opacity-80">
                    <img
                        src="/assets/logos/logo-white-full.svg"
                        alt="Ofika"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>
        </div>
    )
}
