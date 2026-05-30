'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { Label } from "@/components/core/ui/label"
import { Loader2, CreditCard, Package, MapPin, Smartphone, Wallet, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function OrderCreateForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)

    // Paramètres par défaut
    const cardType = searchParams.get('type') || 'nfc_qr'
    const defaultAmount = process.env.NEXT_PUBLIC_LYGOS_DEFAULT_AMOUNT || '14600'
    const amount = cardType === 'nfc_qr' ? defaultAmount : '10000'

    // Formulaire
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        paymentMethod: 'lygos' as 'lygos' | 'wave'
    })

    const [availableMethods, setAvailableMethods] = useState<{id: string, name: string, is_active: boolean}[]>([])

    useEffect(() => {
        fetch('/api/payments/methods')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const active = data.methods.filter((m: any) => m.is_active)
                    setAvailableMethods(active)
                    
                    // Sélectionner automatiquement le premier mode actif si celui par défaut ne l'est pas
                    if (active.length > 0) {
                        const isCurrentActive = active.some((m: any) => m.id === formData.paymentMethod)
                        if (!isCurrentActive) {
                            setFormData(prev => ({ ...prev, paymentMethod: active[0].id }))
                        }
                    }
                }
            })
            .catch(err => console.error('Error fetching payment methods:', err))
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Validation
            if (!formData.name || !formData.phone || !formData.address || !formData.city) {
                toast.error('Veuillez remplir tous les champs obligatoires')
                setIsLoading(false)
                return
            }

            console.log('📦 Création de la commande...', { cardType, amount })

            // Créer la commande
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    card_type: cardType,
                    quantity: 1,
                    payment_method: formData.paymentMethod,
                    shipping_address: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        postalCode: formData.postalCode
                    }
                }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erreur lors de la création de la commande')
            }

            console.log('✅ Commande créée:', data.order.id)
            toast.success('Commande créée avec succès !')

            // Rediriger vers la page de paiement appropriée
            const successUrl = encodeURIComponent(
                `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/payment/success?type=${cardType}&amount=${amount}`
            )
            const failureUrl = encodeURIComponent(
                `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/payment/cancelled?type=${cardType}`
            )

            const redirectPage = formData.paymentMethod === 'wave' ? 'wave-redirect' : 'lygos-redirect'

            router.push(
                `/payment/${redirectPage}?order_id=${data.order.id}&type=${cardType}&amount=${amount}&success_url=${successUrl}&failure_url=${failureUrl}`
            )

        } catch (error) {
            console.error('❌ Erreur:', error)
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
            toast.error(errorMessage)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* En-tête */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Commander votre carte Ofika
                    </h1>
                    <p className="text-gray-600">
                        Remplissez vos informations de livraison
                    </p>
                </div>

                {/* Résumé de commande */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-orange-600" />
                            Résumé de votre commande
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Type de carte :</span>
                                <span className="font-semibold">
                                    {cardType === 'nfc_qr' ? 'NFC + QR Code' : 'QR Code uniquement'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Quantité :</span>
                                <span className="font-semibold">1 carte</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total :</span>
                                <span className="text-orange-600">
                                    {parseInt(amount).toLocaleString('fr-FR')} XOF
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Formulaire d'adresse */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-orange-600" />
                            Adresse de livraison
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Label htmlFor="name">Nom complet *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Jean Dupont"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">Téléphone *</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+225 01 23 45 67 89"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email (optionnel)</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="address">Adresse *</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Cocody, Angré, Rue 123"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="city">Ville *</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Abidjan"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="postalCode">Code postal (optionnel)</Label>
                                    <Input
                                        id="postalCode"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        placeholder="00225"
                                    />
                                </div>

                                <div className="md:col-span-2 pt-4 border-t">
                                    <Label className="text-base font-bold mb-3 block">Choisissez votre mode de paiement</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {availableMethods.length > 0 ? (
                                            availableMethods.map((method) => (
                                                <div 
                                                    key={method.id}
                                                    onClick={() => setFormData({...formData, paymentMethod: method.id as any})}
                                                    className={cn(
                                                        "cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                                                        formData.paymentMethod === method.id 
                                                            ? "border-orange-500 bg-orange-50" 
                                                            : "border-gray-100 hover:border-gray-200"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "p-2 rounded-lg",
                                                            formData.paymentMethod === method.id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                                                        )}>
                                                            {method.id === 'lygos' ? <Smartphone className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">{method.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-medium leading-none">
                                                                {method.id === 'lygos' ? 'Mobile Money (OM, Moov, Wave)' : 'Wave Direct Link'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {formData.paymentMethod === method.id && (
                                                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 p-4 bg-gray-50 rounded-xl text-center">
                                                <p className="text-sm text-gray-500 italic">Chargement des modes de paiement...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Retour
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Traitement...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Passer au paiement
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Informations de sécurité */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>🔒 Paiement sécurisé par LyGOS</p>
                    <p className="mt-2">Livraison sous 7-14 jours ouvrés</p>
                </div>
            </div>
        </div>
    )
}

export default function OrderCreatePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                        <p className="text-gray-600">Chargement du formulaire...</p>
                    </div>
                </div>
            </div>
        }>
            <OrderCreateForm />
        </Suspense>
    )
}