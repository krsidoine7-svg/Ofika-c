🧭 Cahier de charges — Adaptation de la page profil Ofika

Objectif global :
Adapter le composant actuel de la page de profil Ofika pour qu’il reproduise fidèlement le comportement et la structure d’un écran de type iPhone 14, sans scroll horizontal, avec gestion intelligente du scroll vertical uniquement si nécessaire.
Le design doit rester fluide, centré, rigide visuellement, et toujours contenu dans les limites d’un cadre type smartphone.

🎯 Partie 1 — Structure et comportement global

Conserver le composant existant, mais adapter sa structure et ses containers pour suivre ces règles :

Le conteneur principal représente l’écran d’un téléphone (format iPhone 14 : 390x844).

Ce conteneur doit avoir un aspect ratio fixe (390/844) pour garder la proportion exacte du téléphone.

Ce conteneur ne doit jamais dépasser cette taille maximale, même sur grand écran (desktop, tablette).

Sur les écrans plus petits (iPhone SE, iPhone 6, Android compact), il doit se réduire automatiquement tout en gardant le même ratio et la même mise en page.

Le conteneur doit toujours être centré à l’écran, verticalement et horizontalement, même quand il y a peu ou beaucoup de contenu.

Utiliser une approche flexbox avec justify-center et items-center au niveau du body ou de la section parente.

Le fond principal doit rester visible derrière (comme un cadre), avec une couleur fixe (ou dégradé configuré), sans vide blanc ni débordement.

📏 Partie 2 — Comportement du scroll

Le conteneur doit :

bloquer complètement le scroll horizontal (overflow-x-hidden),

activer le scroll vertical uniquement quand le contenu dépasse la hauteur du viewport iPhone 14 (overflow-y-auto).

Si le contenu est court, aucune barre de défilement ne doit apparaître :

le contenu reste centré, sans espace vide en bas ;

le fond reste uniforme (noir, dégradé, ou selon la couleur configurée).

Si le contenu dépasse (trop de liens, bio longue, etc.) :

l’utilisateur peut scroller verticalement (du haut vers le bas) dans la limite du cadre ;

le fond reste fixe ;

le scroll est fluide, sans flottement latéral.

🧱 Partie 3 — Structure interne du contenu

Disposition générale :

Une photo de profil centrée en haut, suivie du nom d’utilisateur, puis de la bio, ensuite des boutons de liens, et enfin les icônes de réseaux sociaux.

Cette hiérarchie doit toujours rester visible dans le bon ordre, peu importe la taille du contenu.

Alignement et espacement :

Tout le contenu est aligné verticalement au centre (colonne flex-col).

Les marges internes doivent être cohérentes et proportionnelles (padding cohérent sur haut, bas, côtés).

Comportement des éléments fixes :

Les éléments d’en-tête (boutons de partage, réglages, logo, etc.) doivent être positionnés en absolute ou sticky en haut du conteneur, mais sans sortir du cadre.

Les éléments de pied de page (liens “Cookies”, “Privacy”, etc.) doivent coller en bas du conteneur avec un positionnement absolute ou sticky également, selon la structure existante.

Les boutons de liens (CTA) :

Doivent avoir une largeur pleine (full width) dans le cadre du téléphone.

Doivent s’empiler verticalement avec un espacement constant (gap ou margin-y).

Leur style reste uniforme (coins arrondis, fond légèrement contrasté par rapport au fond principal, texte centré).

🧠 Partie 4 — Notions techniques clés à appliquer

aspect-ratio: 390 / 844 pour le format iPhone 14

max-width: 390px et max-height: 844px pour limiter la taille

width: 90vw pour permettre la réduction sur petits écrans

overflow-y: auto et overflow-x: hidden pour gérer le scroll

display: flex, flex-direction: column, justify-content: center, align-items: center pour le centrage

position: absolute ou sticky pour les éléments fixes haut et bas

border-radius: 40px pour les coins arrondis façon téléphone

background-color ou background-image selon le thème de profil choisi

box-shadow léger pour créer la profondeur (effet carte flottante)

🪄 Partie 5 — Comportement responsive attendu

Sur desktop ou tablette :

La carte reste au centre de la page, taille iPhone 14 fixe, pas d’agrandissement au-delà.

Les marges autour sont gérées automatiquement (centrage visuel parfait).

Sur téléphones plus petits :

Le conteneur se réduit proportionnellement pour tenir dans le viewport.

Le ratio visuel reste le même.

Le contenu garde ses proportions et son espacement sans débordement.

Aucun scroll latéral ne doit apparaître, même sur de petits écrans.

Vérifier les paddings, marges et positionnements pour éviter tout dépassement.

🎨 Partie 6 — Expérience utilisateur

La navigation doit être fluide, sans saccade.

Le rendu visuel doit toujours ressembler à un téléphone affiché au centre de l’écran.

Les barres de scroll ne doivent apparaître que quand c’est strictement nécessaire.

Les zones vides (haut, bas, côtés) doivent rester uniformes et cohérentes.

Les transitions (apparition, hover, focus) doivent rester légères et cohérentes avec le style global.

📩 Instruction finale à QSO / Cursor

Analyse le composant actuel de la page profil Ofika.
Identifie tous les conteneurs et leurs propriétés CSS.
Ajuste la structure et les styles en appliquant toutes les règles fonctionnelles et visuelles décrites ci-dessus, sans recréer le composant.
Corrige uniquement ce qui est nécessaire pour obtenir un rendu conforme à un écran iPhone 14 simulé, avec gestion du scroll vertical seulement et responsivité descendante.
Utilise les notions aspect-ratio, overflow, sticky, absolute, flex, max-size, viewport height et rounded comme outils techniques principaux.