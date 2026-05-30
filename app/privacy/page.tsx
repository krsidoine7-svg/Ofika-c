import Link from 'next/link'
import { Logo } from '@/components/core/ui/logo'
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Mail, Globe, Cpu, Zap, Signal } from 'lucide-react'

export const metadata = {
    title: 'Politique de Confidentialité — Ofika',
    description: 'Découvrez comment Ofika collecte, traite et protège vos données personnelles conformément aux lois ivoiriennes et internationales.',
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-orange-100">

            {/* Header Dynamique */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
                        <Logo size="sm" variant="insigne" />
                        <Logo size="sm" showText />
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-all font-bold group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Retour à l'accueil
                    </Link>
                </div>
            </header>

            {/* Hero Section Premium */}
            <div className="bg-[#0A0A0B] text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent"></div>
                <div className="container mx-auto px-6 max-w-5xl relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/20 border border-orange-600/30 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        <Shield className="w-3 h-3" />
                        Protection des données IP-SaaS
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                        Politique de 
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">
                            Confidentialité
                        </span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm font-medium">
                        <p>Version : <span className="text-white">1.2.0</span></p>
                        <p>Dernière mise à jour : <span className="text-white font-bold text-orange-400">18 Mars 2026</span></p>
                        <p>Status : <span className="text-white">Conformité RGPD & ARTCI</span></p>
                    </div>
                </div>
            </div>

            {/* Contenu Principal */}
            <div className="container mx-auto px-6 max-w-5xl py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* Sommaire Rapide */}
                    <aside className="lg:col-span-4 hidden lg:block sticky top-32 h-fit space-y-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Sommaire</p>
                            <nav className="space-y-1">
                                {[
                                    { id: 'intro', label: 'Introduction & Engagement' },
                                    { id: 'collecte', label: 'Données Collectées' },
                                    { id: 'finalite', label: 'Finalités du Traitement' },
                                    { id: 'marketing', label: 'Publicité & Réseaux' },
                                    { id: 'admin', label: 'Contrôle Administrateur' },
                                    { id: 'ia', label: 'Intelligence Artificielle' },
                                    { id: 'partage', label: 'Partage & Filiales' },
                                    { id: 'transfert', label: 'Transfert International' },
                                    { id: 'securite', label: 'Mesures de Sécurité' },
                                    { id: 'droits', label: 'Vos Droits & Contact' },
                                ].map((item) => (
                                    <a 
                                        key={item.id} 
                                        href={`#${item.id}`}
                                        className="block px-4 py-2.5 text-[13px] font-bold text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Articles détaillés */}
                    <div className="lg:col-span-8 space-y-20">
                        
                        {/* SECTION 1 : INTRODUCTION */}
                        <section id="intro" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Introduction & Engagement</h2>
                            </div>
                            <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>
                                    La plateforme <strong>Ofika</strong> s'engage à protéger la vie privée de ses utilisateurs conformément à la <strong>Loi n° 2013-450 du 19 juin 2013</strong> relative à la protection des données à caractère personnel en Côte d'Ivoire et de la Convention de l'Union Africaine sur la cybersécurité et la protection des données à caractère personnel.
                                </p>
                                <p className="bg-orange-50 p-6 rounded-2xl border-l-4 border-orange-500 text-sm italic">
                                    "Nous ne vendons jamais vos informations personnelles à des tiers. Vos données servent à bâtir votre identité numérique et à améliorer votre expérience Ofika."
                                </p>

                                <div className="mt-8 p-6 bg-gray-900 rounded-2xl border border-gray-800">
                                    <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">Cadre Légal de Référence (Côte d'Ivoire)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <a href="https://anssi.gouv.ci/lois/" target="_blank" className="p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group">
                                            <p className="text-[10px] font-black text-orange-500 uppercase mb-1">ANSSI-CI</p>
                                            <p className="text-xs text-gray-300 group-hover:text-white">LOI n° 2013-451 relative à la Cybercriminalité</p>
                                        </a>
                                        <a href="https://www.artci.ci/index.php/secteurs-regules/protection-des-donnees.html" target="_blank" className="p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group">
                                            <p className="text-[10px] font-black text-orange-500 uppercase mb-1">ARTCI</p>
                                            <p className="text-xs text-gray-300 group-hover:text-white">Autorité de Protection des Données (Loi 2013-450)</p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 2 : DONNÉES COLLECTÉES */}
                        <section id="collecte" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                    <Database className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 1. Données Collectées</h2>
                            </div>
                            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>Nous collectons et traitons les informations suivantes pour le bon fonctionnement du service :</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <p className="text-xs font-black mb-1">Identité numérique</p>
                                        <p className="text-[11px] text-gray-500">Nom, prénom, photo de profil, bio, liens sociaux, numéro de téléphone, adresse email et liens professionnels.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <p className="text-xs font-black mb-1">Données Techniques & Analytics</p>
                                        <p className="text-[11px] text-gray-500 underline decoration-orange-500">Adresse IP, Géolocalisation approximative, type de téléphone/appareil, système d'exploitation (OS), navigateur utilisé.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <p className="text-xs font-black mb-1">Interactions & Comportement</p>
                                        <p className="text-[11px] text-gray-500">Nombre de clics totaux, nombre de scans NFC/QR, date de dernière connexion, activités détaillées sur le site, avis clients reçus.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <p className="text-xs font-black mb-1">Données de Paiement</p>
                                        <p className="text-[11px] text-gray-500">Traitement via <strong>Mobile Money (Orange, MTN, Moov)</strong>, Wave et Cartes Bancaires opéré par LyGOS. Ofika ne stocke jamais vos numéros de carte ou secrets de paiement.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ARTICLE 2 : UTILISATION DES DONNÉES */}
                        <section id="finalite" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 2. Comment utilisons-nous vos données ?</h2>
                            </div>
                            <div className="prose prose-green max-w-none text-gray-600 leading-relaxed font-medium space-y-4">
                                <p>Vos données ne sont pas simplement stockées, elles sont traitées intelligemment pour vous offrir un service premium :</p>
                                <ul className="list-none space-y-4">
                                    <li className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm italic text-xs">
                                        <strong className="text-gray-900 block mb-1">🛠️ Maintenance & Sécurité :</strong>
                                        Votre IP, OS et type de téléphone nous permettent de détecter les tentatives de piratage ou de "broutage" et d'assurer que votre profil s'affiche parfaitement sur tous les écrans.
                                    </li>
                                    <li className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm italic text-xs">
                                        <strong className="text-gray-900 block mb-1">📊 Analytics Avancés :</strong>
                                        Nous comptabilisons vos scans et vos clics pour vous fournir un tableau de bord précis. Votre géolocalisation approximative sert à savoir d'où viennent vos contacts sans jamais vous espionner précisément.
                                    </li>
                                    <li className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm italic text-xs">
                                        <strong className="text-gray-900 block mb-1">🤖 Intelligence Artificielle & Personnalisation :</strong>
                                        Nos algorithmes analysent votre comportement (activités sur le site) pour vous proposer des offres personnalisées et vous suggérer des améliorations pour votre bio ou vos services.
                                    </li>
                                    <li className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm italic text-xs">
                                        <strong className="text-gray-900 block mb-1">🏢 Usage Interne & Filiales :</strong>
                                        Vos mails et données de profil sont utilisés par Ofika et ses filiales pour développer de nouvelles solutions technologiques adaptées au marché ivoirien. <strong>Nous ne vendons jamais vos données.</strong>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* SECTION 4 : PUBLICITÉ ET RÉSEAUX SOCIAUX */}
                        <section id="marketing" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 3. Publicité & Marketing</h2>
                            </div>
                            <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>
                                    Sous réserve de votre accord explicite, Ofika se réserve le droit d’utiliser votre adresse email pour :
                                </p>
                                <ul className="list-none space-y-2">
                                    <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm italic">
                                        <Signal className="w-4 h-4 text-orange-500" />
                                        Le lancement de campagnes publicitaires ciblées sur les réseaux sociaux (lookalike audiences, remarketing).
                                    </li>
                                    <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm italic">
                                        <Signal className="w-4 h-4 text-orange-500" />
                                        L'envoi de lettres d'information, de promotions et de présentations de nouveaux services Ofika.
                                    </li>
                                </ul>
                                <p className="text-xs bg-purple-50 p-4 rounded-xl border border-purple-100 text-purple-800">
                                    <strong>Opt-Out :</strong> Vous pouvez à tout moment retirer votre consentement marketing via les paramètres de votre compte ou en contactant le support.
                                </p>
                            </div>
                        </section>

                        {/* SECTION 5 : CONTRÔLE ADMINISTRATEUR */}
                        <section id="admin" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 4. Pouvoir d'Administration</h2>
                            </div>
                            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed font-medium space-y-4">
                                <p>
                                    Conformément aux CGU, l'équipe technique Ofika dispose d'un droit d'accès administratif total sur les comptes utilisateurs. Ce droit inclut la possibilité de :
                                </p>
                                <div className="p-6 bg-red-50 border border-red-100 rounded-2xl space-y-3">
                                    <p className="text-xs font-bold text-red-900 underline">Droits de Contrôle :</p>
                                    <ul className="text-xs space-y-2">
                                        <li>• Visualiser l'intégralité des champs remplis par l'utilisateur.</li>
                                        <li>• Modifier les informations en cas de non-conformité technique ou légale.</li>
                                        <li>• Supprimer ou bloquer l'accès en cas de soupçon de fraude.</li>
                                    </ul>
                                </div>
                                <p className="text-sm italic">
                                    Nous déclinons toute responsabilité quant au contenu hébergé que nous ne pourrions pas visualiser systématiquement, l'utilisateur demeurant seul garant de la légalité de ses publications.
                                </p>
                            </div>
                        </section>

                        {/* SECTION 6 : INTELLIGENCE ARTIFICIELLE */}
                        <section id="ia" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 5. Usage de l'IA & IA Générative</h2>
                            </div>
                            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed font-medium space-y-4">
                                <p>
                                    Ofika intègre des fonctionnalités d'Intelligence Artificielle pour :
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Aider à la rédaction de biographies professionnelles captivantes.</li>
                                    <li>Analyser le comportement utilisateur pour proposer des offres personnalisées et pertinentes.</li>
                                    <li>Optimiser l'agencement des profils selon les taux d'engagement.</li>
                                </ul>
                            </div>
                        </section>

                        {/* SECTION 7 : TRANSFERT INTERNATIONAL DES DONNÉES */}
                        <section id="transfert" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                                    <Globe className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 6. Transfert International (EU)</h2>
                            </div>
                            <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>
                                    Pour des raisons de performance infrastructurelle (utilisation de Supabase), vos données sont stockées sur des serveurs localisés en <strong>Europe</strong>. 
                                </p>
                                <div className="p-6 border-2 border-orange-500 rounded-3xl bg-orange-50/50">
                                    <p className="text-sm font-black text-orange-900 uppercase tracking-widest mb-2">Consentement Éclairé</p>
                                    <p className="text-xs italic font-bold">
                                        Bien qu'Ofika n'ait pas encore finalisé de déclaration formelle auprès de l'ARTCI (Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire) concernant ce transfert hors-territoire, l'utilisateur accepte expressément, en cochant la case lors de son inscription, que ses données soient traitées hors de Côte d'Ivoire.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 8 : SÉCURITÉ & STOCKAGE */}
                        <section id="securite" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 7. Sécurité & Stockage Physique</h2>
                            </div>
                            <div className="prose prose-green max-w-none text-gray-600 leading-relaxed font-medium space-y-4">
                                <p>Ofika met en œuvre une infrastructure de classe entreprise pour protéger vos données :</p>
                                <ul className="list-none space-y-3">
                                    <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <Database className="w-5 h-5 text-green-600 mt-1" />
                                        <div>
                                            <p className="text-xs font-black">Base de Données PostgreSQL :</p>
                                            <p className="text-[11px] text-gray-500">Toutes vos informations (profil, scans, clics) sont stockées dans une base PostgreSQL sécurisée chez Supabase (AWS West EU).</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <Shield className="w-5 h-5 text-green-600 mt-1" />
                                        <div>
                                            <p className="text-xs font-black">Sauvegardes Quotidiennes :</p>
                                            <p className="text-[11px] text-gray-500">Une sauvegarde automatique est effectuée toutes les 24 heures pour garantir qu'aucune donnée ne soit perdue en cas d'incident technique.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <Lock className="w-5 h-5 text-green-600 mt-1" />
                                        <div>
                                            <p className="text-xs font-black">Chiffrement de Bout en Bout :</p>
                                            <p className="text-[11px] text-gray-500">Les communications entre votre téléphone, la carte NFC et nos serveurs sont protégées par un tunnel SSL/TLS 256 bits.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* SECTION 9 : VOS DROITS & CONTACT */}
                        <section id="droits" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 8. Accès & Rectification</h2>
                            </div>
                            <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>
                                    Conformément à la loi n°2013-450, vous disposez d'un droit d'accès, d'interrogation, de rectification et d'opposition pour motifs légitimes.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 mt-8">
                                    <a
                                        href="https://wa.me/2250503681588"
                                        target="_blank"
                                        className="flex-1 flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 hover:border-orange-500 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400">WhatsApp Support</p>
                                            <p className="text-[13px] font-black text-gray-900 text-orange-600">+225 05 03 68 15 88</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>

                <div className="mt-24 pt-12 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <p className="text-2xl font-black text-gray-900 mb-2">Ofika.</p>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Votre vie privée, notre code.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/terms" className="text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors">CGV / CGU</Link>
                            <Link href="/" className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">Accueil</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Espacement bas de page pour mobiles */}
            <div className="h-24 lg:hidden"></div>
        </div>
    )
}
