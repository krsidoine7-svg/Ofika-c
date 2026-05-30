// Module Add to Contacts - Exports principaux
export { AddToContactsUnified } from '../../AddToContactsUnified'
export { ContactQRCode } from '../../ContactQRCode'
export { useContactShare } from '../../../lib/hooks/useContactShare'

// Exports des composants existants (pour compatibilité)
export { AddToContactsButton } from '../contacts/AddToContactsButton'
// export { AdvancedContactShare } from '../../AdvancedContactShare' // Commenté - fichier introuvable
// export { UltimateContactShare } from '../../UltimateContactShare' // Commenté - fichier introuvable
// export { ContactShareButton } from '../../ContactShareButton' // Commenté - fichier introuvable
export { CardContactShare } from '../card-creator/CardContactShare'

// Types
export type { ProfileWithLinks } from '../../../lib/types/database'
