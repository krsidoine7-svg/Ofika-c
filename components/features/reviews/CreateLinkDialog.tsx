'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useCreateReviewLink } from '@/lib/hooks/useReviewLinks'

// ========================================
// TYPES
// ========================================

interface CreateLinkDialogProps {
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

interface FormData {
    title: string
    nameRequired: boolean
    emailRequired: boolean
    commentRequired: boolean
    mediaEnabled: boolean
    purchaseVerification: boolean
}

// ========================================
// COMPONENT
// ========================================

export function CreateLinkDialog({
    trigger,
    open,
    onOpenChange,
}: CreateLinkDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        title: '',
        nameRequired: false,
        emailRequired: false,
        commentRequired: false,
        mediaEnabled: false,
        purchaseVerification: false,
    })

    const { mutate: createLink, isPending } = useCreateReviewLink()

    const handleOpenChange = (newOpen: boolean) => {
        if (onOpenChange) {
            onOpenChange(newOpen)
        } else {
            setIsOpen(newOpen)
        }

        // Reset form quand on ferme
        if (!newOpen) {
            setFormData({
                title: '',
                nameRequired: false,
                emailRequired: false,
                commentRequired: false,
                mediaEnabled: false,
                purchaseVerification: false,
            })
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        createLink(
            {
                title: formData.title,
                fields_config: {
                    name_required: formData.nameRequired,
                    email_required: formData.emailRequired,
                    comment_required: formData.commentRequired,
                    media_enabled: formData.mediaEnabled,
                    purchase_verification: formData.purchaseVerification,
                },
            },
            {
                onSuccess: () => {
                    handleOpenChange(false)
                },
            }
        )
    }

    const isControlled = open !== undefined
    const dialogOpen = isControlled ? open : isOpen

    return (
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            {(trigger || !isControlled) && (
                <DialogTrigger asChild>
                    {trigger || (
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau lien
                        </Button>
                    )}
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[550px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Créer un lien de collecte d'avis</DialogTitle>
                        <DialogDescription>
                            Générez un lien personnalisé pour collecter des avis de vos clients
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Titre du lien */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Nom du lien <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Ex: Avis sur notre service de coaching"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                autoFocus
                            />
                            <p className="text-xs text-gray-500">
                                Ce nom sera visible par vos clients
                            </p>
                        </div>

                        <Separator />

                        {/* Configuration du formulaire */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900">
                                Configuration du formulaire
                            </h4>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="nameRequired" className="font-normal">
                                            Nom obligatoire
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Demander le nom du client
                                        </p>
                                    </div>
                                    <Switch
                                        id="nameRequired"
                                        checked={formData.nameRequired}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, nameRequired: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="emailRequired" className="font-normal">
                                            Email obligatoire
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Demander l'email du client
                                        </p>
                                    </div>
                                    <Switch
                                        id="emailRequired"
                                        checked={formData.emailRequired}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, emailRequired: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="commentRequired" className="font-normal">
                                            Commentaire obligatoire
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Exiger un commentaire écrit
                                        </p>
                                    </div>
                                    <Switch
                                        id="commentRequired"
                                        checked={formData.commentRequired}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, commentRequired: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="mediaEnabled" className="font-normal">
                                            Autoriser photos/vidéos
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Permettre l'upload de médias
                                        </p>
                                    </div>
                                    <Switch
                                        id="mediaEnabled"
                                        checked={formData.mediaEnabled}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, mediaEnabled: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="purchaseVerification" className="font-normal">
                                            Vérification d'achat
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Demander si le client a acheté
                                        </p>
                                    </div>
                                    <Switch
                                        id="purchaseVerification"
                                        checked={formData.purchaseVerification}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, purchaseVerification: checked })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recommandation */}
                        <Alert>
                            <AlertDescription className="text-sm">
                                💡 <strong>Conseil :</strong> Plus vous demandez d'informations,
                                plus le taux d'abandon peut augmenter. Nous recommandons :
                                Email optionnel + Commentaire optionnel.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleOpenChange(false)}
                            disabled={isPending}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isPending || !formData.title.trim()}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? 'Création...' : 'Générer le lien'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
