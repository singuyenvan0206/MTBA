"use client";
import { DISCOUNT_CODES, AGE_LIMITS, MOVIE_STATUS, USER_STATUS } from '@/constants/enums';


import React, { useEffect, useState } from 'react';

import { UI_MESSAGES } from '@/constants/messages';
import { API_ENDPOINTS } from '@/constants/endpoints';
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
    status: USER_STATUS.ACTIVE,
    role: 'ROLE_USER',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.USERS);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await fetch(`${API_ENDPOINTS.USERS_}${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(UI_MESSAGES.C__L_I_X_Y_RA_KHI_X_A_NG__I_D);
    }
  };

  const handleOpenModal = (user: any = null) => {
    setEditingUser(user);
    if (user) {
      let currentRole = 'ROLE_USER';
      if (user.userrole && user.userrole.length > 0) {
        if (user.userrole.some((ur: any) => ur.role?.role_name === "ROLE_ADMIN")) currentRole = 'ROLE_ADMIN';
        else if (user.userrole.some((ur: any) => ur.role?.role_name === "ROLE_STAFF")) currentRole = 'ROLE_STAFF';
      }

      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || '',
        status: user.status || USER_STATUS.ACTIVE,
        role: currentRole,
        password: '' // Don't fill password for edit
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        avatar: '',
        status: USER_STATUS.ACTIVE,
        role: 'ROLE_USER',
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser ? `${API_ENDPOINTS.USERS_}${editingUser.id}` : API_ENDPOINTS.USERS;
      const method = editingUser ? 'PUT' : 'POST';
      
      const payload: any = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password; // Don't send empty password on update
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(errorData.message || UI_MESSAGES.SAVE_FAILED_CHECK_INFO);
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      alert(UI_MESSAGES.C__L_I_X_Y_RA_KHI_L_U_NG__I_D);
    }
  };

  const handleExportCSV = () => {
    const headers = ['User_ID', 'First_Name', 'Last_Name', 'Email', 'Phone', 'Address', 'Role', 'Status'];
    const rows = users.map((u: any) => {
      let currentRole = 'ROLE_USER';
      if (u.userrole && u.userrole.length > 0) {
        if (u.userrole.some((ur: any) => ur.role?.role_name === "ROLE_ADMIN")) currentRole = 'ROLE_ADMIN';
        else if (u.userrole.some((ur: any) => ur.role?.role_name === "ROLE_STAFF")) currentRole = 'ROLE_STAFF';
      }
      return [
        u.id,
        `"${(u.first_name || '').replace(/"/g, '""')}"`,
        `"${(u.last_name || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${(u.phone || '').replace(/"/g, '""')}"`,
        `"${(u.address || '').replace(/"/g, '""')}"`,
        `"${currentRole}"`,
        `"${u.status || 'ACTIVE'}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh_sach_nguoi_dung_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      if (lines.length <= 1) {
        alert('File CSV không có dữ liệu!');
        return;
      }

      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const firstNameIndex = header.findIndex(h => h.includes('first_name') || h.includes('họ') || h.includes('firstname'));
      const lastNameIndex = header.findIndex(h => h.includes('last_name') || h.includes('tên') || h.includes('lastname'));
      const emailIndex = header.findIndex(h => h.includes('email') || h.includes('thư điện tử'));
      const phoneIndex = header.findIndex(h => h.includes('phone') || h.includes('sđt') || h.includes('số điện thoại'));
      const addressIndex = header.findIndex(h => h.includes('address') || h.includes('địa chỉ'));
      const roleIndex = header.findIndex(h => h.includes('role') || h.includes('vai trò'));
      const statusIndex = header.findIndex(h => h.includes('status') || h.includes('trạng thái'));
      const passwordIndex = header.findIndex(h => h.includes('password') || h.includes('mật khẩu'));

      if (firstNameIndex === -1 || lastNameIndex === -1 || emailIndex === -1) {
        alert('File CSV phải chứa ít nhất các cột: First_Name, Last_Name, và Email!');
        return;
      }

      let importedCount = 0;
      let errorCount = 0;
      let errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        const cols: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let charIndex = 0; charIndex < row.length; charIndex++) {
          const char = row[charIndex];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cols.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        cols.push(current.trim());

        const first_name = cols[firstNameIndex];
        const last_name = cols[lastNameIndex];
        const email = cols[emailIndex];

        if (!first_name || !last_name || !email) {
          errorCount++;
          continue;
        }

        const phone = phoneIndex !== -1 ? cols[phoneIndex] : '';
        const address = addressIndex !== -1 ? cols[addressIndex] : '';
        const rawRole = roleIndex !== -1 ? cols[roleIndex].trim().toUpperCase() : 'ROLE_USER';
        const role = rawRole.startsWith('ROLE_') ? rawRole : `ROLE_${rawRole}`;
        const rawStatus = statusIndex !== -1 ? cols[statusIndex].trim().toUpperCase() : 'ACTIVE';
        const status = rawStatus === 'ACTIVE' || rawStatus === 'HOẠT ĐỘNG' ? 'ACTIVE' : 'INACTIVE';
        const password = passwordIndex !== -1 && cols[passwordIndex] ? cols[passwordIndex] : '123456';

        const payload = {
          first_name,
          last_name,
          email,
          phone,
          address,
          role,
          status,
          password
        };

        try {
          const res = await fetch(API_ENDPOINTS.USERS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const errMsg = Array.isArray(err.message) ? err.message[0] : (err.message || err.error || 'Lỗi khi thêm người dùng');
            throw new Error(errMsg);
          }

          importedCount++;
        } catch (err: any) {
          errorCount++;
          errors.push(`Dòng ${i + 1}: ${err.message}`);
        }
      }

      let msg = `Đã nhập thành công ${importedCount} người dùng.`;
      if (errorCount > 0) {
        msg += ` Thất bại: ${errorCount} dòng.`;
        if (errors.length > 0) {
          msg += `\nChi tiết lỗi:\n` + errors.slice(0, 5).join('\n') + (errors.length > 5 ? '\n...' : '');
        }
      }
      alert(msg);
      fetchUsers();
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const getRoleBadge = (roles: any[]) => {
    if (!roles || roles.length === 0) return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#e0e0e0', color: '#333' }}>Khách</span>;
    const roleNames = roles.map(r => r.role?.role_name || '').join(', ');
    if (roleNames.includes('ROLE_ADMIN')) {
      return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#ff4d4f', color: '#fff', fontWeight: 'bold' }}>Admin</span>;
    } else if (roleNames.includes('ROLE_STAFF')) {
      return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#faad14', color: '#fff', fontWeight: 'bold' }}>Nhân viên POS</span>;
    }
    return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#1890ff', color: '#fff' }}>User</span>;
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Quản lý Người dùng</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
            style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--foreground)', border: '1px solid var(--card-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' }}
          >
            Xuất CSV
          </button>
          <label
            style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--foreground)', border: '1px solid var(--card-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'inline-block', transition: 'all 0.2s' }}
          >
            Nhập CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
            />
          </label>
          <button 
            onClick={() => handleOpenModal()}
            style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Thêm người dùng
          </button>
        </div>
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
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Vai trò</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Trạng thái</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user: any) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '15px', opacity: 0.7 }}>#{user.id}</td>
                      <td style={{ padding: '15px', fontWeight: '500' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img 
                            src={user.avatar || 'https://i.pravatar.cc/150?u=' + user.id} 
                            alt="avatar" 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #444' }} 
                          />
                          <span>{user.first_name} {user.last_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>{user.email}</td>
                      <td style={{ padding: '15px' }}>{user.phone || 'Chưa cập nhật'}</td>
                      <td style={{ padding: '15px', opacity: 0.8, maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.address || 'Chưa cập nhật'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {getRoleBadge(user.userrole)}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                          background: user.status === USER_STATUS.ACTIVE ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)', 
                          color: user.status === USER_STATUS.ACTIVE ? '#28a745' : '#dc3545',
                        }}>
                          {user.status === USER_STATUS.ACTIVE ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <button onClick={() => handleOpenModal(user)} style={{ marginRight: '10px', padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sửa</button>
                        <button onClick={() => handleDelete(user.id)} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px 0', textAlign: 'center', opacity: 0.6 }}>
                      Chưa có người dùng nào trong hệ thống
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1f1f1f', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #333' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#fff' }}>{editingUser ? 'Sửa Người dùng' : 'Thêm Người dùng'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Họ</label>
                  <input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Tên</label>
                  <input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Mật khẩu {editingUser && '(Bỏ trống nếu không đổi)'}</label>
                <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Số điện thoại</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Địa chỉ</label>
                <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Ảnh đại diện (URL)</label>
                <input value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} placeholder="https://example.com/avatar.jpg" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Trạng thái</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }}>
                  <option value={USER_STATUS.ACTIVE}>Hoạt động (ACTIVE)</option>
                  <option value="BLOCKED">Đã khóa (BLOCKED)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Quyền hạn (Role)</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }}>
                  <option value="ROLE_USER">Khách hàng (User)</option>
                  <option value="ROLE_STAFF">Nhân viên POS (Staff)</option>
                  <option value="ROLE_ADMIN">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
