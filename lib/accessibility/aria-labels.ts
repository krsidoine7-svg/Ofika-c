/**
 * Service de gestion des labels ARIA pour l'accessibilité
 */

export class AriaLabels {
  /**
   * Génère des labels ARIA pour les formulaires
   */
  static formLabels = {
    // Authentification
    email: 'Adresse email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    login: 'Se connecter',
    signup: 'S\'inscrire',
    forgotPassword: 'Mot de passe oublié',
    
    // Profils
    fullName: 'Nom complet',
    company: 'Nom de l\'entreprise',
    jobTitle: 'Titre du poste',
    bio: 'Biographie',
    phone: 'Numéro de téléphone',
    location: 'Localisation',
    
    // Réseaux sociaux
    instagram: 'Lien Instagram',
    linkedin: 'Lien LinkedIn',
    website: 'Site web',
    
    // Cartes NFC
    cardDesign: 'Design de la carte',
    colorTheme: 'Thème de couleur',
    logoUpload: 'Télécharger un logo',
    profilePhotoUpload: 'Télécharger une photo de profil',
    
    // Commandes
    shippingAddress: 'Adresse de livraison',
    paymentMethod: 'Méthode de paiement',
    orderSummary: 'Résumé de la commande'
  }

  /**
   * Génère des descriptions ARIA pour les éléments interactifs
   */
  static descriptions = {
    // Boutons
    addToContacts: 'Ajouter ce contact à vos contacts',
    shareProfile: 'Partager ce profil',
    editProfile: 'Modifier ce profil',
    deleteProfile: 'Supprimer ce profil',
    saveChanges: 'Sauvegarder les modifications',
    cancelChanges: 'Annuler les modifications',
    
    // Actions
    uploadImage: 'Cliquez pour télécharger une image',
    selectDesign: 'Sélectionner ce design',
    selectColor: 'Sélectionner cette couleur',
    viewProfile: 'Voir le profil public',
    copyLink: 'Copier le lien',
    downloadQR: 'Télécharger le QR code',
    
    // Navigation
    goBack: 'Retour à la page précédente',
    goNext: 'Aller à l\'étape suivante',
    skipStep: 'Passer cette étape',
    closeModal: 'Fermer cette fenêtre',
    
    // Status
    loading: 'Chargement en cours',
    success: 'Opération réussie',
    error: 'Une erreur s\'est produite',
    warning: 'Attention requise'
  }

  /**
   * Génère des messages d'erreur accessibles
   */
  static errorMessages = {
    required: 'Ce champ est obligatoire',
    invalidEmail: 'Format d\'email invalide',
    invalidPhone: 'Format de téléphone invalide',
    invalidUrl: 'Format d\'URL invalide',
    tooShort: 'Ce champ est trop court',
    tooLong: 'Ce champ est trop long',
    fileTooBig: 'Le fichier est trop volumineux',
    invalidFileType: 'Type de fichier non autorisé',
    networkError: 'Erreur de connexion',
    serverError: 'Erreur du serveur',
    unauthorized: 'Accès non autorisé',
    notFound: 'Ressource non trouvée'
  }

  /**
   * Génère des messages de succès accessibles
   */
  static successMessages = {
    profileCreated: 'Profil créé avec succès',
    profileUpdated: 'Profil mis à jour',
    profileDeleted: 'Profil supprimé',
    cardCreated: 'Carte NFC créée',
    orderPlaced: 'Commande passée',
    paymentSuccess: 'Paiement réussi',
    imageUploaded: 'Image téléchargée',
    linkCopied: 'Lien copié dans le presse-papiers',
    contactAdded: 'Contact ajouté à vos contacts'
  }

  /**
   * Génère des instructions pour les lecteurs d'écran
   */
  static instructions = {
    formRequired: 'Les champs marqués d\'un astérisque (*) sont obligatoires',
    fileUpload: 'Formats acceptés: JPG, PNG, GIF. Taille maximale: 5MB',
    passwordRequirements: 'Le mot de passe doit contenir au moins 8 caractères',
    phoneFormat: 'Format: +33 6 12 34 56 78',
    urlFormat: 'Format: https://exemple.com',
    imageAlt: 'Image de profil ou logo',
    qrCodeAlt: 'Code QR pour partager ce profil',
    loadingAlt: 'Chargement en cours, veuillez patienter'
  }

  /**
   * Génère des labels pour les états de chargement
   */
  static loadingStates = {
    creating: 'Création en cours...',
    updating: 'Mise à jour en cours...',
    deleting: 'Suppression en cours...',
    uploading: 'Téléchargement en cours...',
    processing: 'Traitement en cours...',
    saving: 'Sauvegarde en cours...',
    loading: 'Chargement...',
    searching: 'Recherche en cours...'
  }

  /**
   * Génère des labels pour les notifications
   */
  static notifications = {
    newMessage: 'Nouveau message reçu',
    orderUpdate: 'Mise à jour de commande',
    paymentReceived: 'Paiement reçu',
    profileViewed: 'Profil consulté',
    linkClicked: 'Lien cliqué',
    errorOccurred: 'Une erreur s\'est produite',
    successAction: 'Action réussie',
    warningMessage: 'Message d\'avertissement'
  }

  /**
   * Génère des labels pour les graphiques et visualisations
   */
  static charts = {
    profileViews: 'Graphique des vues de profil',
    linkClicks: 'Graphique des clics sur les liens',
    monthlyStats: 'Statistiques mensuelles',
    yearlyStats: 'Statistiques annuelles',
    revenueChart: 'Graphique des revenus',
    userGrowth: 'Graphique de croissance des utilisateurs',
    clickToView: 'Cliquez pour voir les détails',
    dataPoint: 'Point de données'
  }

  /**
   * Génère des labels pour les modales et overlays
   */
  static modals = {
    confirmDelete: 'Confirmer la suppression',
    editProfile: 'Modifier le profil',
    uploadImage: 'Télécharger une image',
    selectDesign: 'Sélectionner un design',
    paymentForm: 'Formulaire de paiement',
    orderSummary: 'Résumé de la commande',
    settings: 'Paramètres',
    help: 'Aide et support'
  }
}
