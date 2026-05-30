/**
 * Social Scraper Service
 * 
 * Provides functionality to fetch profile data from various social platforms.
 * Note: Real scraping requires proxies and handling anti-bot measures.
 */

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';

export interface SocialProfile {
  platform: SocialPlatform;
  username: string;
  fullName: string;
  bio: string;
  profilePicUrl: string;
  followersCount: number;
  postCount: number;
  isVerified: boolean;
  isPrivate: boolean;
}

export class SocialScraperService {
  /**
   * Scrapes public profile data for a given platform and username
   */
  static async scrapeProfile(platform: SocialPlatform, username: string): Promise<SocialProfile> {
    const handle = username.startsWith('@') ? username.substring(1) : username;
    
    // Simulate realistic delays
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (handle.toLowerCase() === 'error') {
      throw new Error(`Le profil ${platform} n'a pas été trouvé.`);
    }

    // Default "Successful" mock data based on platform
    const platformNames: Record<SocialPlatform, string> = {
      instagram: "Instagram",
      tiktok: "TikTok",
      youtube: "YouTube",
      twitter: "Twitter/X",
      facebook: "Facebook"
    };

    const multiplier = {
      instagram: 1,
      tiktok: 2.5,
      youtube: 5,
      twitter: 0.8,
      facebook: 1.2
    }[platform];

    return {
      platform,
      username: handle,
      fullName: `${handle.charAt(0).toUpperCase() + handle.slice(1)} ${platformNames[platform]}`,
      bio: `Profil officiel sur ${platformNames[platform]}.`,
      profilePicUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=400&h=400&fit=crop`,
      followersCount: Math.floor((12400 + Math.floor(Math.random() * 5000)) * multiplier),
      postCount: Math.floor((156 + Math.floor(Math.random() * 50)) * (multiplier / 2)),
      isVerified: handle.length < 10,
      isPrivate: false
    };
  }

  /**
   * Searches for profiles matching a name/query
   */
  static async searchProfiles(platform: SocialPlatform, query: string): Promise<SocialProfile[]> {
    if (!query || query.length < 2) return [];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results: SocialProfile[] = [];
    const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 results
    
    for (let i = 0; i < count; i++) {
      const suffix = i === 0 ? "" : `_${i + 1}`;
      const username = `${query.toLowerCase().replace(/\s+/g, '.')}${suffix}`;
      
      results.push({
        platform,
        username,
        fullName: `${query} ${i === 0 ? "(Officiel)" : ""}`,
        bio: `Bio de ${query} sur ${platform}. Venez me suivre !`,
        profilePicUrl: `https://i.pravatar.cc/150?u=${username}`,
        followersCount: Math.floor(Math.random() * 100000),
        postCount: Math.floor(Math.random() * 500),
        isVerified: i === 0,
        isPrivate: false
      });
    }
    
    return results;
  }

  /**
   * Formats numbers for display (e.g., 12500 -> 12.5k)
   */
  static formatCount(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  }
}
