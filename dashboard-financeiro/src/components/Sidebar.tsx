"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ReceiptText, BarChart3, Wallet, LogOut, ChevronLeft, ChevronRight, CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { SignOutButton } from "@clerk/nextjs"

import { menuItems } from "@/lib/menu-items"

export function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                "hidden md:flex flex-col h-screen sticky top-0 border-r border-border/50 bg-card transition-all duration-300 ease-in-out z-40",
                collapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            <div className="flex h-16 items-center px-6 border-b border-border/50 shrink-0">
                <Link href="/" className="flex items-center gap-3">
                    <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                        <Wallet className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {!collapsed && (
                        <span className="font-bold text-lg tracking-tight whitespace-nowrap">
                            Prevision<span className="text-primary">Finance</span>
                        </span>
                    )}
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                            pathname === item.href
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                        title={collapsed ? item.name : ""}
                    >
                        <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110")} />
                        {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
                        {pathname === item.href && !collapsed && (
                            <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                        )}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-border/50 space-y-2">
                <SignOutButton>
                    <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group">
                        <LogOut className="h-5 w-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                        {!collapsed && <span className="font-medium text-sm">Sair</span>}
                    </button>
                </SignOutButton>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex md:hidden lg:flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors group shrink-0"
                >
                    {collapsed ? (
                        <ChevronRight className="h-5 w-5 shrink-0" />
                    ) : (
                        <>
                            <ChevronLeft className="h-5 w-5 shrink-0" />
                            <span className="font-medium text-sm">Recolher</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    )
}
