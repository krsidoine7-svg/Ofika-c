'use client'

import { useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RatingStars } from './RatingStars'
import { useSubmitReview, useGenerateFingerprint } from '@/lib/hooks/useSubmitReview'
import type { ReviewLink } from '@/lib/hooks/useReviewLinks'

// ========================================
// TYPES
// ========================================

interface PublicReviewFormProps {
    link: ReviewLink
    onSuccess?: () => void
}

// ========================================
// COMPONENT
// ========================================

export function PublicReviewForm({ link, onSuccess }: PublicReviewFormProps) {
    const { mutate: submitReview, isPending, isSuccess } = useSubmitReview()
    const { generateFingerprint } = useGenerateFingerprint()

    const [rating, setRating] = useState(0)
    const [clientName, setClientName] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [comment, setComment] = useState('')
    const [hasPurchase, setHasPurchase] = useState(false)

    const config = link.fields_config || {}

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        submitReview(
            {
                link_id: link.id,
                rating,
                client_name: clientName || undefined,
                client_email: clientEmail || undefined,
                comment: comment || undefined,
                has_purchase: hasPurchase,
                fingerprint: generateFingerprint(),
            },
            {
                onSuccess: () => {
                    onSuccess?.()
                    // Reset form
                    setRating(0)
                    setClientName('')
                    setClientEmail('')
                    setComment('')
                    setHasPurchase(false)
                },
            }
        )
    }

    // Page de succès
    if (isSuccess) {
        return (
            <div className="text-center space-y-6 py-8">
                <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 p-4">
                        <svg
                            className="h-16 w-16 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Merci pour votre avis ! 🙏
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Votre retour est précieux et aide d'autres clients à faire le bon choix.
                    </p>
                </div>

                {clientEmail && (
                    <Alert className="max-w-md mx-auto">
                        <AlertDescription>
                            Un récapitulatif a été envoyé à {clientEmail}
                        </AlertDescription>
                    </Alert>
                )}

                <Button variant="outline" onClick={() => window.close()}>
                    Fermer
                </Button>
            </div>
        )
    }

    // Formulaire
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating (obligatoire) */}
            <div className="space-y-3">
                <Label className="text-lg font-semibold">
                    Comment évaluez-vous votre expérience ? <span className="text-red-500">*</span>
                </Label>
                <RatingStars
                    value={rating}
                    onChange={setRating}
                    size="lg"
                    showLabel
                    className="justify-center"
                />
            </div>

            {/* Nom */}
            {(config.name_required !== false) && (
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Votre nom {config.name_required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Jean Dupont"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required={config.name_required}
                        autoComplete="name"
                    />
                </div>
            )}

            {/* Email */}
            {(config.email_required !== false) && (
                <div className="space-y-2">
                    <Label htmlFor="email">
                        Votre email {config.email_required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        placeholder="jean@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        required={config.email_required}
                        autoComplete="email"
                    />
                    {!config.email_required && (
                        <p className="text-xs text-gray-500">
                            Pour recevoir une copie de votre avis
                        </p>
                    )}
                </div>
            )}

            {/* Commentaire */}
            <div className="space-y-2">
                <Label htmlFor="comment">
                    Votre commentaire {config.comment_required && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                    id="comment"
                    placeholder="Partagez votre expérience en quelques mots..."
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required={config.comment_required}
                    className="resize-none"
                />
            </div>

            {/* Vérification d'achat */}
            {config.purchase_verification && (
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="purchase"
                        checked={hasPurchase}
                        onCheckedChange={(checked) => setHasPurchase(checked as boolean)}
                    />
                    <Label
                        htmlFor="purchase"
                        className="text-sm font-normal cursor-pointer"
                    >
                        J'ai acheté ce produit/service
                    </Label>
                </div>
            )}

            {/* Upload média (TODO: implémenter l'upload) */}
            {config.media_enabled && (
                <Alert>
                    <Upload className="h-4 w-4" />
                    <AlertDescription>
                        L'upload de photos/vidéos sera disponible prochainement
                    </AlertDescription>
                </Alert>
            )}

            {/* Bouton submit */}
            <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={rating === 0 || isPending}
            >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Envoi en cours...' : 'Envoyer mon avis'}
            </Button>

            {/* Mention légale */}
            <p className="text-xs text-center text-gray-500">
                En soumettant cet avis, vous acceptez qu'il soit publié publiquement.
            </p>
        </form>
    )
}
