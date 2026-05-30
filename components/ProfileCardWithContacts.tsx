'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card';
import { Badge } from '@/components/core/ui/badge';
import { Button } from '@/components/core/ui/button';
import { AddToContactsUnified } from '@/components/AddToContactsUnified';
import { Profile } from '@/lib/types/database';
import { Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ProfileCardWithContactsProps {
  profile: Profile & {
    links?: Array<{
      id: string;
      title: string;
      url: string;
    }>;
  };
  showAddToContacts?: boolean;
  onViewProfile?: (profile: Profile) => void;
}

export function ProfileCardWithContacts({
  profile,
  showAddToContacts = true,
  onViewProfile
}: ProfileCardWithContactsProps) {
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(profile);
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-ofika-orange to-ofika-pink flex items-center justify-center text-white font-semibold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg">{profile.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {profile.profile_type}
                </Badge>
                {profile.is_public && (
                  <Badge variant="outline" className="text-xs">
                    Public
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informations de base */}
        <div className="space-y-2 text-sm">
          {profile.bio && (
            <p className="text-gray-600 line-clamp-2">
              <span className="font-medium">Bio:</span> {profile.bio}
            </p>
          )}
        </div>

        {/* Liens */}
        {profile.links && profile.links.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Liens:</p>
            <div className="space-y-1">
              {profile.links.slice(0, 2).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          {profile.custom_url && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1"
            >
              <Link href={`/${profile.custom_url}`} target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                Voir
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleViewProfile}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Éditer
          </Button>
        </div>

        {/* Bouton Add to Contacts */}
        {showAddToContacts && (
          <div className="pt-2 border-t">
            <AddToContactsUnified
              profile={profile}
              variant="minimal"
              size="sm"
              className="text-xs"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
