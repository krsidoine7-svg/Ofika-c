---
name: test-vcard
description: "Tests automatisés de compatibilité et rendu vCard pour différents téléphones (Android, iPhone, Samsung, Huawei)."
---

# 📇 Skill: Test de Compatibilité vCard

## Contexte
La génération de vCard (`.vcf`) pour la fonctionnalité "Ajouter aux contacts" est sensible aux différents systèmes d'exploitation (OS).
- Certains OS exigent `VERSION:3.0`, d'autres `VERSION:2.1`.
- Les accents et caractères spéciaux nécessitent `CHARSET=UTF-8` sur chaque ligne texte pour Android.
- Apple iOS (Safari) a des problèmes si le fichier contient des sauts de ligne manquants ou si les numéros ne sont pas précédés de l'indicatif.

## Objectif
Ce skill permet aux agents d'exécuter une batterie de requêtes HTTP simulées depuis divers terminaux via `curl` pour vérifier que la vCard se télécharge correctement sans erreur côté serveur et que son format reste cohérent.

## Procédure

### 1. Prérequis
Vous devez disposer d'un profil public avec des données de contact (téléphone, email, nom, URL) dans la base de données. Vous pouvez utiliser le script `scripts/create-test-profile.ts` s'il n'existe aucun utilisateur de test.

### 2. Lancement du test
Exécutez le script PowerShell dédié qui effectue 30 itérations en bouclant sur différents `User-Agent`.

```powershell
# Commande à exécuter
.\scripts\test-vcard-compatibility.ps1 -ProfileId "NOM_DU_PROFIL" -Iterations 30
```

### 3. Analyse des résultats
Le script va simuler le comportement :
- `iPhone` (iOS Safari)
- `Samsung Galaxy`
- `Huawei`
- `Google Pixel`

Vérifiez :
1. Que le **temps de réponse** est acceptable (< 500ms idéalement).
2. Qu'il n'y a **aucune Erreur 500**.
3. Que le contenu récupéré commence bien par `BEGIN:VCARD` et contient `END:VCARD`.

## Optimisations vCard Conseillées
Si des bugs d'affichage sont reportés, vérifiez le code de génération côté API (`app/api/contacts/[profileId]/route.ts`) :
1. Ajoutez systématiquement `CHARSET=UTF-8` aux champs textuels : `FN;CHARSET=UTF-8:Jean Dupont`
2. Formatez proprement la base64 des images (les lignes de plus de 75 caractères doivent être pliées selon la norme vCard).
3. Utilisez des retours à la ligne `\r\n` purs, conformes à la norme RFC 2426.
