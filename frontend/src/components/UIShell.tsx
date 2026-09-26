import { Outlet } from 'react-router-dom';
import Navbar from './navbar';

export default function UIShell() {
  return (
    <div className="ui-shell">
      <Navbar />
      <main className="main-content" style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}