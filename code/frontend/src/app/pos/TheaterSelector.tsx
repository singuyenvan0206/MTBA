'use client';
import { useTheater } from './TheaterContext';

import { usePathname } from 'next/navigation';

export default function TheaterSelector() {
  const { theaters, selectedTheater, setSelectedTheater } = useTheater();
  const pathname = usePathname();
  const isStaff = pathname ? pathname.startsWith('/pos2') : false;

  return (
    <div className="theater-selector-container" style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ color: 'var(--text-color)', marginRight: '10px' }}>Cụm Rạp:</label>
        <select 
          value={selectedTheater} 
          onChange={(e) => setSelectedTheater(e.target.value)}
          disabled={!isStaff}
          style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', border: '1px solid #444', outline: 'none', opacity: isStaff ? 1 : 0.7, cursor: isStaff ? 'pointer' : 'not-allowed' }}
        >
          {theaters.length === 0 ? <option value="1">Đang tải...</option> : null}
          {theaters.map((t) => (
            <option key={t.id} value={t.id.toString()}>{t.name}</option>
          ))}
        </select>
    </div>
  );
}
