'use client';

import React from 'react';
import { FlyerData } from '@/lib/types';
import { photoImageStyle, photoSrc } from './layouts/shared';

export default function PhotoImage({
  data,
  alt,
  className,
}: {
  data: FlyerData;
  alt: string;
  className?: string;
}) {
  return <img src={photoSrc(data)} alt={alt} className={className} style={photoImageStyle(data.photoTransform)} />;
}