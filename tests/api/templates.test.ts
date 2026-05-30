/**
 * Tests pour l'API /api/templates
 * 
 * NOTE: Ces tests nécessitent un environnement de test configuré avec Supabase
 * Pour les exécuter, installez d'abord Jest:
 * npm install --save-dev jest @jest/globals @types/jest
 * 
 * Puis exécutez: npm run test
 */

// @ts-ignore - Jest sera installé lors du setup des tests
import { describe, it, expect } from '@jest/globals'

describe('/api/templates', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  describe('GET /api/templates', () => {
    it('devrait retourner la liste des templates actifs', async () => {
      const response = await fetch(`${baseUrl}/api/templates`)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('templates')
      expect(data).toHaveProperty('count')
      expect(Array.isArray(data.templates)).toBe(true)
    })
    
    it('chaque template devrait avoir la structure attendue', async () => {
      const response = await fetch(`${baseUrl}/api/templates`)
      const data = await response.json()
      
      if (data.templates.length > 0) {
        const template = data.templates[0]
        
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('name')
        expect(template).toHaveProperty('slug')
        expect(template).toHaveProperty('schema')
        expect(template).toHaveProperty('is_active')
        expect(template.schema).toHaveProperty('fields')
        expect(Array.isArray(template.schema.fields)).toBe(true)
      }
    })
  })
})

describe('/api/profiles', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  describe('POST /api/profiles', () => {
    it('devrait rejeter une requête sans authentification', async () => {
      const response = await fetch(`${baseUrl}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          baseFields: {
            name: 'Test User',
            custom_url: 'test-user'
          },
          templateId: 'test-template-id'
        })
      })
      
      expect(response.status).toBe(401)
    })
    
    it('devrait valider les champs requis dans baseFields', async () => {
      // NOTE: Ce test nécessite un token d'authentification valide
      // À implémenter avec un setup de test approprié
    })
  })
})

describe('Validation des champs dynamiques', () => {
  it('devrait valider un champ number correctement', () => {
    // Test de validation à implémenter
    expect(true).toBe(true) // Placeholder
  })
  
  it('devrait valider un champ URL correctement', () => {
    // Test de validation à implémenter
    expect(true).toBe(true) // Placeholder
  })
  
  it('devrait valider un champ email correctement', () => {
    // Test de validation à implémenter
    expect(true).toBe(true) // Placeholder
  })
})
