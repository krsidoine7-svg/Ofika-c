'use client'

import { useState } from 'react'

interface EmojiPickerProps {
    selectedEmojis: string[]
    onEmojiToggle: (emoji: string) => void
    maxEmojis?: number
}

const EMOJI_CATEGORIES = {
    positive: { label: '😊 Positif', emojis: ['😊', '🥰', '😍', '🤗', '😎', '🌟', '✨', '🎉', '👍', '💪'] },
    professional: { label: '💼 Professionnel', emojis: ['💼', '📈', '🎯', '💡', '🚀', '⭐', '🏆', '📊', '💻', '📱'] },
    neutral: { label: '😐 Neutre', emojis: ['😐', '🤔', '😶', '😌', '🙂', '📝', '📅', '⏰', '📞', '✉️'] },
    negative: { label: '😕 Négatif', emojis: ['😕', '😟', '😢', '😤', '😠', '⚠️', '❌', '🚫', '⛔', '🔴'] }
}

export function EmojiPicker({ selectedEmojis, onEmojiToggle, maxEmojis = 5 }: EmojiPickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleEmojiClick = (emoji: string) => {
        if (selectedEmojis.includes(emoji)) {
            onEmojiToggle(emoji)
        } else if (selectedEmojis.length < maxEmojis) {
            onEmojiToggle(emoji)
        }
    }

    return (
        <div className="relative">
            {/* Bouton déclencheur */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="
          flex items-center gap-2 px-4 py-2 text-sm font-medium
          border border-gray-300 rounded-lg
          hover:bg-gray-50 transition-colors
        "
            >
                <span className="text-lg">😊</span>
                <span>
                    Ajouter des émotions
                    {selectedEmojis.length > 0 && (
                        <span className="ml-1 text-blue-600">({selectedEmojis.length}/{maxEmojis})</span>
                    )}
                </span>
            </button>

            {/* Modal popup */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-25 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Contenu du picker */}
                    <div className="
            absolute left-0 top-full mt-2 z-50
            w-80 bg-white rounded-lg shadow-xl border border-gray-200
            p-4 max-h-96 overflow-y-auto
          ">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium text-gray-900">Choisir des émotions</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <p className="text-xs text-gray-600 mb-4">
                            Sélectionnez jusqu'à {maxEmojis} émotions pour qualifier ce contact
                        </p>

                        {/* Catégories d'emojis */}
                        <div className="space-y-4">
                            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                                <div key={key}>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        {category.label}
                                    </h4>
                                    <div className="grid grid-cols-5 gap-2">
                                        {category.emojis.map((emoji) => {
                                            const isSelected = selectedEmojis.includes(emoji)
                                            const isDisabled = !isSelected && selectedEmojis.length >= maxEmojis

                                            return (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => handleEmojiClick(emoji)}
                                                    disabled={isDisabled}
                                                    className={`
                            text-2xl p-2 rounded-lg transition-all
                            ${isSelected
                                                            ? 'bg-blue-100 ring-2 ring-blue-500 scale-110'
                                                            : isDisabled
                                                                ? 'opacity-30 cursor-not-allowed'
                                                                : 'hover:bg-gray-100 hover:scale-110'
                                                        }
                          `}
                                                    title={isDisabled ? `Maximum ${maxEmojis} émotions` : undefined}
                                                >
                                                    {emoji}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-3 border-t flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                {selectedEmojis.length} / {maxEmojis} sélectionnés
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
