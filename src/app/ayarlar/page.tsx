'use client';

import { useState } from 'react';
import { ProfileSection } from '@/components/ayarlar/profile-section';
import { BackupSection } from '@/components/ayarlar/backup-section';
import { ApiKeySection } from '@/components/ayarlar/api-key-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AyarlarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-gray-600">Uygulama ayarlarını yönetin</p>
      </div>

      <Tabs defaultValue="profil" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="yedekleme">Yedekleme</TabsTrigger>
          <TabsTrigger value="api">API Anahtarı</TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="space-y-4">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="yedekleme" className="space-y-4">
          <BackupSection />
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <ApiKeySection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
