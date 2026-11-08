

# Cahier de Recette : Ofika

## Informations generales

| Element | Valeur |
| :--- | :--- |
| Plateforme | Ofika (Cartes de visite connectees NFC et Link-in-Bio) |
| Environnement | Staging / Pre-production |
| URL | https://ofika.ci |
| Version testee | 1.0.0 |
| Perimetre | Onboarding, Profils, Tunnel d'achat NFC, Paiements GeniusPay et Wave, vCard, Administration |

## Consignes aux testeurs

- Suivre les etapes dans l'ordre, sans en sauter. Cocher [ ] OK si le resultat observe correspond au resultat attendu, [ ] NA si le test ne s'applique pas ou ne peut pas etre execute.
- Legende des priorites : **P1** critique (bloque la mise en service), **P2** important, **P3** mineur.
- Les tests marques « A EXECUTER UNIQUEMENT EN STAGING » ont un effet reel (paiement, envoi, suppression) : ne pas les lancer en production.

**Procedure obligatoire en cas de bug :**

> Si une etape echoue ou presente une anomalie :
> 1. Faire une capture d'ecran nette de l'ecran ou de l'erreur.
> 2. Noter la reference exacte du test (ex. : Module 1 - Test 1.2).
> 3. Consigner l'incident dans le document de suivi BUGS_ET_AMELIORATIONS avec la capture.

## Repertoire des comptes de test

| Profil | Nom / Fonction | E-mail de connexion | Mot de passe de test | Telephone | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Administrateur Principal | Responsable Exploitation | admin@ofika.com | OfikaAdmin2026! | +225 07 00 00 00 01 | admin |
| Administrateur Secondaire | KRS Admin | krsidoine7@gmail.com | OfikaKrs2026! | +225 07 00 00 00 02 | admin |
| Utilisateur Standard 1 | Jean Kouassi | user1@test-ofika.com | OfikaTest2026! | +225 05 12 34 56 78 | user |
| Utilisateur Standard 2 | Marie Dupont | user2@test-ofika.com | OfikaTest2026! | +221 77 123 45 67 | user |
| Visiteur / Acheteur | Client Invite | jean.invite@example.com | Aucun (Guest) | +225 01 98 76 54 32 | visiteur |

## Module 1 : Authentification et Droits d'acces

Pre-requis du module : Navigateur web ouvert sur https://ofika.ci/login sans session active prealable.

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1.1 | P1 | Connexion utilisateur standard valide | 1. Acceder a la page https://ofika.ci/login 2. Saisir l'adresse e-mail user1@test-ofika.com 3. Saisir le mot de passe OfikaTest2026! 4. Cliquer sur le bouton Se connecter | Redirection vers https://ofika.ci/dashboard avec affichage du tableau de bord personnel de l'utilisateur. | [ ] OK [ ] NA |
| 1.2 | P1 | Echec de connexion avec mot de passe errone | 1. Acceder a la page https://ofika.ci/login 2. Saisir l'adresse e-mail user1@test-ofika.com 3. Saisir le mot de passe FauxMotDePasse999 4. Cliquer sur le bouton Se connecter | Message d'erreur Identifiants invalides affiche en rouge sous les champs, aucun acces au tableau de bord. | [ ] OK [ ] NA |
| 1.3 | P1 | Inscription nouvel utilisateur avec confirmation | 1. Acceder a https://ofika.ci/signup 2. Renseigner le nom Nouveau Testeur 3. Saisir un e-mail valide nouveau.testeur2026@ofika.ci 4. Saisir un mot de passe a 8 caracteres avec majuscule et chiffre 5. Cliquer sur Creer mon compte | Notification de creation de compte affichee et redirection vers le tableau de bord ou l'ecran de confirmation d'e-mail. | [ ] OK [ ] NA |
| 1.4 | P2 | Rejet inscription avec e-mail deja existant | 1. Acceder a https://ofika.ci/signup 2. Renseigner le nom Jean Doublon 3. Saisir l'e-mail existant user1@test-ofika.com 4. Saisir un mot de passe valide 5. Cliquer sur Creer mon compte | Message d'erreur Un compte existe deja avec cette adresse e-mail affiche, le formulaire reste sur place. | [ ] OK [ ] NA |
| 1.5 | P2 | Demande de reinitialisation de mot de passe oublie | 1. Acceder a https://ofika.ci/login 2. Cliquer sur le lien Mot de passe oublie 3. Saisir user1@test-ofika.com 4. Cliquer sur Envoyer le lien | Notification E-mail de reinitialisation envoye affichee a l'ecran. | [ ] OK [ ] NA |
| 1.6 | P1 | Blocage d'acces aux pages admin pour un utilisateur standard | 1. Se connecter avec le compte user1@test-ofika.com 2. Saisir directement l'URL https://ofika.ci/dashboard/admin dans la barre d'adresse du navigateur 3. Valider la navigation | Redirection immediate vers https://ofika.ci/dashboard ou affichage de la page 403 Acces refuse. | [ ] OK [ ] NA |

| Nom du Testeur | Date | Commentaires & Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

## Module 2 : Tunnel de Commande et Saisie de Livraison

Pre-requis du module : Acces a la boutique en ligne sur https://ofika.ci/order/create sans obligation de connexion.

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2.1 | P1 | Saisie nominale de commande de carte NFC physique | 1. Ouvrir l'URL https://ofika.ci/order/create 2. Saisir le nom complet Amadou Diallo 3. Saisir le telephone +225 07 11 22 33 44 4. Saisir l'e-mail amadou.diallo@example.com 5. Saisir l'adresse Cocody Angre 8e Tranche Rue L12 6. Saisir la ville Abidjan 7. Saisir le code postal 00225 8. Verifier le montant affiche de 14 600 XOF 9. Cliquer sur Continuer | Validation sans blocage et passage a l'etape de paiement avec le montant exact de 14 600 XOF. | [ ] OK [ ] NA |
| 2.2 | P1 | Rejet de formulaire si le numero de telephone est manquant | 1. Ouvrir https://ofika.ci/order/create 2. Renseigner le nom Fatou Bamba 3. Laisser le champ Telephone vide 4. Renseigner l'adresse Plateau Avenue Chardy et la ville Abidjan 5. Cliquer sur le bouton de soumission | Message de validation Le numero de telephone est requis affiche en rouge, la commande n'est pas envoyee. | [ ] OK [ ] NA |
| 2.3 | P1 | Rejet de formulaire si le telephone a un format invalide | 1. Ouvrir https://ofika.ci/order/create 2. Saisir le nom Koffi Serges 3. Saisir le telephone 1234 dans le champ telephone 4. Remplir l'adresse et la ville 5. Cliquer sur le bouton de soumission | Message d'erreur Le numero doit contenir au moins 8 chiffres affiche, empechant la soumission. | [ ] OK [ ] NA |
| 2.4 | P2 | Validation de commande avec champ e-mail laisse vide | 1. Ouvrir https://ofika.ci/order/create 2. Renseigner le nom Moussa Traore 3. Renseigner le telephone +225 05 44 33 22 11 4. Laisser le champ Email vide 5. Renseigner l'adresse Yopougon Maroc et la ville Abidjan 6. Valider le formulaire | Formulaire accepte sans message d'erreur, passage a la selection de paiement avec l'adresse physique valide. | [ ] OK [ ] NA |
| 2.5 | P2 | Rejet de formulaire si l'e-mail a une syntaxe incorrecte | 1. Ouvrir https://ofika.ci/order/create 2. Saisir le nom Awa Toure 3. Saisir l'adresse e-mail invalide awatoure-sans-arobase 4. Remplir le telephone +225 07 99 88 77 66, l'adresse et la ville 5. Valider le formulaire | Message d'erreur Format d'email invalide affiche sous le champ e-mail, empechant la soumission. | [ ] OK [ ] NA |
| 2.6 | P1 | Verification du calcul strict du prix cote serveur | 1. Ouvrir les outils de developpement du navigateur 2. Tenter d'envoyer une requete POST vers /api/orders/create avec une quantite de 1 et un faux prix de 500 XOF 3. Observer la reponse serveur | Le serveur recalcule le prix a 14 600 XOF ou rejette la requete, le prix falsifie n'est jamais pris en compte dans la commande. | [ ] OK [ ] NA |
| 2.7 | P2 | Conservation des donnees saisies lors du retour arriere | 1. Remplir l'ensemble des informations de livraison a l'etape 1 2. Cliquer sur Continuer pour afficher le choix de paiement 3. Cliquer sur le bouton Retour 4. Verifier les champs du formulaire | Tous les champs nom, telephone, e-mail, adresse et ville ont conserve leurs valeurs precedentes sans reinitialisation. | [ ] OK [ ] NA |

| Nom du Testeur | Date | Commentaires & Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

## Module 3 : Paiements Mobile Money GeniusPay et Wave

Pre-requis du module : Formulaire de commande valide rempli, passerelles actives en base de donnees. A EXECUTER UNIQUEMENT EN STAGING avec comptes de test.

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 3.1 | P1 | Initiation et redirection vers le guichet GeniusPay | 1. Sur l'ecran de paiement d'une commande, selectionner GeniusPay Mobile Money 2. Cliquer sur le bouton Payer avec GeniusPay 3. Observer l'etat du bouton et la redirection | Le bouton affiche Redirection avec un indicateur de chargement, puis redirige vers l'URL securisee du guichet GeniusPay. | [ ] OK [ ] NA |
| 3.2 | P1 | Reception et validation du webhook GeniusPay apres succes | 1. Simuler un paiement reussi sur le guichet de test GeniusPay 2. Observer le retour sur la plateforme Ofika a l'adresse https://ofika.ci/payment/success 3. Consulter le statut de la commande en base ou sur le tableau de bord | Statut de paiement mis a jour a paye dans la base de donnees, message Votre paiement a ete valide avec succes affiche. | [ ] OK [ ] NA |
| 3.3 | P1 | Gestion de l'annulation de paiement sur GeniusPay | 1. Sur le guichet de paiement GeniusPay, cliquer sur Annuler et retourner au site marchand 2. Observer l'ecran de retour sur Ofika | Redirection vers https://ofika.ci/payment/cancelled avec affichage du message Paiement interrompu et proposition de recommencer. | [ ] OK [ ] NA |
| 3.4 | P2 | Selection de la passerelle Wave Direct | 1. Sur l'ecran de choix de paiement, cliquer sur l'option Wave 2. Cliquer sur le bouton de validation de commande Wave | Affichage des instructions de paiement Wave avec numero de telephone destinataire et QR code de virement Wave. | [ ] OK [ ] NA |
| 3.5 | P2 | Televersement du recu de virement Wave par le client | 1. A l'etape de confirmation Wave, cliquer sur Televerser mon recu 2. Selectionner un fichier image PNG ou JPG valide inferieur a 5 Mo 3. Valider l'envoi du recu | Notification Recu televerse avec succes affichee, statut de commande affiche en attente de verification manuelle. | [ ] OK [ ] NA |
| 3.6 | P1 | Rejet d'un fichier de recu Wave non conforme ou trop lourd | 1. Cliquer sur Televerser mon recu 2. Selectionner un fichier binaire executable .exe ou un fichier depassant 10 Mo 3. Tenter la soumission | Message d'erreur Format de fichier non autorise ou Fichier trop volumineux affiche, aucun televersement en base. | [ ] OK [ ] NA |

| Nom du Testeur | Date | Commentaires & Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

## Module 4 : Profil Link-in-Bio et Personnalisation

Pre-requis du module : Utilisateur connecte avec le compte user1@test-ofika.com sur https://ofika.ci/dashboard/profiles.

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 4.1 | P1 | Creation d'un nouveau profil digital Link-in-Bio | 1. Dans le dashboard, cliquer sur Profils puis Nouveau profil 2. Renseigner l'identifiant URL unique jeankouassi 3. Saisir le nom public Jean Kouassi Consultant 4. Saisir la biographie Expert en strategie d'entreprise 5. Cliquer sur Enregistrer le profil | Profil cree en base de donnees et visible dans la liste avec statut actif. | [ ] OK [ ] NA |
| 4.2 | P2 | Modification et application du template de design LinkInBioDesign7 | 1. Ouvrir l'editeur du profil jeankouassi 2. Acceder a l'onglet Design 3. Selectionner le template Design 7 (Sombre contraste) 4. Cliquer sur Enregistrer les modifications | Le template 7 est assigne au profil, la previsualisation affiche l'arriere-plan sombre avec les bordures grises contrastees. | [ ] OK [ ] NA |
| 4.3 | P2 | Ajout d'un lien social WhatsApp avec numero valide | 1. Dans l'editeur de profil, aller dans la section Reseaux sociaux 2. Choisir le reseau WhatsApp 3. Renseigner le lien https://wa.me/2250711223344 4. Cliquer sur Ajouter puis Enregistrer | Le bouton social WhatsApp s'affiche avec l'icone de bulle de message MessageCircle et le lien exact wa.me. | [ ] OK [ ] NA |
| 4.4 | P2 | Televersement d'une photo d'avatar de profil | 1. Dans l'editeur de profil, cliquer sur Changer la photo 2. Selectionner une image JPG carree de 500x500 pixels 3. Valider le televersement | L'avatar s'actualise instantanement dans la vignette et l'image est stockee dans le bucket Supabase profiles. | [ ] OK [ ] NA |
| 4.5 | P1 | Rejet d'un identifiant de profil deja utilise par un autre membre | 1. Tenter de creer un nouveau profil avec l'identifiant deja pris jeankouassi 2. Renseigner les autres champs et cliquer sur Enregistrer | Message d'erreur Cet identifiant est deja utilise, veuillez en choisir un autre affiche, la creation est bloquee. | [ ] OK [ ] NA |
| 4.6 | P2 | Activation et desactivation de la section Avis publics | 1. Dans les parametres du profil sur /dashboard/profiles/edit, basculer l'interrupteur sur desactive 2. Cliquer sur le bouton Enregistrer pour sauvegarder 3. Ouvrir l'URL publique https://ofika.ci/jeankouassi dans une fenetre privee | La section des avis n'apparait plus sur la page publique du profil. | [ ] OK [ ] NA |

| Nom du Testeur | Date | Commentaires & Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

## Module 5 : Experience Visiteur, Scan QR et vCard

Pre-requis du module : Profil public configure accessible sur l'URL https://ofika.ci/jeankouassi depuis un navigateur mobile.

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 5.1 | P1 | Chargement public du profil via URL personnalisee | 1. Ouvrir un navigateur en mode navigation privee sans compte connecte 2. Acceder a https://ofika.ci/jeankouassi 3. Verifier les elements affiches | La page charge sans erreur, affiche le nom Jean Kouassi Consultant, la biographie, la photo et les boutons sociaux. | [ ] OK [ ] NA |
| 5.2 | P1 | Telechargement du fichier de contact vCard 3.0 | 1. Sur la page publique https://ofika.ci/jeankouassi, cliquer sur le bouton Enregistrer le contact 2. Observer le comportement du navigateur | Declenchement immediat du telechargement d'un fichier nomme jeankouassi.vcf contenant le nom complet et le telephone. | [ ] OK [ ] NA |
| 5.3 | P1 | Soumission du formulaire d'echange de contact par le visiteur | 1. Sur la page https://ofika.ci/jeankouassi, cliquer sur Echanger 2. Renseigner le nom Visiteur Partenaire 3. Saisir le telephone +225 01 02 03 04 05 4. Saisir l'e-mail partenaire@afrique.ci 5. Cliquer sur Envoyer mes coordonnees | Message de confirmation Coordonnees envoyees avec succes affiche, contact enregistre dans la base de l'utilisateur. | [ ] OK [ ] NA |
| 5.4 | P2 | Rejet du formulaire d'echange sans nom ni telephone | 1. Ouvrir le formulaire d'echange 2. Laisser le nom et le telephone vides 3. Cliquer sur Envoyer mes coordonnees | Messages d'erreur Le nom est requis et Le telephone est requis affiches, le formulaire n'est pas expedie. | [ ] OK [ ] NA |
| 5.5 | P2 | Redirection fluide lors d'un scan de QR Code raccourci | 1. Acceder a une URL de scan raccourcie de type https://ofika.ci/qr/demo123 2. Observer les redirections effectuees par le serveur | Redirection transparente en code HTTP 302 ou 307 vers l'URL cible du profil sans page blanche intermediaire. | [ ] OK [ ] NA |
| 5.6 | P2 | Consultation d'un profil inexistant ou supprime | 1. Tenter d'acceder a une URL de profil fantome https://ofika.ci/profil-introuvable-999999 2. Observer la reponse affichee | Affichage d'un ecran clair Profil non trouve avec un bouton permettant de retourner a la page d'accueil d'Ofika. | [ ] OK [ ] NA |

| Nom du Testeur | Date | Commentaires & Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

## Module 6 : Espace Administration et Suivi des Commandes

Pre-requis du module : Connexion etablie avec le compte admin@ofika.com sur https://ofika.ci/dashboard/admin.

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 6.1 | P1 | Affichage de la liste complete des commandes clients | 1. Acceder a https://ofika.ci/dashboard/admin/orders 2. Observer le tableau de synthese des commandes 3. Verifier la presence des colonnes | Le tableau presente les colonnes Numero de commande, Client, Date, Montant, Statut de paiement et Statut logistique. | [ ] OK [ ] NA |
| 6.2 | P1 | Modification du statut logistique d'une commande validee | 1. Dans la liste des commandes, selectionner une commande dont le paiement est confirme 2. Ouvrir le menu deroulant de statut de livraison 3. Changer le statut de En attente a En cours de livraison 4. Valider le changement | Le statut s'actualise a En cours de livraison dans la base de donnees et une notification est enregistree pour le client. | [ ] OK [ ] NA |
| 6.3 | P2 | Activation et desactivation d'une passerelle de paiement | 1. Acceder a https://ofika.ci/dashboard/admin/settings ou onglet Passerelles 2. Basculer l'interrupteur Wave sur Desactive 3. Enregistrer les parametres 4. Ouvrir la page de commande /order/create dans un onglet anonyme | L'option de paiement Wave n'apparait plus dans la liste des methodes selectionnables par les clients. | [ ] OK [ ] NA |
| 6.4 | P2 | Verification et approbation manuelle d'un recu de virement Wave | 1. Dans l'espace admin des commandes, filtrer les commandes avec mode de paiement Wave 2. Cliquer sur Voir le recu pour inspecter le justificatif televerse 3. Cliquer sur le bouton Valider le paiement | Le statut de paiement passe a paye et la commande est transmise pour preparation logistique. | [ ] OK [ ] NA |
| 6.5 | P1 | Modération et masquage d'un avis public inapproprié | 1. Acceder a la section Moderation des avis dans le panneau administrateur 2. Selectionner un avis signale 3. Cliquer sur Rejeter et masquer 4. Consulter le profil public concerne | L'avis disparait immediatement du profil public et son statut passe a rejete dans la table des avis. | [ ] OK [ ] NA |

| Nom du Testeur | Date | Commentaires & Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

## Module 7 : Parcours de Bout en Bout Multi-Roles

Pre-requis du module : Environnement de staging connecte avec acces administrateur et client mobile. A EXECUTER UNIQUEMENT EN STAGING.

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 7.1 | P1 | Cycle complet : Commande client puis traitement administrateur | 1. Passer une commande de carte NFC en tant qu'acheteur invite sur /order/create avec le telephone +225 07 20 20 20 20 2. Finaliser le paiement en mode test GeniusPay 3. Se connecter sur le compte admin@ofika.com 4. Retrouver la commande dans le tableau admin et passer le statut a Livree | La commande apparait avec le montant exact de 14 600 XOF, statut paye, puis son statut logistique passe a Livree sans erreur. | [ ] OK [ ] NA |
| 7.2 | P1 | Cycle complet : Creation de profil, scan visiteur et capture de lead | 1. Creer un profil professionnel au nom de Dr Amani sur le compte user1@test-ofika.com 2. Ouvrir le profil public /dramani depuis un smartphone de test 3. Cliquer sur Echanger et soumettre les coordonnees du visiteur Paul 4. Retourner sur le dashboard de user1@test-ofika.com dans l'onglet Contacts | Le contact Paul avec son numero de telephone apparait immediatement dans le carnet de contacts du dashboard avec date du jour. | [ ] OK [ ] NA |
| 7.3 | P2 | Cycle complet : Commande directe sans profil prealable | 1. Visiter /order/create avec un nouveau compte sans carte ni profil crees 2. Verifier l'etape de selection de carte sans blocage 3. Saisir les coordonnees de livraison et payer | Le tunnel autorise la commande sans message de blocage, la carte est preparee et pourra etre configuree a la reception. | [ ] OK [ ] NA |

| Nom du Testeur | Date | Commentaires & Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

## Module 8 : Tests Transverses Mobile, Securite et Accessibilite

Pre-requis du module : Outils d'inspection et navigateurs mobiles (iOS Safari, Android Chrome).

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 8.1 | P1 | Declenchement de la protection Rate Limiting contre les requetes abusives | 1. Envoyer plus de 6 requetes de creation de commande successives en moins de 30 secondes depuis la meme adresse IP 2. Analyser la reponse de la 6e requete | Reponse avec code d'etat HTTP 429 Trop de requetes et en-tete Retry-After present, le serveur protege ses ressources. | [ ] OK [ ] NA |
| 8.2 | P2 | Ergonomie mobile et dimension des cibles tactiles superieure a 44px | 1. Ouvrir le tunnel de commande et les profils sur un ecran de smartphone de largeur 375 pixels 2. Verifier la hauteur des boutons d'action principaux et de paiement | Tous les boutons d'action cliquables mesurent au minimum 44 pixels de hauteur, faciles a actionner au pouce. | [ ] OK [ ] NA |
| 8.3 | P2 | Lisibilite et contraste visuel du template sombre selon la norme WCAG AA | 1. Ouvrir un profil utilisant le template LinkInBioDesign7 2. Verifier la couleur des textes de biographie, initiales et boutons 3. Mesurer le ratio de contraste sur le fond sombre | Les textes sont ecrits en blanc ou gris clair sur fond sombre avec un ratio de contraste superieur a 4.5 pour 1. | [ ] OK [ ] NA |
| 8.4 | P2 | Absence de fuite de donnees privees dans les en-tetes HTTP et le DOM | 1. Inspecter le code source HTML et les requetes reseau sur la page d'accueil https://ofika.ci et /jeankouassi 2. Rechercher les chaines «secret», «vapid_private» ou «service_role» | Aucune cle privee, aucun token secret ni information bancaire ne figure dans le DOM ou les scripts clients. | [ ] OK [ ] NA |
| 8.5 | P2 | Navigation au clavier et accessibilite sans souris | 1. Naviguer sur le formulaire de commande /order/create uniquement avec la touche «Tab» et «Entree» 2. Remplir le champ «Nom complet» et basculer sur le champ suivant | Le focus visuel est clairement visible sur chaque champ actif, la soumission au clavier est fonctionnelle. | [ ] OK [ ] NA |

| Nom du Testeur | Date | Commentaires & Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

## Matrice de couverture

| Module | Tests | dont P1 | Fonctionnalites couvertes |
| :--- | :---: | :---: | :--- |
| Module 1 : Authentification et Droits d'acces | 6 | 2 | Connexion, mot de passe errone, inscription, doublon email, reset mdp, garde de route admin |
| Module 2 : Tunnel de Commande et Saisie de Livraison | 7 | 4 | Saisie nominale, validation telephone obligatoire, controle format, email facultatif, calcul prix serveur, persistance formulaire |
| Module 3 : Paiements Mobile Money GeniusPay et Wave | 6 | 3 | Redirection guichet GeniusPay, webhook de confirmation, annulation client, affichage Wave, televersement recu, filtre taille/format |
| Module 4 : Profil Link-in-Bio et Personnalisation | 6 | 2 | Creation de profil, assignation template Design 7, lien WhatsApp avec MessageCircle, avatar photo, unicite URL, affichage avis |
| Module 5 : Experience Visiteur, Scan QR et vCard | 6 | 3 | Affichage public mobile, telechargement .vcf, formulaire d'echange de contact, controle champs obligatoires, redirection QR, page 404 |
| Module 6 : Espace Administration et Suivi des Commandes | 5 | 2 | Liste des commandes, changement statut livraison, activation/desactivation passerelles, validation recu Wave, moderation avis |
| Module 7 : Parcours de Bout en Bout Multi-Roles | 3 | 2 | Commande vers livraison admin, creation profil vers capture de contact, commande directe sans carte prealable |
| Module 8 : Tests Transverses Mobile, Securite et Accessibilite | 5 | 1 | Protection Rate Limiting HTTP 429, cibles tactiles 44px, contraste WCAG AA Design 7, etancheite des secrets, navigation clavier |
| **TOTAL** | **44** | **19** | **Couverture complete des 8 modules cles de la plateforme** |

## Annexe : Ecarts et recommandations sectorielles

- Gestion multi-entrepots et inventaire physique en temps reel : Non implementee. Le modele economique d'Ofika repose sur l'encodage et l'impression a la demande des cartes NFC, ce qui ne necessite pas de gestion de rupture de stock complexe a ce stade.
- Generation automatique de facture fiscale PDF televariable : Actuellement, un recu detaille avec numero de commande unique et recapitulatif est affiche. Il est recommande pour la phase de passage a l'echelle B2B d'ajouter un bouton de telechargement direct de facture PDF certifiee.
- Authentification a deux facteurs (2FA/MFA) obligatoire pour l'ensemble des administrateurs : Un composant d'activation MFA existe dans le code source ; son activation systematique et obligatoire sur toutes les adresses du role admin est recommandee avant l'ouverture a des operateurs tiers.
