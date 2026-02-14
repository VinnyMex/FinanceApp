import { LayoutDashboard, ReceiptText, BarChart3, Wallet, Settings, CalendarClock } from "lucide-react"

export const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Contas a Pagar", href: "/payables", icon: CalendarClock },
    { name: "Transações", href: "/transactions", icon: ReceiptText },
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
    { name: "Carteira", href: "/wallet", icon: Wallet },
    { name: "Configurações", href: "/settings", icon: Settings },
]
