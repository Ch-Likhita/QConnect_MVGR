'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from '../../../lib/firebase';

export default function EmailConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;

  useEffect(() => {
    const target = token ? `/profile/complete?token=${encodeURIComponent(token)}` : '/profile/complete';
    router.replace(target);
  }, [token]);

  return null;
}
