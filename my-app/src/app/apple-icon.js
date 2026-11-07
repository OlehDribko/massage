import { ImageResponse } from 'next/og';

import IconMonogram from '@/components/seo/IconMonogram';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<IconMonogram fontSize={128} />, size);
}
