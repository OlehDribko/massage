import { ImageResponse } from 'next/og';

import IconMonogram from '@/components/seo/IconMonogram';

export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<IconMonogram fontSize={36} />, size);
}
