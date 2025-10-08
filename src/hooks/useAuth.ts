'use client';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then((res) => res.ok ? setAuthenticated(true) : setAuthenticated(false))
      .catch(() => setAuthenticated(false));
  }, []);

  return authenticated;
}