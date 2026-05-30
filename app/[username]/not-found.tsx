import Link from 'next/link';
import { Button } from '@/components/core/ui/button';

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ofika-orange to-ofika-pink flex items-center justify-center">
      <div className="text-center text-white p-6">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Profil non trouvé</h2>
        <p className="text-white/80 mb-8">
          Ce profil n'existe pas ou n'est pas public.
        </p>
        <Link href="/">
          <Button className="bg-white text-ofika-orange hover:bg-white/90">
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}