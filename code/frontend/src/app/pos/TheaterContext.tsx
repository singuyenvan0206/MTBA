"use client";
import { STORAGE_KEYS } from '@/constants/storage';

import React, { createContext, useState, useEffect, useContext } from 'react';

type TheaterContextType = {
  theaters: any[];
  selectedTheater: string;
  setSelectedTheater: (id: string) => void;
};

const TheaterContext = createContext<TheaterContextType>({
  theaters: [],
  selectedTheater: '',
  setSelectedTheater: () => {},
});

export const useTheater = () => useContext(TheaterContext);

import { usePathname } from 'next/navigation';
import { usePosSync } from '../../hooks/usePosSync';

import { API_ENDPOINTS } from '@/constants/endpoints';
export const TheaterProvider = ({ children }: { children: React.ReactNode }) => {
  const [theaters, setTheaters] = useState<any[]>([]);
  const [selectedTheater, setSelectedTheater] = useState<string>('');
  
  const pathname = usePathname();
  const isStaff = pathname ? pathname.startsWith('/pos2') : false;
  const { syncState, pushState } = usePosSync(isStaff);

  useEffect(() => {
    fetch(API_ENDPOINTS.THEATERS)
      .then(res => res.json())
      .then(data => {
        setTheaters(Array.isArray(data) ? data : []);
        const stored = localStorage.getItem(STORAGE_KEYS.POS2_THEATER);
        if (stored && data.find((t: any) => t.id.toString() === stored)) {
          setSelectedTheater(stored);
          if (isStaff) pushState({ selectedTheater: stored });
        } else if (data.length > 0) {
          setSelectedTheater(data[0].id.toString());
          if (isStaff) pushState({ selectedTheater: data[0].id.toString() });
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Lắng nghe thay đổi từ syncState
  useEffect(() => {
    if (syncState.selectedTheater && syncState.selectedTheater !== selectedTheater) {
      setSelectedTheater(syncState.selectedTheater);
      localStorage.setItem(STORAGE_KEYS.POS2_THEATER, syncState.selectedTheater);
    }
  }, [syncState.selectedTheater, selectedTheater]);

  const handleSelectTheater = (id: string) => {
    setSelectedTheater(id);
    localStorage.setItem(STORAGE_KEYS.POS2_THEATER, id);
    if (isStaff) {
      pushState({ selectedTheater: id });
    }
  };

  return (
    <TheaterContext.Provider value={{ theaters, selectedTheater, setSelectedTheater: handleSelectTheater }}>
      {children}
    </TheaterContext.Provider>
  );
};
