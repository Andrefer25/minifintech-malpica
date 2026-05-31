import { Clock, LayoutDashboard, Plus, Users, ArrowLeftRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cx } from '@/utils/cx';
import styles from './BottomNav.module.css';

export interface BottomNavProps {
  onCreateTransaction: () => void;
}

const ITEMS = [
  { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
];

const ITEMS_RIGHT = [
  { to: '/transacciones', label: 'Trans.', icon: ArrowLeftRight },
  { to: '/pendientes', label: 'Pendientes', icon: Clock },
];

export function BottomNav({ onCreateTransaction }: BottomNavProps) {
  return (
    <nav className={styles.nav} aria-label="Navegación principal">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cx(styles.item, isActive && styles.active)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
      <button
        type="button"
        className={styles.create}
        onClick={onCreateTransaction}
        aria-label="Crear transacción"
      >
        <Plus size={22} />
      </button>
      {ITEMS_RIGHT.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cx(styles.item, isActive && styles.active)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
