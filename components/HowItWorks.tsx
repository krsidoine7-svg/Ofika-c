'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/core/ui/button"
import { ArrowRight, User, CreditCard, Truck, Clock, Shield, Smartphone, CheckCircle, Settings } from "lucide-react"

// Variants d'animation
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export function HowItWorks() {
  return (
    <motion.section 
      id="how-it-works" 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={staggerContainer}
      className="py-16 sm:py-20 bg-white"
    >
      <div className="container mx-auto px-4">
        <motion.div variants={fadeInUp} className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Comment <span className="ofika-text-gradient">ça marche</span> ?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Créez votre carte professionnelle en 3 étapes simples
          </p>
        </motion.div>

        {/* Étapes principales */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-16">
            {/* Étape 1 - Création */}
            <motion.div
              variants={fadeInUp}
              className="text-center relative"
            >
              <div className="relative">
                <motion.div 
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mx-auto mb-6"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 360,
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)"
                  }}
                  transition={{ duration: 0.6 }}
                >
                  1
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-ofika-orange rounded-full flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <User className="w-4 h-4 text-white" />
                </motion.div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Créez votre profil</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Remplissez vos informations professionnelles : nom, titre, entreprise, contacts. 
                Personnalisez votre design et choisissez vos couleurs.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-center space-x-2 text-blue-600 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  <span>2 minutes</span>
                </div>
              </div>
            </motion.div>

            {/* Flèche de connexion */}
            <div className="hidden md:flex items-center justify-center">
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-8 h-8 text-gray-400" />
              </motion.div>
            </div>

            {/* Étape 2 - Commande */}
            <motion.div
              variants={fadeInUp}
              className="text-center relative"
            >
              <div className="relative">
                <motion.div 
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mx-auto mb-6"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 360,
                    boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)"
                  }}
                  transition={{ duration: 0.6 }}
                >
                  2
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-ofika-orange rounded-full flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <CreditCard className="w-4 h-4 text-white" />
                </motion.div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Commandez votre carte</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Choisissez votre type de carte (NFC+QR ou QR seulement), 
                validez votre commande et effectuez le paiement sécurisé.
              </p>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-center space-x-2 text-green-600 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  <span>Paiement sécurisé</span>
                </div>
              </div>
            </motion.div>

            {/* Flèche de connexion */}
            <div className="hidden md:flex items-center justify-center">
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <ArrowRight className="w-8 h-8 text-gray-400" />
              </motion.div>
            </div>

            {/* Étape 3 - Livraison */}
            <motion.div
              variants={fadeInUp}
              className="text-center relative"
            >
              <div className="relative">
                <motion.div 
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mx-auto mb-6"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 360,
                    boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)"
                  }}
                  transition={{ duration: 0.6 }}
                >
                  3
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-ofika-orange rounded-full flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <Truck className="w-4 h-4 text-white" />
                </motion.div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Recevez et partagez</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Votre carte personnalisée vous est livrée en 3-5 jours. 
                Commencez à partager vos contacts instantanément !
              </p>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-center space-x-2 text-purple-600 text-sm font-medium">
                  <Truck className="w-4 h-4" />
                  <span>Livraison gratuite</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Processus détaillé */}
          <motion.div 
            variants={fadeInUp}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 sm:p-12"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
              Processus détaillé
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Création de carte */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Personnalisation</h4>
                    <p className="text-gray-600 text-sm">
                      Choisissez vos couleurs, ajoutez votre logo, personnalisez le design selon votre image de marque.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Test en temps réel</h4>
                    <p className="text-gray-600 text-sm">
                      Prévisualisez votre carte et testez le partage NFC/QR avant validation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Validation</h4>
                    <p className="text-gray-600 text-sm">
                      Vérifiez toutes vos informations et validez votre commande.
                    </p>
                  </div>
                </div>
              </div>

              {/* Commande et livraison */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Paiement sécurisé</h4>
                    <p className="text-gray-600 text-sm">
                      Payez en toute sécurité par carte bancaire, mobile money ou virement.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Settings className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Fabrication</h4>
                    <p className="text-gray-600 text-sm">
                      Votre carte est fabriquée avec des matériaux premium et la puce NFC intégrée.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Livraison rapide</h4>
                    <p className="text-gray-600 text-sm">
                      Livraison gratuite dans toute l'Afrique de l'Ouest en 3-5 jours ouvrés.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Prêt à créer votre carte ?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de professionnels qui utilisent déjà Ofika pour leur networking
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="bg-ofika-orange hover:bg-ofika-orange/90 text-lg px-8 py-4">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
