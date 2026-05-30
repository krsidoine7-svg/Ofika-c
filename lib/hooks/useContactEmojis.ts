import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useContactEmojis(contactId: string, initialEmojis: string[] = []) {
  const [emojis, setEmojis] = useState<string[]>(initialEmojis)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const updateEmojis = async (newEmojis: string[]) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ 
          emojis: newEmojis,
          emoji_tags: newEmojis // Pour recherche facile
        })
        .eq('id', contactId)

      if (error) throw error

      setEmojis(newEmojis)
      toast.success('Émotions mises à jour')
      return true
    } catch (error) {
      console.error('Error updating emojis:', error)
      toast.error('Erreur lors de la mise à jour')
      return false
    } finally {
      setLoading(false)
    }
  }

  const toggleEmoji = async (emoji: string) => {
    const newEmojis = emojis.includes(emoji)
      ? emojis.filter(e => e !== emoji)
      : [...emojis, emoji]
    
    return updateEmojis(newEmojis)
  }

  return {
    emojis,
    loading,
    updateEmojis,
    toggleEmoji
  }
}
