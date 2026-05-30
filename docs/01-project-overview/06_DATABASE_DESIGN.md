# 🗄️ Conception de Base de Données - Ofika

> **Schéma de base de données et modélisation des données**  
> *Version 1.0 - Janvier 2025*

---

## 📋 Table des Matières

- [Vue d'ensemble du Schéma](#-vue-densemble-du-schéma)
- [Tables Principales](#-tables-principales)
- [Relations et Contraintes](#-relations-et-contraintes)
- [Indexes et Optimisations](#-indexes-et-optimisations)
- [Migrations et Versions](#-migrations-et-versions)

---

##  Vue d'ensemble du Schéma

### Architecture de la Base de Données

La base de données Ofika utilise PostgreSQL comme SGBD principal, avec Redis pour le cache et les sessions. L'architecture est optimisée pour les performances et la scalabilité.

#### **Principe de Conception**
- **Normalisation** : 3ème forme normale pour éviter la redondance
- **Performance** : Indexes optimisés pour les requêtes fréquentes
- **Scalabilité** : Partitioning pour les tables volumineuses
- **Sécurité** : Chiffrement des données sensibles
- **Audit** : Traçabilité de toutes les modifications

#### **Technologies Utilisées**
- **PostgreSQL 15** : Base de données relationnelle principale
- **Redis 7** : Cache et session store
- **Prisma** : ORM moderne pour TypeScript
- **PostgREST** : API automatique pour PostgreSQL

---

## 📊 Tables Principales

### Table Users

#### **Description**
Stocke les informations des utilisateurs de la plateforme

#### **Structure**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(2) NOT NULL, -- Code ISO 3166-1 alpha-2
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);
```

#### **Contraintes**
- **Email unique** : Un seul compte par email
- **Pays requis** : Code pays obligatoire
- **Validation email** : Format email valide
- **Validation téléphone** : Format international

### Table Profiles

#### **Description**
Gère les profils link-in-bio des utilisateurs

#### **Structure**
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    job_title VARCHAR(100),
    bio TEXT,
    logo_url VARCHAR(500),
    photo_url VARCHAR(500),
    theme VARCHAR(20) DEFAULT 'classic',
    accent_color VARCHAR(7), -- Hex color
    is_public BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Contraintes**
- **Username unique** : Un seul username par profil
- **User_id requis** : Référence vers utilisateur
- **Username format** : Alphanumérique et tirets uniquement
- **Bio limite** : Maximum 500 caractères

### Table Social_Links

#### **Description**
Gère les liens sociaux des profils (maximum 2 par profil)

#### **Structure**
```sql
CREATE TABLE social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL,
    url VARCHAR(500) NOT NULL,
    display_name VARCHAR(100),
    icon_url VARCHAR(500),
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte : maximum 2 liens par profil
    CONSTRAINT max_2_links_per_profile 
        CHECK (
            (SELECT COUNT(*) FROM social_links 
             WHERE profile_id = social_links.profile_id AND is_active = TRUE) <= 2
        )
);
```

#### **Plateformes Supportées**
- **linkedin** : LinkedIn
- **twitter** : Twitter/X
- **instagram** : Instagram
- **facebook** : Facebook
- **website** : Site web personnel
- **youtube** : YouTube
- **tiktok** : TikTok
- **github** : GitHub

### Table Card_Orders

#### **Description**
Gère les commandes de cartes physiques

#### **Structure**
```sql
CREATE TABLE card_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 2),
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR(100),
    shipping_address JSONB NOT NULL,
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    actual_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Statuts de Commande**
- **pending** : En attente de paiement
- **paid** : Paiement confirmé
- **processing** : En cours de production
- **shipped** : Expédiée
- **delivered** : Livrée
- **cancelled** : Annulée
- **refunded** : Remboursée

### Table Card_Designs

#### **Description**
Stocke les designs personnalisés des cartes

#### **Structure**
```sql
CREATE TABLE card_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES card_orders(id) ON DELETE CASCADE,
    front_design JSONB NOT NULL,
    back_design JSONB NOT NULL,
    logo_position VARCHAR(20) DEFAULT 'top-center',
    text_alignment VARCHAR(20) DEFAULT 'center',
    color_scheme VARCHAR(20) DEFAULT 'classic',
    font_family VARCHAR(50) DEFAULT 'Inter',
    font_size VARCHAR(10) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Structure JSONB Front Design**
```json
{
  "logo": {
    "url": "string",
    "position": "top-center|top-left|top-right",
    "size": "small|medium|large"
  },
  "text": {
    "name": "string",
    "jobTitle": "string",
    "company": "string",
    "alignment": "left|center|right"
  },
  "colors": {
    "primary": "#000000",
    "secondary": "#666666",
    "accent": "#d2691e"
  }
}
```

### Table Analytics_Events

#### **Description**
Enregistre tous les événements d'analytics

#### **Structure**
```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    referrer VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Types d'Événements**
- **profile_view** : Vue de profil
- **contact_add** : Ajout aux contacts
- **social_click** : Clic sur lien social
- **share** : Partage du profil
- **qr_scan** : Scan du QR code
- **nfc_tap** : Tap NFC

---

##  Relations et Contraintes

### Relations Principales

#### **Users → Profiles**
- **Type** : One-to-One
- **Contrainte** : Un utilisateur peut avoir un profil
- **Cascade** : Suppression en cascade

#### **Profiles → Social_Links**
- **Type** : One-to-Many
- **Contrainte** : Maximum 2 liens actifs par profil
- **Cascade** : Suppression en cascade

#### **Users → Card_Orders**
- **Type** : One-to-Many
- **Contrainte** : Maximum 2 cartes par utilisateur
- **Cascade** : Suppression en cascade

#### **Card_Orders → Card_Designs**
- **Type** : One-to-One
- **Contrainte** : Une commande a un design
- **Cascade** : Suppression en cascade

#### **Profiles → Analytics_Events**
- **Type** : One-to-Many
- **Contrainte** : Aucune limite
- **Cascade** : Suppression en cascade

### Contraintes Métier

#### **Limitation des Cartes**
```sql
-- Maximum 2 cartes par utilisateur
CREATE OR REPLACE FUNCTION check_max_cards()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM card_orders 
        WHERE user_id = NEW.user_id AND status != 'cancelled') >= 2
    THEN
        RAISE EXCEPTION 'Maximum 2 cards per user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_max_cards
    BEFORE INSERT ON card_orders
    FOR EACH ROW EXECUTE FUNCTION check_max_cards();
```

#### **Limitation des Liens Sociaux**
```sql
-- Maximum 2 liens actifs par profil
CREATE OR REPLACE FUNCTION check_max_social_links()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = TRUE AND
       (SELECT COUNT(*) FROM social_links 
        WHERE profile_id = NEW.profile_id AND is_active = TRUE) >= 2
    THEN
        RAISE EXCEPTION 'Maximum 2 active social links per profile';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_max_social_links
    BEFORE INSERT OR UPDATE ON social_links
    FOR EACH ROW EXECUTE FUNCTION check_max_social_links();
```

---

## 📈 Indexes et Optimisations

### Indexes Principaux

#### **Indexes de Performance**
```sql
-- Index sur email pour l'authentification
CREATE INDEX idx_users_email ON users(email);

-- Index sur username pour les profils publics
CREATE INDEX idx_profiles_username ON profiles(username);

-- Index sur user_id pour les requêtes utilisateur
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_card_orders_user_id ON card_orders(user_id);

-- Index sur profile_id pour les analytics
CREATE INDEX idx_analytics_events_profile_id ON analytics_events(profile_id);

-- Index temporel pour les analytics
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
```

#### **Indexes Composés**
```sql
-- Index pour les requêtes d'analytics par profil et date
CREATE INDEX idx_analytics_profile_date 
ON analytics_events(profile_id, created_at);

-- Index pour les commandes par utilisateur et statut
CREATE INDEX idx_orders_user_status 
ON card_orders(user_id, status);

-- Index pour les liens sociaux par profil et ordre
CREATE INDEX idx_social_links_profile_order 
ON social_links(profile_id, order_index);
```

### Optimisations de Performance

#### **Partitioning des Analytics**
```sql
-- Partitioning par mois pour les analytics
CREATE TABLE analytics_events_2025_01 
PARTITION OF analytics_events
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE analytics_events_2025_02 
PARTITION OF analytics_events
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

#### **Archivage des Données**
```sql
-- Fonction d'archivage des anciennes données
CREATE OR REPLACE FUNCTION archive_old_analytics()
RETURNS void AS $$
BEGIN
    -- Archiver les données de plus de 2 ans
    INSERT INTO analytics_events_archive 
    SELECT * FROM analytics_events 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Supprimer les données archivées
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;
```

#### **Cache Redis**
```sql
-- Configuration du cache pour les requêtes fréquentes
-- Profils publics : cache 1 heure
-- Analytics : cache 15 minutes
-- Commandes : cache 30 minutes
```

---

## 🔄 Migrations et Versions

### Système de Migration

#### **Prisma Migrate**
- **Versioning** : Chaque migration a un numéro de version
- **Rollback** : Possibilité de revenir en arrière
- **Validation** : Vérification de la cohérence des données
- **Backup** : Sauvegarde automatique avant migration

#### **Structure des Migrations**
```
prisma/
├── migrations/
│   ├── 20250115000000_init/
│   │   └── migration.sql
│   ├── 20250116000000_add_analytics/
│   │   └── migration.sql
│   └── 20250117000000_add_constraints/
│       └── migration.sql
├── schema.prisma
└── seed.sql
```

### Gestion des Versions

#### **Versioning Sémantique**
- **Major** : Changements incompatibles
- **Minor** : Nouvelles fonctionnalités compatibles
- **Patch** : Corrections de bugs

#### **Stratégie de Déploiement**
1. **Développement** : Base de données locale
2. **Staging** : Base de données de test
3. **Production** : Base de données de production
4. **Rollback** : Retour à la version précédente

---

##  Sécurité et Conformité

### Chiffrement des Données

#### **Données Sensibles**
- **Mots de passe** : bcrypt avec salt
- **Emails** : Chiffrement AES-256
- **Téléphones** : Chiffrement AES-256
- **Adresses** : Chiffrement AES-256

#### **Audit Trail**
```sql
-- Table d'audit pour toutes les modifications
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Conformité RGPD

#### **Droit à l'Oubli**
```sql
-- Fonction pour supprimer les données d'un utilisateur
CREATE OR REPLACE FUNCTION delete_user_data(user_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Anonymiser les données au lieu de les supprimer
    UPDATE users SET 
        email = 'deleted@ofika.app',
        first_name = 'Deleted',
        last_name = 'User',
        phone = NULL
    WHERE id = user_uuid;
    
    -- Supprimer les analytics
    DELETE FROM analytics_events 
    WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql;
```

#### **Export des Données**
```sql
-- Fonction pour exporter les données d'un utilisateur
CREATE OR REPLACE FUNCTION export_user_data(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'user', (SELECT to_jsonb(u.*) FROM users u WHERE id = user_uuid),
        'profile', (SELECT to_jsonb(p.*) FROM profiles p WHERE user_id = user_uuid),
        'social_links', (SELECT jsonb_agg(to_jsonb(sl.*)) FROM social_links sl 
                        JOIN profiles p ON sl.profile_id = p.id 
                        WHERE p.user_id = user_uuid),
        'orders', (SELECT jsonb_agg(to_jsonb(co.*)) FROM card_orders co 
                  WHERE co.user_id = user_uuid)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Monitoring et Maintenance

### Métriques de Performance

#### **Requêtes Lentes**
```sql
-- Vue pour identifier les requêtes lentes
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 1000 -- Plus de 1 seconde
ORDER BY mean_time DESC;
```

#### **Utilisation de l'Espace**
```sql
-- Vue pour l'utilisation de l'espace disque
CREATE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Maintenance Automatique

#### **Nettoyage des Données**
```sql
-- Fonction de nettoyage quotidien
CREATE OR REPLACE FUNCTION daily_cleanup()
RETURNS void AS $$
BEGIN
    -- Supprimer les sessions expirées
    DELETE FROM user_sessions WHERE expires_at < NOW();
    
    -- Archiver les anciens analytics
    PERFORM archive_old_analytics();
    
    -- Mettre à jour les statistiques
    ANALYZE;
END;
$$ LANGUAGE plpgsql;
```

#### **Sauvegarde Automatique**
```bash
#!/bin/bash
# Script de sauvegarde quotidien
pg_dump -h localhost -U ofika_user -d ofika_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

---

## 🎯 Conclusion

La conception de la base de données Ofika est optimisée pour **la performance, la scalabilité et la sécurité**, avec un focus particulier sur les **contraintes métier** et la **conformité réglementaire**.

**Points clés** :
- **PostgreSQL** comme SGBD principal
- **Redis** pour le cache et les sessions
- **Contraintes métier** strictes (max 2 cartes, max 2 liens)
- **Partitioning** pour les tables volumineuses
- **Audit trail** complet pour la traçabilité
- **Conformité RGPD** intégrée

**Prochaines étapes** :
- Mise en place de l'infrastructure
- Création des migrations initiales
- Tests de performance et sécurité
- Mise en production progressive

---

*Document révisé : Janvier 2025*  
*Prochaine révision : Avril 2025*
```

```markdown:07_API_SPECIFICATIONS.md
```

