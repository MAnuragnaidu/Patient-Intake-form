'use client';

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <>
      <style>{`
        .logout-btn {
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .logout-btn:hover {
          color: #f87171;
          border-color: rgba(248,113,113,0.3);
          background: rgba(239,68,68,0.08);
        }
      `}</style>
      <button className="logout-btn" onClick={handleLogout}>
        Log out
      </button>
    </>
  );
}