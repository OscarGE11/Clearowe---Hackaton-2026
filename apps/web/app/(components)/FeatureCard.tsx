'use client';

import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="w-80 p-6 flex flex-col items-center text-center bg-card">
      {icon}
      <CardTitle className="text-white text-xl font-semibold mb-2">{title}</CardTitle>
      <CardDescription className="text-muted-foreground">{description}</CardDescription>
    </Card>
  );
}
