'use client';
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

export const TheaterProvider = ({ children }: { children: React.ReactNode }) => {
  const [theaters, setTheaters] = useState<any[]>([]);
  const [selectedTheater, setSelectedTheater] = useState<string>('');

  useEffect(() => {
    fetch('/api/theaters')
      .then(res => res.json())
      .then(data => {
        setTheaters(Array.isArray(data) ? data : []);
        const stored = localStorage.getItem('pos2_theater');
        if (stored && data.find((t: any) => t.id.toString() === stored)) {
          setSelectedTheater(stored);
        } else if (data.length > 0) {
          setSelectedTheater(data[0].id.toString());
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSelectTheater = (id: string) => {
    setSelectedTheater(id);
    localStorage.setItem('pos2_theater', id);
  };

  return (
    <TheaterContext.Provider value={{ theaters, selectedTheater, setSelectedTheater: handleSelectTheater }}>
      {children}
    </TheaterContext.Provider>
  );
};
