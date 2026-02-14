"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"
import { Bell, Search, Wallet, X, Menu, LogOut, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef, useTransition } from "react"
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/app/(dashboard)/actions/notifications"
import { menuItems } from "@/lib/menu-items"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet"
import { SignOutButton } from "@clerk/nextjs"

type Notification = {
    id: string
    title: string
    message: string
    type: string
    read: boolean
    createdAt: Date
}

export function Topbar() {
    const { user } = useUser()
    const pathname = usePathname()
    const router = useRouter()
    const now = new Date()
    const hour = now.getHours()

    const [searchQuery, setSearchQuery] = useState("")
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isPending, startTransition] = useTransition()
    const notifRef = useRef<HTMLDivElement>(null)

    let greeting = "Bom dia"
    if (hour >= 12 && hour < 18) greeting = "Boa tarde"
    if (hour >= 18 || hour < 5) greeting = "Boa noite"

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchQuery.trim()) {
                router.push(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`)
            }
        }, 400)
        return () => clearTimeout(timeout)
    }, [searchQuery, router])

    // Load notifications
    useEffect(() => {
        if (showNotifications) {
            startTransition(async () => {
                try {
                    const notifs = await getNotifications()
                    setNotifications(notifs as Notification[])
                } catch { /* ignore if not loaded yet */ }
            })
        }
    }, [showNotifications])

    // Close notification dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const unreadCount = notifications.filter(n => !n.read).length

    const handleMarkAllRead = () => {
        startTransition(async () => {
            await markAllNotificationsRead()
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        })
    }

    return (
        <header className="h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 shrink-0">
            {/* Logo + Nav */}
            <div className="flex items-center gap-4 lg:gap-6">
                {/* Mobile Menu Trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                        <SheetHeader className="p-6 border-b border-border/50 text-left">
                            <SheetTitle className="flex items-center gap-2">
                                <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                                    <Wallet className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">
                                    Prevision<span className="text-primary">Finance</span>
                                </span>
                            </SheetTitle>
                        </SheetHeader>

                        <div className="flex flex-col h-full">
                            {/* Mobile Search */}
                            <div className="p-4 border-b border-border/50">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Pesquisar..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-accent/50 border border-border/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                                {menuItems.map((item) => (
                                    <SheetClose asChild key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                                pathname === item.href
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5 shrink-0" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SheetClose>
                                ))}
                            </nav>

                            <div className="p-4 border-t border-border/50 mt-auto">
                                <div className="flex items-center gap-3 mb-4 px-2">
                                    <UserButton
                                        afterSignOutUrl="/sign-in"
                                        appearance={{
                                            elements: {
                                                userButtonAvatarBox: "h-9 w-9 rounded-lg border border-border/50"
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{user?.fullName || "Usuário"}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                            {user?.primaryEmailAddress?.emailAddress}
                                        </span>
                                    </div>
                                </div>
                                <SignOutButton>
                                    <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group">
                                        <LogOut className="h-5 w-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                                        <span className="font-medium text-sm">Sair</span>
                                    </button>
                                </SignOutButton>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center hidden md:flex">
                        <Wallet className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg tracking-tight hidden lg:inline">
                        Prevision<span className="text-primary">Finance</span>
                    </span>
                    {/* Mobile Logo Text only */}
                    <span className="font-bold text-lg tracking-tight md:hidden">
                        Prevision<span className="text-primary">Finance</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {menuItems.slice(0, 5).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            <span className="hidden xl:inline">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Right side: greeting + search + notifications + user */}
            <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden xl:inline-block text-sm text-muted-foreground">
                    {greeting}, <span className="text-foreground font-medium">{user?.firstName || "Usuário"}</span>
                </span>

                {/* Search - Desktop */}
                <div className="hidden md:flex items-center relative">
                    <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-accent/50 border border-border/50 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-[140px] lg:w-[220px] transition-all"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-3" title="Limpar pesquisa">
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                    )}
                </div>

                {/* Notifications */}
                <div ref={notifRef} className="relative">
                    <button
                        title="Notificações"
                        aria-label="Notificações"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-4 w-4 bg-primary rounded-full border-2 border-background text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 bg-card border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-border/50">
                                <h3 className="font-semibold text-sm">Notificações</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Marcar todas como lidas
                                    </button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-sm">
                                        Nenhuma notificação
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={cn(
                                                "p-3 border-b border-border/30 hover:bg-accent/50 transition-colors cursor-pointer",
                                                !notif.read && "bg-primary/5"
                                            )}
                                            onClick={() => {
                                                startTransition(async () => {
                                                    await markNotificationRead(notif.id)
                                                    setNotifications(prev =>
                                                        prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                                                    )
                                                })
                                            }}
                                        >
                                            <div className="flex items-start gap-2">
                                                {!notif.read && (
                                                    <div className="h-2 w-2 bg-primary rounded-full mt-1.5 shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{notif.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-border/50 hidden md:block" />

                <div className="hidden md:block">
                    <UserButton
                        afterSignOutUrl="/sign-in"
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "h-9 w-9 rounded-lg border border-border/50"
                            }
                        }}
                    />
                </div>
            </div>
        </header>
    )
}
