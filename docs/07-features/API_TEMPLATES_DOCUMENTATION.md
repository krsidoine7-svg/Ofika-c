# 📚 API Documentation - Système de Templates Dynamiques

## Vue d'ensemble

Cette API permet de gérer les profils avec des templates dynamiques. Chaque template définit des champs spécifiques en plus des champs de base universels.

**Base URL**: `http://localhost:3000/api` (dev) ou `https://votre-domaine.com/api` (prod)

---

## 🔐 Authentification

Toutes les routes (sauf GET /templates) requièrent une authentification via Supabase.

Le token d'authentification est géré automatiquement par Supabase Auth via les cookies.

---

## 📋 Endpoints

### 1. GET /api/templates

Récupère tous les templates actifs.

**Méthode**: `GET`  
**Authentification**: Non requise  
**Headers**: Aucun

**Response 200 OK**:
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Design Influenceur",
      "slug": "influencer",
      "description": "Optimisé pour créateurs de contenu",
      "category": "influencer",
      "priority_label": "Tendance",
      "target_audience": "Influenceurs & Créateurs",
      "features": ["Mise en avant réseaux sociaux", "..."],
      "stats": {
        "users": "15%",
        "satisfaction": "4.8/5",
        "conversion": "+18%"
      },
      "schema": {
        "fields": [
          {
            "name": "instagram_followers",
            "type": "number",
            "label": "Followers Instagram",
            "required": false,
            "min": 0,
            "import_source": "instagram_oauth"
          }
        ]
      },
      "version": 1,
      "is_active": true,
      "created_at": "2025-01-05T10:00:00Z",
      "updated_at": "2025-01-05T10:00:00Z"
    }
  ],
  "count": 8
}
```

**Exemple cURL**:
```bash
curl -X GET http://localhost:3000/api/templates
```

---

### 2. GET /api/templates/[slug]

Récupère un template spécifique par son slug.

**Méthode**: `GET`  
**Authentification**: Non requise

**Parameters**:
- `slug` (path): Slug du template (ex: `influencer`, `design1`, `ecommerce`)

**Response 200 OK**:
```json
{
  "template": {
    "id": "uuid",
    "name": "Design Influenceur",
    "slug": "influencer",
    "schema": { ... },
    ...
  }
}
```

**Response 404 Not Found**:
```json
{
  "error": "Template non trouvé"
}
```

**Exemple cURL**:
```bash
curl -X GET http://localhost:3000/api/templates/influencer
```

---

### 3. POST /api/profiles

Crée un nouveau profil avec des données de template.

**Méthode**: `POST`  
**Authentification**: **Requise**  
**Content-Type**: `application/json`

**Body**:
```json
{
  "baseFields": {
    "name": "John Doe",
    "bio": "Influenceur lifestyle",
    "email": "john@example.com",
    "phone": "+33612345678",
    "custom_url": "johndoe",
    "is_public": true,
    "whatsapp": "+33612345678",
    "instagram": "@johndoe",
    "website": "https://johndoe.com"
  },
  "templateId": "uuid-du-template",
  "templateFields": {
    "instagram_followers": 10000,
    "tiktok_followers": 5000,
    "content_category": "Lifestyle",
    "collaboration_email": "collab@johndoe.com"
  }
}
```

**Response 201 Created**:
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "John Doe",
    "bio": "Influenceur lifestyle",
    "custom_url": "johndoe",
    "username": "johndoe",
    "design_choice": "influencer",
    "template": { ... },
    "template_fields": {
      "instagram_followers": 10000,
      ...
    },
    "created_at": "2025-01-05T12:00:00Z"
  }
}
```

**Response 400 Bad Request**:
```json
{
  "error": "Validation des champs de base échouée",
  "details": [
    {
      "field": "name",
      "message": "Le nom doit contenir au moins 2 caractères"
    }
  ]
}
```

**Response 409 Conflict**:
```json
{
  "error": "Cette URL personnalisée est déjà utilisée"
}
```

**Exemple cURL**:
```bash
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "baseFields": {
      "name": "John Doe",
      "custom_url": "johndoe"
    },
    "templateId": "template-uuid",
    "templateFields": {
      "instagram_followers": 10000
    }
  }'
```

---

### 4. GET /api/profiles/[id]

Récupère un profil avec ses données de template.

**Méthode**: `GET`  
**Authentification**: **Requise**

**Parameters**:
- `id` (path): UUID du profil

**Response 200 OK**:
```json
{
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "John Doe",
    "bio": "...",
    "custom_url": "johndoe",
    "design_choice": "influencer",
    "template": {
      "id": "uuid",
      "name": "Design Influenceur",
      "slug": "influencer",
      "schema": { ... }
    },
    "template_data": {
      "id": "uuid",
      "profile_id": "uuid",
      "template_id": "uuid",
      "fields": {
        "instagram_followers": 10000,
        "tiktok_followers": 5000
      },
      "metadata": {},
      "created_at": "...",
      "updated_at": "..."
    },
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Response 404 Not Found**:
```json
{
  "error": "Profil non trouvé"
}
```

**Exemple cURL**:
```bash
curl -X GET http://localhost:3000/api/profiles/votre-profile-uuid
```

---

### 5. PUT /api/profiles/[id]

Met à jour un profil et/ou ses données de template.

**Méthode**: `PUT`  
**Authentification**: **Requise**  
**Content-Type**: `application/json`

**Parameters**:
- `id` (path): UUID du profil

**Body** (tous les champs sont optionnels):
```json
{
  "baseFields": {
    "name": "John Doe Updated",
    "bio": "Nouvelle bio",
    "instagram": "@johndoe_official"
  },
  "templateFields": {
    "instagram_followers": 15000,
    "content_category": "Fashion"
  }
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "name": "John Doe Updated",
    ...
  },
  "changed_fields": [
    "name",
    "bio",
    "instagram",
    "template.instagram_followers",
    "template.content_category"
  ]
}
```

**Response 400 Bad Request**:
```json
{
  "error": "Validation des champs du template échouée",
  "details": [ ... ]
}
```

**Response 404 Not Found**:
```json
{
  "error": "Profil non trouvé ou non autorisé"
}
```

**Exemple cURL**:
```bash
curl -X PUT http://localhost:3000/api/profiles/votre-profile-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "baseFields": {
      "name": "John Doe Updated"
    },
    "templateFields": {
      "instagram_followers": 15000
    }
  }'
```

---

### 6. DELETE /api/profiles/[id]

Supprime un profil (soft delete).

**Méthode**: `DELETE`  
**Authentification**: **Requise**

**Parameters**:
- `id` (path): UUID du profil

**Response 200 OK**:
```json
{
  "success": true
}
```

**Response 404 Not Found**:
```json
{
  "error": "Profil non trouvé ou non autorisé"
}
```

**Exemple cURL**:
```bash
curl -X DELETE http://localhost:3000/api/profiles/votre-profile-uuid
```

---

## 📊 Codes d'Erreur

| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée avec succès |
| 400 | Bad Request | Validation échouée ou paramètres invalides |
| 401 | Unauthorized | Authentification requise |
| 404 | Not Found | Ressource non trouvée |
| 409 | Conflict | Conflit (ex: URL déjà prise) |
| 500 | Internal Server Error | Erreur serveur |

---

## 🔍 Exemples Complets

### Créer un Profil Freelance

```bash
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "baseFields": {
      "name": "Marie Dupont",
      "bio": "Développeuse Full Stack passionnée",
      "email": "marie@dupont.dev",
      "phone": "+33687654321",
      "custom_url": "marie-dupont",
      "website": "https://mariedupont.dev",
      "linkedin": "https://linkedin.com/in/mariedupont"
    },
    "templateId": "freelance-template-uuid",
    "templateFields": {
      "services_offered": "Développement web, Design UX/UI, Consulting",
      "hourly_rate": "80-120€/h",
      "years_experience": 5,
      "clients_count": 25,
      "projects_completed": 50,
      "availability": "Disponible sous 1 semaine"
    }
  }'
```

### Créer un Profil E-commerce

```bash
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "baseFields": {
      "name": "Boutique Afrique Style",
      "bio": "Vêtements africains authentiques et modernes",
      "email": "contact@afriquestyle.com",
      "phone": "+225 07 12 34 56 78",
      "custom_url": "afrique-style",
      "whatsapp": "+225 07 12 34 56 78",
      "instagram": "@afriquestyle",
      "facebook": "https://facebook.com/afriquestyle"
    },
    "templateId": "ecommerce-template-uuid",
    "templateFields": {
      "store_url": "https://afriquestyle.com/boutique",
      "product_categories": "Vêtements, Accessoires, Bijoux, Déco",
      "payment_methods": "Mobile Money (Orange, MTN), Carte bancaire, PayPal",
      "shipping_countries": "Côte d'Ivoire, Sénégal, Mali, Burkina Faso, France",
      "whatsapp_order": "+225 07 12 34 56 78"
    }
  }'
```

### Mettre à Jour les Métriques d'un Influenceur

```bash
curl -X PUT http://localhost:3000/api/profiles/profile-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "templateFields": {
      "instagram_followers": 25000,
      "tiktok_followers": 15000,
      "youtube_subscribers": 8000
    }
  }'
```

---

## 🧪 Tests avec Postman/Insomnia

### Collection Postman

Importez cette collection dans Postman :

```json
{
  "info": {
    "name": "API Templates Dynamiques",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Templates",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/templates"
      }
    },
    {
      "name": "Get Template by Slug",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/templates/influencer"
      }
    },
    {
      "name": "Create Profile",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/profiles",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"baseFields\": {\n    \"name\": \"Test User\",\n    \"custom_url\": \"test-user\"\n  },\n  \"templateId\": \"template-uuid\",\n  \"templateFields\": {}\n}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

## 🚀 Prochaines Étapes

- [ ] Implémenter OAuth pour import automatique de métriques
- [ ] Ajouter endpoint pour changer de template
- [ ] Ajouter endpoint pour dupliquer un profil
- [ ] Implémenter la recherche de profils
- [ ] Ajouter pagination pour les listes
- [ ] Implémenter webhooks pour événements

---

**Date**: 2025-01-05  
**Version**: 1.0.0  
**Auteur**: Cascade AI
