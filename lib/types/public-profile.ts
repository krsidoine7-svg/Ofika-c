export interface PublicProfile {
    id: string
    profile_name: string
    nfc_link: string
    design_choice: string
    color_theme: string
    status: string
    created_at: string
    is_nfc_associated: boolean
    full_name?: string
    company?: string
    job_title?: string
    bio?: string
    phone?: string
    email?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    facebook?: string
    whatsapp?: string
    youtube?: string
    tiktok?: string
    website?: string
    location?: string
    image_url?: string
    cover_image_url?: string
    social_links?: Array<{
        platform: 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin' | 'snapchat' | 'telegram' | 'website' | 'github' | 'shop' | 'other'
        url: string
    }>
    custom_links?: Array<{
        title: string
        url: string
        type: 'website' | 'shop' | 'other'
    }>
    is_active: boolean
    suspension_reason?: string
    
    // Social specific data
    instagram_followers?: number
    instagram_posts?: number
    instagram_verified?: boolean
    ig_show_followers?: boolean
    ig_show_posts?: boolean
    ig_show_verified?: boolean
    
    tiktok_followers?: number
    tiktok_posts?: number
    tiktok_verified?: boolean
    tt_show_followers?: boolean
    tt_show_posts?: boolean
    tt_show_verified?: boolean
    
    youtube_subscribers?: number
    youtube_videos?: number
    youtube_verified?: boolean
    yt_show_subscribers?: boolean
    yt_show_videos?: boolean
    yt_show_verified?: boolean
    
    twitter_followers?: number
    twitter_posts?: number
    twitter_verified?: boolean
    tw_show_followers?: boolean
    tw_show_posts?: boolean
    tw_show_verified?: boolean
    
    facebook_followers?: number
    facebook_verified?: boolean
    fb_show_followers?: boolean
    fb_show_verified?: boolean
}
