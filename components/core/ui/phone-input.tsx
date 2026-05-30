import { useState, useEffect } from 'react'
import { ChevronDown, Phone } from 'lucide-react'
import { Input } from '@/components/core/ui/input'

// Liste des pays avec leurs indicatifs
export const COUNTRIES = [
    { code: 'CI', name: 'Côte d\'Ivoire', dial: '+225', flag: '🇨🇮' },
    { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
    { code: 'US', name: 'États-Unis', dial: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'Royaume-Uni', dial: '+44', flag: '🇬🇧' },
    { code: 'DE', name: 'Allemagne', dial: '+49', flag: '🇩🇪' },
    { code: 'ES', name: 'Espagne', dial: '+34', flag: '🇪🇸' },
    { code: 'IT', name: 'Italie', dial: '+39', flag: '🇮🇹' },
    { code: 'BE', name: 'Belgique', dial: '+32', flag: '🇧🇪' },
    { code: 'CH', name: 'Suisse', dial: '+41', flag: '🇨🇭' },
    { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
    { code: 'SN', name: 'Sénégal', dial: '+221', flag: '🇸🇳' },
    { code: 'ML', name: 'Mali', dial: '+223', flag: '🇲🇱' },
    { code: 'BF', name: 'Burkina Faso', dial: '+226', flag: '🇧🇫' },
    { code: 'BJ', name: 'Bénin', dial: '+229', flag: '🇧🇯' },
    { code: 'TG', name: 'Togo', dial: '+228', flag: '🇹🇬' },
    { code: 'GN', name: 'Guinée', dial: '+224', flag: '🇬🇳' },
    { code: 'NE', name: 'Niger', dial: '+227', flag: '🇳🇪' },
    { code: 'MR', name: 'Mauritanie', dial: '+222', flag: '🇲🇷' },
    { code: 'CM', name: 'Cameroun', dial: '+237', flag: '🇨🇲' },
    { code: 'GA', name: 'Gabon', dial: '+241', flag: '🇬🇦' },
    { code: 'CG', name: 'Congo', dial: '+242', flag: '🇨🇬' },
    { code: 'CD', name: 'RD Congo', dial: '+243', flag: '🇨🇩' },
    { code: 'MA', name: 'Maroc', dial: '+212', flag: '🇲🇦' },
    { code: 'DZ', name: 'Algérie', dial: '+213', flag: '🇩🇿' },
    { code: 'TN', name: 'Tunisie', dial: '+216', flag: '🇹🇳' },
] as const

interface PhoneInputProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    placeholder?: string
}

export function PhoneInput({ value = '', onChange, disabled = false, placeholder = 'XX XX XX XX XX' }: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState<typeof COUNTRIES[number]>(COUNTRIES[0]) // Côte d'Ivoire par défaut
    const [phoneNumber, setPhoneNumber] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    // Extraire le pays et le numéro à partir de la valeur complète
    useEffect(() => {
        if (value && value.startsWith('+')) {
            // Trouver le pays correspondant à l'indicatif
            const country = COUNTRIES.find(c => value.startsWith(c.dial))
            if (country) {
                setSelectedCountry(country)
                setPhoneNumber(value.substring(country.dial.length).trim())
            }
        } else if (value) {
            // Si pas d'indicatif, utiliser juste le numéro
            setPhoneNumber(value)
        }
    }, [value])

    // Mettre à jour la valeur complète quand le pays ou le numéro change
    useEffect(() => {
        const fullNumber = phoneNumber ? `${selectedCountry.dial} ${phoneNumber}` : ''
        if (fullNumber !== value) {
            onChange(fullNumber)
        }
    }, [selectedCountry, phoneNumber])

    const handleCountrySelect = (country: typeof COUNTRIES[number]) => {
        setSelectedCountry(country)
        setIsOpen(false)
        setSearchQuery('')
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value
        // Autoriser uniquement les chiffres et espaces
        const cleaned = input.replace(/[^\d\s]/g, '')
        setPhoneNumber(cleaned)
    }

    // Filtrer les pays selon la recherche
    const filteredCountries = searchQuery
        ? COUNTRIES.filter(country =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.dial.includes(searchQuery)
        )
        : COUNTRIES

    return (
        <div className="relative">
            <div className="flex gap-2">
                {/* Sélecteur de pays */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        disabled={disabled}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-between"
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-xl">{selectedCountry.flag}</span>
                            <span className="text-sm font-medium text-gray-700">{selectedCountry.dial}</span>
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>

                    {/* Dropdown */}
                    {isOpen && (
                        <div className="absolute z-50 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[400px] overflow-hidden">
                            {/* Barre de recherche */}
                            <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                                <Input
                                    type="text"
                                    placeholder="Rechercher un pays..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full"
                                    autoFocus
                                />
                            </div>

                            {/* Liste des pays */}
                            <div className="overflow-y-auto max-h-[340px]">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => handleCountrySelect(country)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedCountry.code === country.code ? 'bg-orange-50' : ''
                                                }`}
                                        >
                                            <span className="text-2xl">{country.flag}</span>
                                            <div className="flex-1 text-left">
                                                <div className="text-sm font-medium text-gray-900">{country.name}</div>
                                                <div className="text-xs text-gray-500">{country.dial}</div>
                                            </div>
                                            {selectedCountry.code === country.code && (
                                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        Aucun pays trouvé
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Champ de numéro */}
                <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Affichage du numéro complet */}
            {phoneNumber && (
                <p className="text-xs text-gray-500 mt-1 ml-1">
                    Numéro complet: <span className="font-medium">{selectedCountry.dial} {phoneNumber}</span>
                </p>
            )}

            {/* Overlay pour fermer le dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    )
}
