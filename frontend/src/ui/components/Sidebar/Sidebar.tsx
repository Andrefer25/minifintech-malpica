import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ArrowLeftRight, Clock } from 'lucide-react';
import { cx } from '@/utils/cx';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
  { to: '/transacciones', label: 'Transacciones', icon: ArrowLeftRight },
  { to: '/pendientes', label: 'Pendientes', icon: Clock },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Navegación principal">
      <nav className={styles.nav}>
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cx(styles.item, isActive && styles.active)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className={styles.spacer} />
      <div className={styles.footer}>Realizado por André Malpica</div>
    </aside>
  );
}
