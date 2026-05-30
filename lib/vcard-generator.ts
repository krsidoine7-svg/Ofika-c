export interface VCardProfile {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  bio?: string;
  image_url?: string;
  social_links?: Array<{
    platform: string;
    url: string;
  }>;
}

export class VCardGenerator {
  static generateVCard(profile: VCardProfile): string {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${this.escapeVCardValue(profile.name)}`,
      `N:${this.escapeVCardValue(profile.name.split(' ').reverse().join(';'))};;;`,
    ];

    // Email
    if (profile.email) {
      vcard.push(`EMAIL:${this.escapeVCardValue(profile.email)}`);
    }

    // Téléphone
    if (profile.phone) {
      vcard.push(`TEL:${this.escapeVCardValue(profile.phone)}`);
    }

    // Entreprise
    if (profile.company) {
      vcard.push(`ORG:${this.escapeVCardValue(profile.company)}`);
    }

    // Titre
    if (profile.title) {
      vcard.push(`TITLE:${this.escapeVCardValue(profile.title)}`);
    }

    // Bio/Note
    if (profile.bio) {
      vcard.push(`NOTE:${this.escapeVCardValue(profile.bio)}`);
    }

    // Réseaux sociaux depuis social_links
    if (profile.social_links && profile.social_links.length > 0) {
      profile.social_links.forEach(link => {
        const platform = link.platform.toUpperCase();
        if (link.platform === 'website') {
          vcard.push(`URL:${this.escapeVCardValue(link.url)}`);
        } else {
          vcard.push(`X-${platform}:${this.escapeVCardValue(link.url)}`);
        }
      });
    }

    vcard.push('END:VCARD');
    return vcard.join('\r\n');
  }

  private static escapeVCardValue(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }
}
