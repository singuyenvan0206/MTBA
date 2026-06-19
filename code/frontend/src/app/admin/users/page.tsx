'use client';

import React, { useEffect, useState } from 'react';


export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3001/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (roles: any[]) => {
    if (!roles || roles.length === 0) return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#e0e0e0', color: '#333' }}>Khách</span>;
    const roleNames = roles.map(r => r.role?.role_name || '').join(', ');
    if (roleNames.includes('ROLE_ADMIN')) {
      return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#ff4d4f', color: '#fff', fontWeight: 'bold' }}>Admin</span>;
    }
    return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#1890ff', color: '#fff' }}>User</span>;
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Quản lý Người dùng</h1>
      </div>

      <div className="premium-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Họ Tên</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>SĐT</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Địa chỉ</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Vai trò (Role)</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user: any) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '15px', opacity: 0.7 }}>#{user.id}</td>
                      <td style={{ padding: '15px', fontWeight: '500' }}>{user.first_name} {user.last_name}</td>
                      <td style={{ padding: '15px' }}>{user.email}</td>
                      <td style={{ padding: '15px' }}>{user.phone || 'Chưa cập nhật'}</td>
                      <td style={{ padding: '15px', opacity: 0.8, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.address || 'Chưa cập nhật'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {getRoleBadge(user.userrole)}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          background: user.status === 'ACTIVE' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)', 
                          color: user.status === 'ACTIVE' ? '#28a745' : '#dc3545',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 0', textAlign: 'center', opacity: 0.6 }}>
                      Chưa có người dùng nào trong hệ thống
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
