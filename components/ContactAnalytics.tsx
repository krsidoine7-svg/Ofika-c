'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContactAnalytics } from '@/lib/hooks/useContactAnalytics';
import { Download, Share2, Smartphone, Monitor, TrendingUp } from 'lucide-react';
import { BetaFeatureModal, useBetaFeature } from "@/components/ui/beta-feature-modal";

interface ContactAnalyticsProps {
  profileId: string;
  className?: string;
}

interface ContactStats {
  totalGenerated: number;
  totalDownloaded: number;
  totalShared: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
  };
  last30Days: number;
  last7Days: number;
}

export function ContactAnalytics({ profileId, className }: ContactAnalyticsProps) {
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { stats: analyticsStats, loading: analyticsLoading } = useContactAnalytics(profileId);
  const { isModalOpen, featureName, showBetaModal, closeModal } = useBetaFeature();

  useEffect(() => {
    if (analyticsStats) {
      setStats({
        totalGenerated: analyticsStats.total_generated || 0,
        totalDownloaded: analyticsStats.total_downloaded || 0,
        totalShared: analyticsStats.total_shared || 0,
        deviceBreakdown: {
          mobile: analyticsStats.mobile_count || 0,
          desktop: analyticsStats.desktop_count || 0
        },
        last30Days: analyticsStats.last_30_days || 0,
        last7Days: Math.floor((analyticsStats.last_30_days || 0) / 4) // Approximation
      });
    }
    setIsLoading(analyticsLoading);
  }, [analyticsStats, analyticsLoading]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Analytics Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Analytics Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  const totalActions = stats.totalGenerated + stats.totalDownloaded + stats.totalShared;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Analytics Contacts
          <Badge variant="secondary" className="ml-2 text-xs bg-orange-100 text-orange-700 border-orange-200">
            Bêta
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-ofika-orange">{totalActions}</div>
            <div className="text-sm text-gray-600">Total actions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-ofika-pink">{stats.last7Days}</div>
            <div className="text-sm text-gray-600">Cette semaine</div>
          </div>
        </div>

        {/* Détail des actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Download className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm">Téléchargés</span>
            </div>
            <Badge variant="secondary">{stats.totalDownloaded}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Share2 className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm">Partagés</span>
            </div>
            <Badge variant="secondary">{stats.totalShared}</Badge>
          </div>
        </div>

        {/* Répartition par device */}
        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium mb-2">Appareils</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm">Mobile</span>
              </div>
              <Badge variant="outline">{stats.deviceBreakdown.mobile}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Monitor className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm">Desktop</span>
              </div>
              <Badge variant="outline">{stats.deviceBreakdown.desktop}</Badge>
            </div>
          </div>
        </div>

        {/* Période */}
        <div className="pt-3 border-t text-xs text-gray-500">
          <p>Dernières 30 jours: {stats.last30Days} actions</p>
        </div>
      </CardContent>
      
      <BetaFeatureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        featureName={featureName}
      />
    </Card>
  );
}
