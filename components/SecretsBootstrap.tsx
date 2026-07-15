'use client';

import { useEffect } from 'react';
import { useSecretsStore } from '@/stores/useSecretsStore';

/**
 * Mount this once near the root (app/layout.tsx, alongside
 * QualityTierBootstrap) — reads previously-found secrets out of
 * localStorage on mount. Split into its own effect rather than reading
 * localStorage directly in useSecretsStore's initializer, since the
 * server has no localStorage at all and doing it there would mean every
 * server render and the first client render disagree (a hydration
 * mismatch) whenever anything had actually been found before.
 */
export function SecretsBootstrap() {
  const hydrate = useSecretsStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
