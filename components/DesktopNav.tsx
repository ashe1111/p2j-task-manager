'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, BarChart3, Settings, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/report', icon: BarChart3, label: 'Report' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white border-r-3 border-black z-50" style={{ fontFamily: 'Helvetica, sans-serif' }}>
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C8F2E8] to-[#9B8BD9] flex items-center justify-center border-2 border-black">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">P2J</h1>
            <p className="text-xs text-gray-600">Lazy to Legend</p>
          </div>
        </Link>

        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border-2 ${
                  isActive
                    ? 'bg-[#C8F2E8] text-gray-900 shadow-lg border-black'
                    : 'text-gray-700 hover:bg-[#9B8BD9]/20 border-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-[#9B8BD9] p-4 rounded-2xl border-3 border-black">
          <p className="text-sm font-medium text-white mb-1">
            💡 Pro Tip
          </p>
          <p className="text-xs text-white/90">
            Complete tasks to earn XP and level up from Procrastinator to Achiever!
          </p>
        </div>
      </div>
    </nav>
  );
}
