# 🔌 Spécifications des APIs - Ofika

> **Documentation complète des APIs et endpoints**  
> *Version 1.0 - Janvier 2025*

---

## 📋 Table des Matières

- [Vue d'ensemble des APIs](#-vue-densemble-des-apis)
- [Authentification](#-authentification)
- [API Utilisateurs](#-api-utilisateurs)
- [API Cartes](#-api-cartes)
- [API Paiements](#-api-paiements)
- [API Profils](#-api-profils)
- [API Analytics](#-api-analytics)
- [Gestion des Erreurs](#-gestion-des-erreurs)

---

## 🎯 Vue d'ensemble des APIs

### Architecture API

L'API Ofika suit les principes REST avec une approche moderne utilisant tRPC pour la type-safety entre le frontend et le backend.

#### **Base URL**
- **Production** : `https://api.ofika.app/v1`
- **Staging** : `https://api-staging.ofika.app/v1`
- **Développement** : `http://localhost:3001/api/v1`

#### **Format des Réponses**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### **Codes de Statut HTTP**
- **200** : Succès
- **201** : Créé
- **400** : Requête invalide
- **401** : Non authentifié
- **403** : Non autorisé
- **404** : Non trouvé
- **429** : Trop de requêtes
- **500** : Erreur serveur

---

## 🔐 Authentification

### Endpoints d'Authentification

#### **POST /auth/register**
Création d'un nouveau compte utilisateur

**Requête**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+233123456789",
  "country": "GH"
}
```

**Réponse**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "country": "GH"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

#### **POST /auth/login**
Connexion d'un utilisateur

**Requête**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Réponse**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

#### **POST /auth/refresh**
Renouvellement du token d'accès

**Requête**
```json
{
  "refreshToken": "refresh_token"
}
```

#### **POST /auth/logout**
Déconnexion d'un utilisateur

**Headers**
```
Authorization: Bearer <access_token>
```

### Gestion des Tokens

#### **JWT Access Token**
- **Durée de vie** : 15 minutes
- **Algorithme** : HS256
- **Payload** : user_id, email, roles, permissions

#### **Refresh Token**
- **Durée de vie** : 7 jours
- **Stockage** : Base de données avec hash
- **Rotation** : Nouveau token à chaque utilisation

---

##  API Utilisateurs

### Gestion des Profils

#### **GET /users/profile**
Récupération du profil utilisateur

**Headers**
```
Authorization: Bearer <access_token>
```

**Réponse**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+233123456789",
    "country": "GH",
    "emailVerified": true,
    "phoneVerified": false,
    "createdAt": "2025-01-15T10:30:00Z",
    "profile": {
      "id": "uuid",
      "username": "john-doe",
      "displayName": "John Doe",
      "company": "Acme Corp",
      "jobTitle": "Developer",
      "bio": "Passionate developer...",
      "logoUrl": "https://cdn.ofika.app/logos/uuid.png",
      "theme": "classic",
      "isPublic": true
    }
  }
}
```

#### **PUT /users/profile**
Mise à jour du profil utilisateur

**Headers**
```
Authorization: Bearer <access_token>
```

**Requête**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+233123456789",
  "country": "GH"
}
```

#### **DELETE /users/account**
Suppression du compte utilisateur

**Headers**
```
Authorization: Bearer <access_token>
```

**Requête**
```json
{
  "password": "SecurePassword123!",
  "confirmation": "DELETE"
}
```

---

##  API Cartes

### Simulation de Cartes

#### **POST /cards/simulate**
Simulation d'une carte personnalisée

**Requête**
```json
{
  "name": "John Doe",
  "company": "Acme Corporation",
  "jobTitle": "Senior Developer",
  "logo": "base64_image_data",
  "email": "john@acme.com"
}
```

**Réponse**
```json
{
  "success": true,
  "data": {
    "preview": {
      "front": {
        "logo": "data:image/png;base64,...",
        "name": "John Doe",
        "jobTitle": "Senior Developer",
        "company": "Acme Corporation"
      },
      "back": {
        "qrCode": "data:image/png;base64,...",
        "instruction": "Scan to connect"
      }
    },
    "estimatedPrice": {
      "currency": "USD",
      "amount": 12.00
    }
  }
}
```

### Personnalisation

#### **POST /cards/customize**
Personnalisation avancée d'une carte

**Requête**
```json
{
  "design": {
    "logo": {
      "url": "https://cdn.ofika.app/logos/uuid.png",
      "position": "top-center",
      "size": "medium"
    },
    "text": {
      "alignment": "center",
      "fontFamily": "Inter",
      "fontSize": "medium"
    },
    "colors": {
      "primary": "#000000",
      "secondary": "#666666",
      "accent": "#d2691e"
    }
  },
  "quantity": 1
}
```

### Commandes

#### **POST /cards/orders**
Création d'une commande de cartes

**Headers**
```
Authorization: Bearer <access_token>
```

**Requête**
```json
{
  "design": { ... },
  "quantity": 1,
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Accra",
    "state": "Greater Accra",
    "postalCode": "00233",
    "country": "GH"
  }
}
```

**Réponse**
```json
{
  "success": true,
  "data": {
    "orderId": "OF-2025-001234",
    "status": "pending",
    "totalAmount": 12.00,
    "currency": "USD",
    "estimatedDelivery": "2025-01-29",
    "paymentUrl": "https://pay.ofika.app/OF-2025-001234"
  }
}
```

#### **GET /cards/orders**
Liste des commandes de l'utilisateur

**Headers**
```
Authorization: Bearer <access_token>
```

---

##  API Paiements

### Intégration des Gateways

#### **Paystack**
- **Intégration** : `POST /payments/paystack/webhook`
- **Webhook** : `POST /payments/paystack/webhook`
- **API** : `POST /payments/paystack/charge`

#### **Flutterwave**
- **Intégration** : `POST /payments/flutterwave/webhook`
- **Webhook** : `POST /payments/flutterwave/webhook`
- **API** : `POST /payments/flutterwave/charge`

#### **Orange Money**
- **Intégration** : `POST /payments/orange-money/webhook`
- **Webhook** : `POST /payments/orange-money/webhook`
- **API** : `POST /payments/orange-money/charge`

#### **MTN Money**
- **Intégration** : `POST /payments/mtn-money/webhook`
- **Webhook** : `POST /payments/mtn-money/webhook`
- **API** : `POST /payments/mtn-money/charge`

### Gestion des Transactions

#### **POST /payments/charge**
Création d'une transaction

**Headers**
```
Authorization: Bearer <access_token>
```

**Requête**
```json
{
  "amount": 100.00,
  "currency": "USD",
  "source": "payment_token",
```

**Réponse**
```json
{
  "success": true,
  "data": {
    "transactionId": "TX-2025-001234",
    "status": "completed",
    "amount": 100.00,
    "currency": "USD",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

#### **GET /payments/transactions**
Liste des transactions de l'utilisateur

**Headers**
```
Authorization: Bearer <access_token>
```

---

##  API Profils

### Gestion des Profils Link-in-Bio

#### **GET /profiles/:username**
Récupération d'un profil public

**Headers**
```
Authorization: Bearer <access_token>
```

**Réponse**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "john-doe",
    "displayName": "John Doe",
    "company": "Acme Corp",
    "jobTitle": "Developer",
    "bio": "Passionate developer...",
    "logoUrl": "https://cdn.ofika.app/logos/uuid.png",
    "photoUrl": "https://cdn.ofika.app/photos/uuid.jpg",
    "theme": "classic",
    "accentColor": "#000000",
    "isPublic": true,
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "socialLinks": [
      {
        "id": "uuid",
        "platform": "linkedin",
        "url": "https://linkedin.com/in/john-doe",
        "displayName": "LinkedIn",
        "iconUrl": "https://cdn.ofika.app/icons/linkedin.svg",
        "orderIndex": 1,
        "isActive": true
      }
    ]
  }
}
```

#### **POST /profiles/vcard**
Génération d'un vCard

**Headers**
```
Authorization: Bearer <access_token>
```

**Requête**
```json
{
  "username": "john-doe"
}
```

**Réponse**
```json
{
  "success": true,
  "data": {
    "vcard": "BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\nFN:John Doe\nORG:Acme Corp\nTITLE:Developer\nTEL;TYPE=WORK,VOICE:+233123456789\nEMAIL;TYPE=WORK,INTERNET:john@acme.com\nURL;TYPE=WORK:https://ofika.app/john-doe\nEND:VCARD"
  }
}
```

### Gestion des Partages

#### **POST /profiles/share**
Partage d'un profil

**Headers**
```
Authorization: Bearer <access_token>
```

**Requête**
```json
{
  "username": "john-doe",
  "message": "Check out my link-in-bio!"
}
```

**Réponse**
```json
{
  "success": true,
  "data": {
    "shareUrl": "https://ofika.app/share/john-doe"
  }
}
```

---

##  API Analytics

### Enregistrement des Événements

#### **POST /analytics/events**
Enregistrement d'un événement d'analytics

**Headers**
```
Authorization: Bearer <access_token>
```

**Requête**
```json
{
  "profile_id": "uuid",
  "event_type": "profile_view",
  "event_data": {
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "country": "GH",
    "city": "Accra",
    "device_type": "desktop",
    "browser": "Chrome",
    "os": "Windows",
    "referrer": "https://ofika.app/john-doe"
  }
}
```

#### **GET /analytics/events**
Récupération des événements d'analytics d'un profil

**Headers**
```
Authorization: Bearer <access_token>
```

---

## 🚀 Gestion des Erreurs

### Codes d'Erreur

#### **400 Bad Request**
- **Invalid JSON** : JSON invalide
- **Missing Field** : Champ manquant
- **Invalid Value** : Valeur invalide
- **Duplicate Entry** : Entrée déjà existante

#### **401 Unauthorized**
- **Invalid Token** : Token JWT invalide ou expiré
- **Missing Token** : Token JWT manquant

#### **403 Forbidden**
- **Insufficient Permissions** : Permissions insuffisantes
- **Invalid Refresh Token** : Token de renouvellement invalide

#### **404 Not Found**
- **Resource Not Found** : Ressource non trouvée
- **Profile Not Found** : Profil public non trouvé
- **Order Not Found** : Commande non trouvée
- **Transaction Not Found** : Transaction non trouvée

#### **429 Too Many Requests**
- **Rate Limit Exceeded** : Limite de taux dépassée

#### **500 Internal Server Error**
- **Database Error** : Erreur de base de données
- **External Service Error** : Erreur de service externe (Wave, Paystack, etc.)
- **Unexpected Error** : Erreur inattendue

---

## 🎯 Conclusion

L'architecture technique d'Ofika est conçue pour être **moderne, scalable et sécurisée**, avec un focus particulier sur les **performances mobiles** et l'**adaptation au marché africain**.

**Points clés** :
- **Microservices** pour la scalabilité
- **Mobile-first** pour l'Afrique
- **Cloud-native** pour la fiabilité
- **Sécurité intégrée** dès la conception
- **Monitoring complet** pour la maintenance

**Prochaines étapes** :
- Mise en place de l'infrastructure
- Développement des services core
- Tests de performance et sécurité
- Déploiement progressif

---

*Document révisé : Janvier 2025*  
*Prochaine révision : Avril 2025*
```

