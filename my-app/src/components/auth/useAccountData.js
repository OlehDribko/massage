'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/components/auth/AuthProvider';

const IDLE = { status: 'idle', data: null, error: null, uid: null, key: null };

/**
 * GET `path` for the signed-in user through the shared session. Data is
 * tied to the user's UID and path: after an account switch nothing of the
 * previous account is returned, and a late answer for an old request is
 * dropped. `enabled` false (guest, wrong role…) fetches nothing.
 */
export function useAccountData(path, { enabled = true } = {}) {
  const { controller, state } = useAuth();
  const uid = state.user?.uid ?? null;
  const active = Boolean(enabled && controller && uid && path);
  const key = active ? `${uid}:${path}` : null;
  const [result, setResult] = useState(IDLE);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!key) return undefined;
    const abort = new AbortController();
    let current = true;

    controller
      .api(path, { signal: abort.signal })
      .then((data) => {
        if (current)
          setResult({ status: 'ready', data, error: null, uid, key });
      })
      .catch((error) => {
        if (current && error?.name !== 'AbortError') {
          setResult((previous) => ({
            status: 'error',
            data: previous.key === key ? previous.data : null,
            error,
            uid,
            key,
          }));
        }
      });

    return () => {
      current = false;
      abort.abort();
    };
  }, [controller, key, path, uid, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  // Replace the data with a fresher copy returned by a write.
  const replace = useCallback(
    (data) => setResult({ status: 'ready', data, error: null, uid, key }),
    [uid, key]
  );

  if (!key) return { ...IDLE, reload, replace };
  // Before the first answer for this user/path: loading, never stale data.
  if (result.key !== key) {
    return { status: 'loading', data: null, error: null, reload, replace };
  }
  return { ...result, reload, replace };
}
