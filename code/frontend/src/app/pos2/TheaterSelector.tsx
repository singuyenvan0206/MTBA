'use client';
import { useTheater } from './TheaterContext';

export default function TheaterSelector() {
  const { theaters, selectedTheater, setSelectedTheater } = useTheater();

  return (
    <div className="theater-selector-container" style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ color: 'var(--text-color)', marginRight: '10px' }}>Cụm Rạp:</label>
        <select 
          value={selectedTheater} 
          onChange={(e) => setSelectedTheater(e.target.value)}
          style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', border: '1px solid #444', outline: 'none' }}
        >
          {theaters.length === 0 ? <option value="1">Đang tải...</option> : null}
          {theaters.map((t) => (
            <option key={t.id} value={t.id.toString()}>{t.name}</option>
          ))}
        </select>
    </div>
  );
}
