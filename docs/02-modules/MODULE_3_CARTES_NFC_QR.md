# MODULE 3 : CARTES NFC/QR

## 🎯 OBJECTIFS DU MODULE

**Durée :** Semaine 2 (7 jours) - Parallèle avec Module 2
**Équipe :** 2-3 développeurs
**Priorité :** Critique (cœur métier)

### Fonctionnalités Core
- ✅ Génération QR codes dynamiques
- ✅ Design cartes personnalisable (front/back)
- ✅ Intégration NFC (NDEF records)
- ✅ Activation/désactivation cartes
- ✅ Tracking interactions
- ✅ Limitation : 2 cartes max par utilisateur

---

## 🛠️ SPÉCIFICATIONS TECHNIQUES

### Stack Technique
```json
{
  "frontend": {
    "qr_generation": "qrcode.js + custom branding",
    "design": "Canvas API + CSS",
    "preview": "Real-time rendering",
    "nfc": "Web NFC API (basique)"
  },
  "backend": {
    "database": "PostgreSQL (Supabase)",
    "storage": "Supabase Storage (designs)",
    "functions": "Supabase Edge Functions"
  },
  "hardware": {
    "nfc_chips": "NXP Mifare 1K",
    "card_material": "PVC premium",
    "dimensions": "85mm × 55mm"
  }
}
```

### Contraintes Métier
- **Maximum 2 cartes par utilisateur**
- **Design standardisé** (logo top, nom centre, titre bas)
- **QR code centré au dos**
- **NFC + QR combo** ou **QR seulement**

### Architecture Base de Données

```sql
-- Table Cards
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  card_type VARCHAR(20) CHECK (card_type IN ('nfc_qr', 'qr_only')),
  unique_code VARCHAR(50) UNIQUE NOT NULL,
  is_activated BOOLEAN DEFAULT false,
  tap_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Card Designs
CREATE TABLE card_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  front_design JSONB NOT NULL,
  back_design JSONB NOT NULL,
  qr_code_url TEXT,
  nfc_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contrainte : max 2 cartes par utilisateur
CREATE OR REPLACE FUNCTION check_max_cards()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM cards WHERE user_id = NEW.user_id) >= 2 THEN
    RAISE EXCEPTION 'Maximum 2 cards per user allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_max_cards
  BEFORE INSERT ON cards
  FOR EACH ROW EXECUTE FUNCTION check_max_cards();

-- RLS Policies
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cards" ON cards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own card designs" ON card_designs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_designs.card_id 
      AND cards.user_id = auth.uid()
    )
  );
```

---

## 🎨 INTERFACE UTILISATEUR

### Pages Principales

#### 1. Dashboard Cartes (`/dashboard/cards`)
```typescript
interface CardDashboard {
  cards: Card[];
  quickActions: {
    createCard: () => void;
    editCard: (id: string) => void;
    activateCard: (id: string) => void;
    viewAnalytics: (id: string) => void;
  };
  stats: {
    totalCards: number;
    activeCards: number;
    totalTaps: number;
    thisMonthTaps: number;
  };
}
```

#### 2. Création Carte (`/dashboard/cards/new`)
- Sélection type carte (NFC+QR ou QR seulement)
- Sélection profil à associer
- Design personnalisation
- Prévisualisation temps réel
- Validation et commande

#### 3. Édition Carte (`/dashboard/cards/[id]/edit`)
- Modification design
- Changement profil associé
- Activation/désactivation
- Test NFC/QR

#### 4. Design Personnalisation
- **Front** : Logo (top), Nom (centre), Titre (bas)
- **Back** : QR code centré
- Couleurs et polices
- Prévisualisation 3D

### Composants shadcn/ui Utilisés
- `Card` - Conteneurs cartes
- `Button` - Actions principales
- `Dialog` - Modales personnalisation
- `Select` - Type de carte
- `Slider` - Ajustements design
- `Badge` - Statuts cartes
- `Progress` - Progression commande

---

## 🔧 FONCTIONNALITÉS DÉTAILLÉES

### Génération QR Code

#### Configuration QR Code
```typescript
interface QRCodeConfig {
  url: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  logo?: {
    src: string;
    size: number;
  };
}

const generateQRCode = async (config: QRCodeConfig): Promise<string> => {
  const qr = await QRCode.toDataURL(config.url, {
    width: config.size,
    margin: config.margin,
    color: config.color,
    errorCorrectionLevel: config.errorCorrectionLevel
  });
  
  if (config.logo) {
    return await addLogoToQR(qr, config.logo);
  }
  
  return qr;
};
```

#### QR Code avec Logo Ofika
```typescript
const addLogoToQR = async (qrDataURL: string, logo: LogoConfig): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const qrImage = new Image();
  
  return new Promise((resolve) => {
    qrImage.onload = () => {
      canvas.width = qrImage.width;
      canvas.height = qrImage.height;
      
      // Dessiner QR code
      ctx.drawImage(qrImage, 0, 0);
      
      // Ajouter logo au centre
      const logoImage = new Image();
      logoImage.onload = () => {
        const logoSize = logo.size;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        
        ctx.drawImage(logoImage, x, y, logoSize, logoSize);
        resolve(canvas.toDataURL());
      };
      logoImage.src = logo.src;
    };
    qrImage.src = qrDataURL;
  });
};
```

### Intégration NFC

#### Configuration NFC NDEF
```typescript
interface NFCConfig {
  url: string;
  type: 'url' | 'text' | 'vcard';
  data: string;
}

const writeToNFC = async (config: NFCConfig): Promise<void> => {
  if ('NDEFWriter' in window) {
    const writer = new NDEFWriter();
    
    const record = {
      recordType: 'url',
      data: config.url
    };
    
    await writer.write({ records: [record] });
  } else {
    throw new Error('NFC not supported on this device');
  }
};
```

#### Test NFC
```typescript
const testNFC = async (): Promise<boolean> => {
  try {
    if ('NDEFReader' in window) {
      const reader = new NDEFReader();
      await reader.scan();
      
      reader.addEventListener('reading', (event) => {
        console.log('NFC tag detected:', event);
        return true;
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('NFC test failed:', error);
    return false;
  }
};
```

### Design Carte

#### Structure Design
```typescript
interface CardDesign {
  front: {
    logo: {
      src: string;
      position: 'top-left' | 'top-center' | 'top-right';
      size: number;
    };
    name: {
      text: string;
      fontSize: number;
      color: string;
      position: 'center';
    };
    title: {
      text: string;
      fontSize: number;
      color: string;
      position: 'bottom';
    };
    backgroundColor: string;
  };
  back: {
    qrCode: {
      url: string;
      size: number;
      position: 'center';
    };
    instructionText: string;
    backgroundColor: string;
  };
}
```

#### Rendu Canvas
```typescript
const renderCardDesign = async (design: CardDesign): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Dimensions carte (85mm × 55mm)
  canvas.width = 340; // 85mm à 300 DPI
  canvas.height = 220; // 55mm à 300 DPI
  
  // Rendu front
  await renderCardFront(ctx, design.front);
  
  return canvas.toDataURL('image/png');
};

const renderCardFront = async (ctx: CanvasRenderingContext2D, front: CardDesign['front']) => {
  // Background
  ctx.fillStyle = front.backgroundColor;
  ctx.fillRect(0, 0, 340, 220);
  
  // Logo
  if (front.logo.src) {
    const logoImg = await loadImage(front.logo.src);
    const logoSize = front.logo.size;
    const x = getLogoX(front.logo.position, logoSize);
    const y = 20; // Top margin
    
    ctx.drawImage(logoImg, x, y, logoSize, logoSize);
  }
  
  // Nom
  ctx.fillStyle = front.name.color;
  ctx.font = `${front.name.fontSize}px Inter`;
  ctx.textAlign = 'center';
  ctx.fillText(front.name.text, 170, 120);
  
  // Titre
  ctx.fillStyle = front.title.color;
  ctx.font = `${front.title.fontSize}px Inter`;
  ctx.fillText(front.title.text, 170, 180);
};
```

---

## 📱 PRÉVISUALISATION TEMPS RÉEL

### Composant CardPreview
```typescript
interface CardPreviewProps {
  design: CardDesign;
  type: 'front' | 'back';
  size?: 'small' | 'medium' | 'large';
}

const CardPreview: React.FC<CardPreviewProps> = ({ design, type, size = 'medium' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      renderPreview(canvasRef.current, design, type, size);
    }
  }, [design, type, size]);
  
  return (
    <div className="card-preview-container">
      <canvas
        ref={canvasRef}
        className="card-preview-canvas"
        style={{
          width: getPreviewSize(size).width,
          height: getPreviewSize(size).height
        }}
      />
      <div className="card-preview-actions">
        <Button onClick={() => flipCard()}>Voir {type === 'front' ? 'dos' : 'face'}</Button>
      </div>
    </div>
  );
};
```

### Animation 3D
```css
.card-preview-container {
  perspective: 1000px;
  transform-style: preserve-3d;
}

.card-preview-canvas {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card-preview-canvas.flipped {
  transform: rotateY(180deg);
}
```

---

## 🔐 SÉCURITÉ OWASP

### A01:2021 - Broken Access Control
- ✅ RLS policies sur table cards
- ✅ Validation ownership cartes
- ✅ Rate limiting création cartes

### A02:2021 - Cryptographic Failures
- ✅ URLs chiffrées pour cartes
- ✅ Codes uniques sécurisés
- ✅ Données NFC chiffrées

### A04:2021 - Insecure Design
- ✅ Rate limiting scans QR
- ✅ Validation données NFC
- ✅ Timeout sessions

### A09:2021 - Logging Failures
- ✅ Logs interactions cartes
- ✅ Audit trail activations
- ✅ Monitoring anomalies

---

## 📋 LIVRABLES SEMAINE 2

### Jour 1-2 : Génération QR + Design
- [ ] Génération QR codes dynamiques
- [ ] Design cartes (front/back)
- [ ] Prévisualisation temps réel
- [ ] Personnalisation couleurs/polices
- [ ] Tests unitaires

### Jour 3-4 : Intégration NFC
- [ ] Configuration NDEF records
- [ ] Test NFC (Web NFC API)
- [ ] Fallback QR pour non-NFC
- [ ] Activation cartes
- [ ] Tests intégration

### Jour 5-6 : Interface Utilisateur
- [ ] Dashboard cartes
- [ ] Création/édition cartes
- [ ] Gestion designs
- [ ] Analytics basiques
- [ ] Tests interface

### Jour 7 : Tests & Optimisation
- [ ] Tests end-to-end
- [ ] Debug sécurité
- [ ] Optimisation performance
- [ ] Documentation API
- [ ] Déploiement staging

---

## 📊 MÉTRIQUES DE SUCCÈS

### KPIs Techniques
- ✅ Temps génération QR < 1 seconde
- ✅ Taux succès NFC > 95%
- ✅ Performance prévisualisation < 2s
- ✅ Sécurité : 0 vulnérabilité critique

### KPIs Utilisateur
- ✅ Cartes créées par utilisateur > 1.5
- ✅ Taux activation cartes > 90%
- ✅ Satisfaction design > 4/5
- ✅ Support tickets < 3% des cartes

---

## 🚀 DÉPLOIEMENT

### Variables d'Environnement
```env
NEXT_PUBLIC_APP_URL=https://ofika.app
SUPABASE_STORAGE_BUCKET=card-designs
QR_CODE_BASE_URL=https://ofika.app/c/
NFC_BASE_URL=https://ofika.app/nfc/
```

### Checklist Déploiement
- [ ] Base de données migrée
- [ ] Images CDN configuré
- [ ] Tests automatisés passent
- [ ] Performance optimisée
- [ ] NFC testé sur devices
- [ ] Monitoring activé

---

## 🔄 PROCHAINES ÉTAPES

**Module suivant :** MODULE_4_ADD_TO_CONTACTS.md
**Dépendances :** Cartes NFC/QR fonctionnelles
**Timeline :** Semaine 2 (parallèle)

**Validation requise avant de continuer :**
- [ ] Génération QR codes opérationnelle
- [ ] Design cartes personnalisable
- [ ] Intégration NFC basique
- [ ] Prévisualisation temps réel
- [ ] Tests passent à 100%
