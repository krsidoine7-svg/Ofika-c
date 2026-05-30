import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EmojiPicker } from '@/components/features/contacts/EmojiPicker'

describe('EmojiPicker Component', () => {
    const mockOnEmojiToggle = jest.fn()

    beforeEach(() => {
        mockOnEmojiToggle.mockClear()
    })

    it('devrait afficher le bouton avec le texte par défaut', () => {
        render(
            <EmojiPicker
                selectedEmojis={[]}
                onEmojiToggle={mockOnEmojiToggle}
            />
        )

        // @ts-ignore
        expect(screen.getByText(/Ajouter des émotions/)).toBeInTheDocument()
    })

    it('devrait afficher le nombre d\'emojis sélectionnés', () => {
        render(
            <EmojiPicker
                selectedEmojis={['😊', '💼']}
                onEmojiToggle={mockOnEmojiToggle}
            />
        )

        // @ts-ignore
        expect(screen.getByText(/2\/5 sélectionnés/)).toBeInTheDocument()
    })

    it('devrait ouvrir le modal au clic sur le bouton', async () => {
        render(
            <EmojiPicker
                selectedEmojis={[]}
                onEmojiToggle={mockOnEmojiToggle}
            />
        )

        const button = screen.getByText(/Ajouter des émotions/)
        fireEvent.click(button)

        await waitFor(() => {
            // @ts-ignore
            expect(screen.getByText('Choisir des émotions')).toBeInTheDocument()
        })
    })

    it('devrait appeler onEmojiToggle quand un emoji est cliqué', async () => {
        render(
            <EmojiPicker
                selectedEmojis={[]}
                onEmojiToggle={mockOnEmojiToggle}
            />
        )

        const button = screen.getByText(/Ajouter des émotions/)
        fireEvent.click(button)

        await waitFor(() => {
            const emoji = screen.getByText('😊')
            fireEvent.click(emoji)
        })

        expect(mockOnEmojiToggle).toHaveBeenCalledWith('😊')
    })

    it('devrait respecter la limite de 5 emojis', async () => {
        const selectedEmojis = ['😊', '💼', '🔥', '⭐', '👍']

        render(
            <EmojiPicker
                selectedEmojis={selectedEmojis}
                onEmojiToggle={mockOnEmojiToggle}
                maxEmojis={5}
            />
        )

        // @ts-ignore
        expect(screen.getByText(/5\/5 sélectionnés/)).toBeInTheDocument()
        const button = screen.getByText(/5\/5 sélectionnés/)
        fireEvent.click(button)

        await waitFor(() => {
            // Les boutons d'emojis non sélectionnés doivent être désactivés
            const disabledButtons = screen.getAllByRole('button').filter(
                (btn: HTMLElement) => btn.hasAttribute('disabled')
            )
            expect(disabledButtons.length).toBeGreaterThan(0)
        })
    })

    it('devrait permettre de retirer un emoji sélectionné', async () => {
        render(
            <EmojiPicker
                selectedEmojis={['😊']}
                onEmojiToggle={mockOnEmojiToggle}
            />
        )

        const button = screen.getByText(/1\/5 sélectionnés/)
        fireEvent.click(button)

        await waitFor(() => {
            // Cliquer sur l'emoji dans la zone des sélectionnés
            const selectedEmoji = screen.getAllByText('😊')[0]
            fireEvent.click(selectedEmoji)
        })

        expect(mockOnEmojiToggle).toHaveBeenCalledWith('😊')
    })

    it('devrait afficher les 4 catégories d\'emojis', async () => {
        render(
            <EmojiPicker
                selectedEmojis={[]}
                onEmojiToggle={mockOnEmojiToggle}
            />
        )

        const button = screen.getByText(/Ajouter des émotions/)
        fireEvent.click(button)

        await waitFor(() => {
            // @ts-ignore
            expect(screen.getByText('😊 Positif')).toBeInTheDocument()
            // @ts-ignore
            expect(screen.getByText('💼 Professionnel')).toBeInTheDocument()
            // @ts-ignore
            expect(screen.getByText('😐 Neutre')).toBeInTheDocument()
            // @ts-ignore
            expect(screen.getByText('😕 Négatif')).toBeInTheDocument()
        })
    })
})

describe('useContactEmojis Hook', () => {
    // Mock Supabase
    const mockSupabase = {
        from: jest.fn(() => ({
            update: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({ error: null }))
            }))
        }))
    }

    it('devrait mettre à jour les emojis dans Supabase', async () => {
        // Test à implémenter avec mock Supabase
        expect(true).toBe(true)
    })
})
