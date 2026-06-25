import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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

  // Mở BroadcastChannel khi component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('pos-sync-channel');
      bcRef.current = bc;
      
      bc.onmessage = (event) => {
        if (event.data) {
          handleStateUpdate(event.data);
        }
      };
      
      if (isStaff) {
        // Broadcast current path initially
        pushState({});
      }
    }
    return () => {
      if (bcRef.current) {
        bcRef.current.close();
      }
    };
  }, [isStaff]);

  const handleStateUpdate = (data: PosSyncState) => {
    setSyncState(prev => ({ ...prev, ...data }));
    
    // Logic điều hướng chéo giữa 2 màn hình
    if (data.currentPath) {
      let targetPath = data.currentPath;
      if (!isStaff && targetPath.startsWith('/pos2')) {
        targetPath = targetPath.replace('/pos2', '/pos');
      } else if (isStaff && targetPath.startsWith('/pos') && !targetPath.startsWith('/pos2')) {
        targetPath = targetPath.replace('/pos', '/pos2');
      }

      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        router.push(targetPath);
      }
    }
  };

  // Broadcast own pathname changes for two-way navigation sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const current = window.location.pathname;
      if (syncState.currentPath !== current) {
         pushState({ currentPath: current });
      }
    }
  }, [pathname]);

  // Poll API for cross-machine
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetch(`/api/pos/sync?session=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.currentPath) {
             handleStateUpdate(data);
          }
        })
        .catch(err => {});
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [pathname, router]);

  // Push state
  const pushState = useCallback((newState: Partial<PosSyncState>, forceBroadcast = false) => {
    // Only allow if isStaff OR if forced by pathname change
    if (!isStaff && !forceBroadcast) return;
    
    setSyncState(prev => {
      const updated = { ...prev, ...newState, currentPath: newState.currentPath || pathname || prev.currentPath };
      
      // 1. BroadcastChannel (Same Machine)
      if (bcRef.current) {
        bcRef.current.postMessage(updated);
      }
      
      // 2. API (Cross-Machine)
      fetch(`/api/pos/sync?session=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(err => {});
      
      return updated;
    });
  }, [isStaff, pathname]);

  // Broadcast own pathname changes for two-way navigation sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const current = window.location.pathname;
      if (syncState.currentPath !== current) {
         pushState({ currentPath: current }, true);
      }
    }
  }, [pathname, pushState]);

  return { syncState, pushState };
}
