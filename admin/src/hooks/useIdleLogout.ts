import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll'] as const;

function getTimeoutMs(): number {
  const minutes = Number(localStorage.getItem('adminSessionTimeout')) || 15;
  return minutes * 60 * 1000;
}

/**
 * Forces a logout after a period of no user activity, independent of
 * token expiry - an idle admin tab would otherwise stay "logged in" for
 * up to the refresh token's full 30-day rolling window. Duration is
 * read from the same `adminSessionTimeout` localStorage key the
 * Settings page's "Inactivity Session Timeout" dropdown writes to, and
 * re-read live via the `adminSettingsUpdated` event it already
 * dispatches on save.
 */
export function useIdleLogout() {
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = useRef(getTimeoutMs());

  useEffect(() => {
    const handleLogout = () => {
      api.logout();
      navigate('/login', { replace: true });
    };

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(handleLogout, durationRef.current);
    };

    const handleSettingsUpdate = () => {
      durationRef.current = getTimeoutMs();
      resetTimer();
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));
    window.addEventListener('adminSettingsUpdated', handleSettingsUpdate);
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
      window.removeEventListener('adminSettingsUpdated', handleSettingsUpdate);
    };
  }, [navigate]);
}
