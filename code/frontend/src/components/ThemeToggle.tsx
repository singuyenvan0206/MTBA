'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      onClick={toggleTheme}
      title="Chỉnh độ sáng tối"
      className={`fixed bottom-5 right-5 w-[60px] h-[30px] rounded-[30px] cursor-pointer z-[99999] border-2 transition-all duration-300 flex items-center ${
        isLight ? 'bg-[#87CEEB] border-[#87CEEB]' : 'bg-[#1a1a1a] border-[#333]'
      }`}
    >
      <div
        className={`absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full transition-all duration-300 ${
          isLight 
            ? 'bg-white shadow-none translate-x-[30px]' 
            : 'bg-transparent shadow-[inset_-5px_-3px_0_0_#fff] translate-x-0'
        }`}
      />
    </div>
  );
}
