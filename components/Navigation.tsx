'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/report', icon: BarChart3, label: 'Report' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-3 border-black md:hidden z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-[#9B8BD9]'
                  : 'text-gray-600 hover:text-[#C8F2E8]'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs mt-1 font-medium" style={{ fontFamily: 'Helvetica, sans-serif' }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
