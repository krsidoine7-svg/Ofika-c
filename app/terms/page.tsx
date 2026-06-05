import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ArrowLeft, FileText, Scale, Gavel, AlertCircle, ShoppingCart, RefreshCcw, Truck, Zap, ShieldAlert, Cpu } from 'lucide-react'

export const metadata = {
    title: 'Conditions Générales d’Utilisation et de Vente — Ofika',
    description: 'Consultez les conditions détaillées régissant l’utilisation de la plateforme Ofika et l’achat de produits NFC.',
}

export default function TermsPage() {
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
                        <Scale className="w-3 h-3" />
                        Document Juridique Officiel
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                        Conditions Générales
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">
                            de Vente et d’Utilisation
                        </span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm font-medium">
                        <p>Version : <span className="text-white">1.0.2</span></p>
                        <p>Dernière mise à jour : <span className="text-white font-bold text-orange-400">18 Mars 2026</span></p>
                        <p>Lieu : <span className="text-white">Abidjan, Côte d'Ivoire</span></p>
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
                                    { id: 'mentions', label: 'Mentions Légales' },
                                    { id: 'objet', label: 'Objet du Service' },
                                    { id: 'inscription', label: 'Inscription & Éligibilité' },
                                    { id: 'nfc', label: 'Produits NFC & Garanties' },
                                    { id: 'abonnements', label: 'Abonnements & Tarifs' },
                                    { id: 'remboursement', label: 'Politique de Remboursement' },
                                    { id: 'ugc', label: 'Contenu & Responsabilité' },
                                    { id: 'admin', label: 'Pouvoirs de l’Équipe Ofika' },
                                    { id: 'tech', label: 'Intégrité Technique' },
                                    { id: 'mod', label: 'Modération & Sanctions' },
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
                        <div className="bg-orange-600 p-6 rounded-3xl text-white shadow-xl shadow-orange-600/20">
                            <p className="text-xs font-bold mb-2">Besoin d'aide ?</p>
                            <p className="text-sm opacity-90 mb-4 font-medium">Notre support juridique est disponible sur WhatsApp.</p>
                            <a href="https://wa.me/2250503681588" className="inline-flex items-center justify-center w-full py-3 bg-white text-orange-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-50 transition-colors">
                                Contact Direct
                            </a>
                        </div>
                    </aside>

                    {/* Articles détaillés */}
                    <div className="lg:col-span-8 space-y-20">
                        
                        {/* MENTIONS LÉGALES */}
                        <section id="mentions" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Mentions Légales</h2>
                            </div>
                            <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>
                                    En vertu de l'article 6 de la loi n° 2013-455 du 19 juin 2013 relative aux transactions électroniques, il est précisé aux utilisateurs de la plateforme Ofika l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
                                </p>
                                <ul className="bg-gray-50 p-8 rounded-3xl space-y-4 list-none border border-gray-100">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-600" />
                                        <span><strong>Propriétaire :</strong> Ofika, plateforme opérée par [Nom du Développeur/Propriétaire], immatriculation en cours.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-600" />
                                        <span><strong>Siège Social :</strong> Adjamé Paillet, Abidjan, Côte d’Ivoire. Travail opéré administrativement à domicile.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-600" />
                                        <span><strong>Responsable Publication :</strong> Équipe Ofika — contact@ofika.ci</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-600" />
                                        <span><strong>Contact Support :</strong> Disponible via WhatsApp au <span className="text-orange-600 font-bold">+225 05 03 68 15 88</span>.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-600" />
                                        <span><strong>Hébergeur :</strong> Supabase Inc. (USA), infrastructure cloud avec stockage de données localisé en Europe pour des raisons de conformité technique et de performance.</span>
                                    </li>
                                </ul>
                                
                                <div className="mt-8 p-6 bg-gray-900 rounded-2xl border border-gray-800">
                                    <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">Sources Légales de Référence (Côte d'Ivoire)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <a href="https://anssi.gouv.ci/lois/" target="_blank" className="p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group">
                                            <p className="text-[10px] font-black text-orange-500 uppercase mb-1">ANSSI-CI</p>
                                            <p className="text-xs text-gray-300 group-hover:text-white">Lois sur la Cybercriminalité & Transactions Electroniques</p>
                                        </a>
                                        <a href="https://www.artci.ci/index.php/secteurs-regules/protection-des-donnees.html" target="_blank" className="p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group">
                                            <p className="text-[10px] font-black text-orange-500 uppercase mb-1">ARTCI</p>
                                            <p className="text-xs text-gray-300 group-hover:text-white">Autorité de Protection des Données à Caractère Personnel</p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ARTICLE 1 : OBJET DU SERVICE */}
                        <section id="objet" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 1. Objet du Service</h2>
                            </div>
                            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed font-medium space-y-4">
                                <p>
                                    La plateforme Ofika propose un écosystème d'identité numérique professionnelle fusionnant le digital et le physique. Le service permet :
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li>La création de pages de profil ("Public Pages") épurées et interactives.</li>
                                    <li>L'achat de cartes de visite physiques équipées de puces NFC (Near Field Communication) et de QR codes.</li>
                                    <li>Le suivi analytique en temps réel des interactions sur les profils.</li>
                                    <li>L'utilisation d'outils d'automatisation et d'Intelligence Artificielle pour l'optimisation des bios et l'analyse de leads.</li>
                                </ul>
                                <p className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-500 text-sm italic">
                                    Note : Ofika est conçu prioritairement pour les créatifs, entrepreneurs, influenceurs et professionnels opérant ou résidant en Côte d’Ivoire, tout en restant ouvert à l'international.
                                </p>
                            </div>
                        </section>

                        {/* ARTICLE 2 : INSCRIPTION & ÉLIGIBILITÉ */}
                        <section id="inscription" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                                    <Scale className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 2. Inscription & Éligibilité</h2>
                            </div>
                            <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed font-medium space-y-4">
                                <p>
                                    L'accès à la création de compte est strictement réservé aux personnes physiques majeures, soit âgées de <strong>18 ans révolus</strong> au moment de l'inscription. L'utilisateur s'engage à fournir des informations véridiques, exactes et à jour lors de la création de son identité numérique.
                                </p>
                                <p>
                                    Ofika se réserve le droit de demander une preuve d'identité en cas de doute sur l'âge ou la légitimité d'un utilisateur, notamment dans le cadre de la lutte contre l'usurpation d'identité.
                                </p>
                            </div>
                        </section>

                        {/* ARTICLE 3 : PRODUITS NFC ET GARANTIES */}
                        <section id="nfc" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                    <Cpu className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 3. Cartes NFC & Garanties</h2>
                            </div>
                            <div className="prose prose-green max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>
                                    Chaque carte Ofika est un dispositif technique unique lié à l'infrastructure logicielle du SaaS.
                                </p>
                                <div className="bg-green-50/50 p-8 rounded-3xl border border-green-100 space-y-4">
                                    <h4 className="text-green-900 font-black uppercase text-xs tracking-widest">Garantie Ofika Protect</h4>
                                    <p className="text-sm">
                                        Nous offrons une garantie technique de <strong>un (1) an</strong> à compter de la date de livraison. Cela couvre tout dysfonctionnement électronique de la puce NFC ou du QR code ne résultant pas d'une mauvaise manipulation de l'utilisateur (casse, exposition à l'eau, chaleur extrême).
                                    </p>
                                    <p className="text-sm font-bold">
                                        En cas de défaut technique avéré, Ofika s'engage à remplacer la carte gratuitement.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900">Responsabilité Physique (Perte/Vol/Casse)</h3>
                                    <p>
                                        Ofika ne peut être tenu responsable en cas de perte, vol ou détérioration physique par le client. Toutefois, dans une démarche de fidélisation :
                                    </p>
                                    <ul className="list-disc pl-6">
                                        <li>Le remplacement d'une carte abîmée ou perdue est payant au tarif en vigueur.</li>
                                        <li><strong>Avantage Abonné :</strong> Si l'utilisateur possède un abonnement payant actif au moment du rachat, il bénéficie d'une <strong>réduction immédiate de 50%</strong> sur la nouvelle carte.</li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900">Livraison (Abidjan)</h3>
                                    <p>
                                        À ce jour, Ofika opère exclusivement par livraison directe à <strong>Abidjan</strong>. Les délais de livraison sont compris entre <strong>1 et 5 jours ouvrés</strong>. Les frais de livraison standard sont inclus dans le prix de vente affiché de la carte.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ARTICLE 4 : ABONNEMENTS ET TARIFS */}
                        <section id="abonnements" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 4. Abonnements & Tarifs</h2>
                            </div>
                            <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>
                                    Le modèle économique d'Ofika repose sur deux piliers :
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <h4 className="font-black text-gray-900 mb-2 underline decoration-orange-500 underline-offset-4">Moyens de Paiement</h4>
                                        <p className="text-xs italic">Nous acceptons les paiements par <strong>Mobile Money (Orange, MTN, Moov)</strong>, Cartes Bancaires (VISA/Mastercard) et Wave via nos passerelles sécurisées <strong>LyGOS</strong> et <strong>Wave</strong>.</p>
                                    </div>
                                    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <h4 className="font-black text-gray-900 mb-2 underline decoration-orange-500 underline-offset-4">Le SaaS (Logiciel)</h4>
                                        <p className="text-xs">Plans mensuels ou annuels (<strong>Gratuit, Pro, Business</strong>) pour accéder aux fonctionnalités étendues.</p>
                                    </div>
                                </div>
                                <p>
                                    Les paiements sont sécurisés et opérés via notre partenaire <strong>LyGOS</strong>. En cas d'échec de virement ou de défaut de provision, Ofika se réserve le droit de suspendre l'accès aux fonctionnalités premium sans mise en demeure préalable.
                                </p>
                            </div>
                        </section>

                        {/* ARTICLE 5 : POLITIQUE DE REMBOURSEMENT */}
                        <section id="remboursement" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                                    <RefreshCcw className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 5. Politique de Remboursement</h2>
                            </div>
                            <div className="prose prose-red max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900">1. Cartes de visite</h3>
                                    <p>
                                        Le remboursement intégral n'est possible que si la faute incombe directement à Ofika (erreur technique grave rendant le produit inutilisable dès réception).
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900">2. Abonnements (SaaS)</h3>
                                    <p>La règle de remboursement est dégressive pour protéger l'intégrité du service :</p>
                                    <div className="overflow-hidden border border-gray-100 rounded-2xl font-bold text-xs uppercase tracking-tight">
                                        <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 p-4 font-black">
                                            <div>Scénario</div>
                                            <div>Sous 2 semaines</div>
                                            <div>Après 2 semaines</div>
                                        </div>
                                        <div className="grid grid-cols-3 p-4 border-b border-gray-50">
                                            <div className="text-orange-600">Faute Ofika</div>
                                            <div className="text-green-600">100%</div>
                                            <div>50%</div>
                                        </div>
                                        <div className="grid grid-cols-3 p-4">
                                            <div className="text-gray-400">Faute Utilisateur</div>
                                            <div className="text-green-600">100%</div>
                                            <div>30%</div>
                                        </div>
                                    </div>
                                    <p className="text-sm">Pour les <strong>abonnements annuels</strong>, un remboursement forfaitaire de <strong>70%</strong> de la somme engagée peut être accordé sous conditions spécifiques après étude du support.</p>
                                </div>
                            </div>
                        </section>

                        {/* ARTICLE 6 : CONTENU & RESPONSABILITÉ UTILISATEUR */}
                        <section id="ugc" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                                    <ShieldAlert className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 6. Contenu & Obligations</h2>
                            </div>
                            <div className="prose prose-red max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>
                                    L'utilisateur est seul responsable du contenu qu'il publie (UGC - User Generated Content). Ofika ne procède à aucun filtrage préalable systématique mais intervient en cas de signalement.
                                </p>
                                <div className="bg-red-50 p-8 rounded-3xl border border-red-100 space-y-4">
                                    <h4 className="text-red-900 font-black uppercase text-xs tracking-widest">Interdictions Formelles</h4>
                                    <ul className="text-xs space-y-2 list-none">
                                        <li>🚫 Utilisation pour des arnaques de type "Brouteur".</li>
                                        <li>🚫 Partage de contenu pornographique ou offensant.</li>
                                        <li>🚫 Vente ou promotion de produits illégaux.</li>
                                        <li>🚫 Usurpation d'identité ou fraude commerciale.</li>
                                        <li>🚫 Insertion de liens malveillants ou scripts dangereux.</li>
                                    </ul>
                                </div>
                                <p className="text-sm italic font-bold">
                                    L'utilisation d'Ofika pour toute activité illégale entraînera une suppression immédiate du compte et le signalement aux autorités ivoiriennes compétentes (PLCC, ARTCI).
                                </p>
                            </div>
                        </section>

                        {/* ARTICLE 7 : POUVOIRS DE L’ÉQUIPE OFIKA */}
                        <section id="admin" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
                                    <Gavel className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 7. Administration du Site</h2>
                            </div>
                            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>
                                    Pour garantir la sécurité et le bon fonctionnement de l'infrastructure, les administrateurs d'Ofika disposent de droits étendus sur les comptes utilisateurs. 
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                        <p className="text-xs font-black">Droits Admin :</p>
                                        <p className="text-[11px] text-gray-500">Modification, suppression, blocage, accès technique complet aux données de profil.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                        <p className="text-xs font-black">Cadre d'Usage :</p>
                                        <p className="text-[11px] text-gray-500">Exclusivité pour maintenance technique, lutte contre la fraude et garantie du bon fonctionnement.</p>
                                    </div>
                                </div>
                                <p className="bg-red-600 text-white p-6 rounded-2xl text-xs font-black uppercase tracking-widest text-center">
                                    AUCUN REMBOURSEMENT ne sera pratiqué en cas de suspension de compte pour activité suspecte ou violation répétée des règles.
                                </p>
                            </div>
                        </section>

                        {/* ARTICLE 8 : INTÉGRITÉ TECHNIQUE & POURSUITES */}
                        <section id="tech" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 8. Intégrité Technique</h2>
                            </div>
                            <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>
                                    Le lien technologique entre la puce NFC et nos serveurs repose sur l'URL structurelle <code>ofika.ci/short_code</code>. 
                                </p>
                                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
                                    <p className="text-red-900 font-black uppercase text-[10px] tracking-widest mb-3">Avertissement de sécurité</p>
                                    <p className="text-sm">
                                        L'utilisateur s'engage à ne jamais tenter de modifier, détourner ou hacker ce lien. Un changement du code court dans la configuration rendrait la carte NFC <strong>inutilisable techniquement</strong>.
                                    </p>
                                    <p className="text-sm font-bold mt-3">
                                        Ofika se réserve le droit d’engager des poursuites judiciaires à l'encontre de tout utilisateur tentant de porter atteinte à l'intégrité technique du système ou de contourner les protections mises en place.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ARTICLE 9 : SIGNALEMENT ET MODÉRATION */}
                        <section id="mod" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                                    <ShieldAlert className="w-6 h-6 text-gray-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 9. Signalement Abusif</h2>
                            </div>
                            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed font-medium space-y-6">
                                <p>
                                    Tout tiers témoin d'un contenu illégal sur Ofika peut signaler le profil incriminé en envoyant un message WhatsApp ou un Email au support technique. Le signalement doit impérativement contenir :
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>L'URL du profil concerné (ex: ofika.ci/nom).</li>
                                    <li>La nature de l'abus constaté.</li>
                                    <li>(Optionnel) Une capture d'écran ou preuve de l'abus.</li>
                                </ul>
                                <p>Ofika s'engage à traiter les signalements sérieux dans un délai de 48h ouvrées.</p>
                            </div>
                        </section>

                        {/* ARTICLE 10 : LOI APPLICABLE */}
                        <section id="loi" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                    <Scale className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Article 10. Loi Applicable</h2>
                            </div>
                            <div className="prose prose-green max-w-none text-gray-600 leading-relaxed font-medium space-y-4">
                                <p>
                                    Les présentes conditions sont régies exclusivement par la <strong>Loi de la République de Côte d'Ivoire</strong>. En cas de litige non résolu à l'amiable par le support clients, seuls les tribunaux d'Abidjan seront compétents pour trancher le différend.
                                </p>
                            </div>
                        </section>

                    </div>
                </div>

                <div className="mt-24 pt-12 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <p className="text-2xl font-black text-gray-900 mb-2">Ofika.</p>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Connectez-vous à demain.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors">Confidentialité</Link>
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
