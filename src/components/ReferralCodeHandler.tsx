"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralCodeHandler() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('referralCode');

  useEffect(() => {
    if (referralCode) {
      localStorage.setItem('referralCode', referralCode);
    }
  }, [referralCode]);

  return null;
}
