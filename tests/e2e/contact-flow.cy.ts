/// <reference types="cypress" />

describe('Contact Management with RGPD Flow', () => {
  beforeEach(() => {
    // Visiter la page de connexion
    cy.visit('/login')
    
    // Connexion
    cy.get('input[type="email"]').type('test@ofika.com')
    cy.get('input[type="password"]').type('testpassword123')
    cy.get('button[type="submit"]').click()
    
    // Attendre la redirection
    cy.url().should('include', '/dashboard')
  })

  it('E2E-001: Devrait afficher le modal RGPD au premier login', () => {
    // Vérifier que le modal RGPD s'affiche
    cy.contains('Protection de vos données (RGPD)').should('be.visible')
    
    // Vérifier que le stockage des données est cochable
    cy.get('input#data-storage').should('exist')
    
    // Accepter le consentement obligatoire
    cy.get('input#data-storage').check()
    cy.contains('Confirmer mes choix').click()
    
    // Vérifier que le modal se ferme
    cy.contains('Protection de vos données').should('not.exist')
  })

  it('E2E-002: Devrait créer un contact avec emojis', () => {
    // Accepter RGPD
    cy.get('input#data-storage').check()
    cy.contains('Confirmer mes choix').click()
    
    // Naviguer vers contacts
    cy.contains('Contacts').click()
    cy.url().should('include', '/contacts')
    
    // Créer un nouveau contact
    cy.contains('Nouveau contact').click()
    
    // Remplir le formulaire
    cy.get('input[name="name"]').type('Jean Dupont')
    cy.get('input[name="email"]').type('jean.dupont@example.com')
    cy.get('input[name="phone"]').type('+225 01 02 03 04 05')
    cy.get('input[name="company"]').type('Ofika SaaS')
    
    // Ouvrir le sélecteur d'emojis
    cy.contains('Ajouter émotions').click()
    
    // Sélectionner 3 emojis
    cy.get('button').contains('😊').click()
    cy.get('button').contains('💼').click()
    cy.get('button').contains('🔥').click()
    
    // Vérifier que 3 emojis sont sélectionnés
    cy.contains('3/5 émojis sélectionnés').should('be.visible')
    
    // Fermer le modal emojis
    cy.get('body').type('{esc}')
    
    // Enregistrer le contact
    cy.contains('Enregistrer').click()
    
    // Vérifier le message de succès
    cy.contains('Contact créé avec succès').should('be.visible')
    
    // Vérifier que le contact apparaît dans la liste
    cy.contains('Jean Dupont').should('be.visible')
  })

  it('E2E-003: Devrait activer les notifications push', () => {
    // Accepter RGPD avec notifications
    cy.get('input#data-storage').check()
    cy.get('input#push-notifs').check()
    cy.contains('Confirmer mes choix').click()
    
    // Naviguer vers paramètres
    cy.contains('Paramètres').click()
    
    // Activer les notifications
    cy.contains('Activer les rappels hebdo').click()
    
    // Accepter les permissions du navigateur (stubbed)
    cy.window().then((win: { Notification: any }) => {
      (cy as any).stub(win.Notification, 'requestPermission').resolves('granted')
    })
    
    // Vérifier le message de succès
    cy.contains('Notifications activées', { timeout: 5000 }).should('be.visible')
  })

  it('E2E-004: Devrait détecter les contacts oubliés', () => {
    // Accepter RGPD
    cy.get('input#data-storage').check()
    cy.contains('Confirmer mes choix').click()
    
    // Créer un contact
    cy.contains('Nouveau contact').click()
    cy.get('input[name="name"]').type('Contact Ancien')
    cy.get('input[name="email"]').type('ancien@example.com')
    cy.contains('Enregistrer').click()
    
    // Simuler 8 jours d'inactivité (via API mock)
    cy.request('POST', '/api/test/simulate-old-contact', {
      contactId: 'test-contact-id',
      daysAgo: 8
    })
    
    // Vérifier que le contact apparaît dans les oubliés
    cy.contains('Contacts oubliés').click()
    cy.contains('Contact Ancien').should('be.visible')
    cy.contains('8 jours').should('be.visible')
  })

  it('E2E-005: Devrait valider et sanitizer les inputs', () => {
    // Accepter RGPD
    cy.get('input#data-storage').check()
    cy.contains('Confirmer mes choix').click()
    
    // Essayer d'injecter du code XSS
    cy.contains('Nouveau contact').click()
    cy.get('input[name="name"]').type('<script>alert("XSS")</script>')
    cy.get('input[name="email"]').type('test@example.com')
    cy.contains('Enregistrer').click()
    
    // Vérifier l'erreur de validation
    cy.contains('Le nom contient des caractères invalides').should('be.visible')
    
    // Corriger avec un nom valide
    cy.get('input[name="name"]').clear()
    cy.get('input[name="name"]').type('Jean-Paul O\'Brien')
    cy.contains('Enregistrer').click()
    
    // Vérifier le succès
    cy.contains('Contact créé').should('be.visible')
    
    // Vérifier que le script n'est pas exécuté
    cy.get('body').should('not.contain', 'alert')
  })

  it('E2E-006: Devrait gérer le consentement RGPD modifiable', () => {
    // Accepter RGPD initial
    cy.get('input#data-storage').check()
    cy.contains('Confirmer mes choix').click()
    
    // Naviguer vers paramètres
    cy.contains('Paramètres').click()
    cy.contains('Confidentialité').click()
    
    // Modifier le consentement
    cy.get('input#push-notifs').check()
    cy.get('input#analytics').check()
    cy.contains('Enregistrer les préférences').click()
    
    // Vérifier le succès
    cy.contains('Préférences mises à jour').should('be.visible')
    
    // Rafraîchir et vérifier la persistance
    cy.reload()
    cy.get('input#push-notifs').should('be.checked')
    cy.get('input#analytics').should('be.checked')
  })
})
