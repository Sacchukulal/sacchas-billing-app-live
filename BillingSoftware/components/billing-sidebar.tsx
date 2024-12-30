"use client"

import { LayoutDashboard, FileText, PieChart, Printer, Building } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: FileText, label: 'Create Invoice', href: '/create-invoice' },
  { icon: PieChart, label: 'Reports', href: '/reports' },
  { icon: Printer, label: 'Printer Settings', href: '/printer-settings' },
  { icon: Building, label: 'Company Settings', href: '/company-settings' },
]

export function BillingSidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 min-h-screen border-r bg-background">
      <div className="border-b">
        <h2 className="text-xl font-semibold px-6 py-4">Billing Software</h2>
      </div>
      <nav className="p-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 mb-1 rounded-md transition-colors
              ${pathname === item.href 
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-muted text-foreground/60 hover:text-foreground'
              }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            <span className="text-base">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

