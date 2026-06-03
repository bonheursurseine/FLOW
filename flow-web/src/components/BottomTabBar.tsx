import { NavLink } from 'react-router-dom';

const TAB_ITEMS = [
  { to: '/', label: 'Noter' },
  { to: '/historique', label: 'Historique' },
  { to: '/analyse', label: 'Analyse' },
  { to: '/reglages', label: 'Réglages' }
];

export function BottomTabBar() {
  return (
    <nav aria-label="Navigation principale" className="bottom-tab-bar">
      {TAB_ITEMS.map((item) => (
        <NavLink
          className={({ isActive }) =>
            isActive ? 'bottom-tab-bar__link bottom-tab-bar__link--active' : 'bottom-tab-bar__link'
          }
          end={item.to === '/'}
          key={item.to}
          to={item.to}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
