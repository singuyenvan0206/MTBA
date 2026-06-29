"use client";
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { API_ENDPOINTS } from '@/constants/endpoints';
import { APP_ROUTES } from '@/constants/routes';
export interface PosSyncState {
  currentPath: string; // e.g. /pos/movies/123 or /pos2/movies/123
  selectedSeats: string[];
  showtimeId: number | null;
  selectedDate?: string;
  showQR?: boolean;
  paymentAmount?: number;
  seatDiscounts?: Record<string, string>;
  paymentMethod?: string;
  selectedTheater?: string;
  isPrinting?: boolean;
  finalTotal?: number;
  // Scroll sync
  scrollY?: number;
  scrollX?: number;
}

/** Debounce helper — tránh flood API khi scroll */
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function usePosSync(isStaff: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [syncState, setSyncState] = useState<PosSyncState>({
    currentPath: pathname || '/pos2',
    selectedSeats: [],
    showtimeId: null
  });
  
  const sessionId = 'QUAY_01'; // Có thể mở rộng sau này
  const bcRef = useRef<BroadcastChannel | null>(null);
  // Ref để tham chiếu pushState trong scroll handler mà không cần đưa vào deps
  const pushStateRef = useRef<(s: Partial<PosSyncState>, force?: boolean) => void>(() => {});

  // ─── Push State ────────────────────────────────────────────────────────────
  const pushState = useCallback((newState: Partial<PosSyncState>, forceBroadcast = false) => {
    // Chỉ staff mới được push, trừ khi forceBroadcast (dùng cho pathname sync)
    if (!isStaff && !forceBroadcast) return;
    
    setSyncState(prev => {
      const updated = { ...prev, ...newState, currentPath: newState.currentPath || pathname || prev.currentPath };
      
      // 1. BroadcastChannel (Same Machine — realtime, không qua server)
      if (bcRef.current) {
        bcRef.current.postMessage(updated);
      }
      
      // 2. API (Cross-Machine — qua backend để đồng bộ 2 máy khác nhau)
      fetch(`${API_ENDPOINTS.POS_SYNC}?session=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      
      return updated;
    });
  }, [isStaff, pathname]);

  // Cập nhật ref mỗi lần pushState thay đổi để scroll handler luôn dùng phiên bản mới nhất
  useEffect(() => {
    pushStateRef.current = pushState;
  }, [pushState]);

  // ─── Xử lý state nhận được (từ BroadcastChannel hoặc API polling) ──────────
  const handleStateUpdate = useCallback((data: PosSyncState) => {
    setSyncState(prev => ({ ...prev, ...data }));
    
    // --- Đồng bộ điều hướng ---
    if (data.currentPath) {
      let targetPath = data.currentPath;
      if (!isStaff && targetPath.startsWith('/pos2')) {
        targetPath = targetPath.replace(APP_ROUTES.POS2, '/pos');
      } else if (isStaff && targetPath.startsWith('/pos') && !targetPath.startsWith('/pos2')) {
        targetPath = targetPath.replace(APP_ROUTES.POS, '/pos2');
      }

      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        router.push(targetPath);
      }
    }

    // --- Đồng bộ scroll (chỉ customer nhận, staff phát) ---
    if (!isStaff && typeof data.scrollY === 'number') {
      window.scrollTo({ top: data.scrollY, left: data.scrollX ?? 0, behavior: 'smooth' });
    }
  }, [isStaff, router]);

  // ─── BroadcastChannel: mở kênh khi mount ──────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const bc = new BroadcastChannel('pos-sync-channel');
    bcRef.current = bc;
    
    bc.onmessage = (event) => {
      if (event.data) handleStateUpdate(event.data);
    };
    
    if (isStaff) {
      // Broadcast đường dẫn hiện tại ngay khi mount
      pushStateRef.current({});
    }

    return () => { bc.close(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaff]);

  // ─── Scroll Sync: Staff phát scroll position ───────────────────────────────
  useEffect(() => {
    if (!isStaff || typeof window === 'undefined') return;

    const handleScroll = debounce(() => {
      pushStateRef.current({
        scrollY: Math.round(window.scrollY),
        scrollX: Math.round(window.scrollX),
      });
    }, 80); // debounce 80ms — đủ mượt mà không làm nặng

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isStaff]);

  // ─── API Polling: Cross-machine sync với Exponential Backoff ───────────────
  // Khi backend down: interval tăng dần 1s → 2s → 4s → tối đa 10s
  // Khi backend phục hồi: interval reset về 1s
  useEffect(() => {
    let currentDelay = 1000;
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.POS_SYNC}?session=${sessionId}`);
        if (!res.ok) throw new Error('not ok');
        const data = await res.json();
        if (data && data.currentPath) handleStateUpdate(data);
        currentDelay = 1000; // Reset về 1s khi thành công
      } catch {
        // Backend down → tăng gấp đôi, tối đa 10s
        currentDelay = Math.min(currentDelay * 2, 10000);
      }
      timeoutId = setTimeout(poll, currentDelay);
    };

    timeoutId = setTimeout(poll, currentDelay);
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleStateUpdate]);


  // ─── Pathname Sync: broadcast khi staff navigate ───────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const current = window.location.pathname;
    if (syncState.currentPath !== current) {
      pushState({ currentPath: current }, true);
    }
  }, [pathname, pushState]);


  return { syncState, pushState };
}
