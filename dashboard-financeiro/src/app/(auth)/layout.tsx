export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700" />

                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />

                {/* Glowing orbs */}
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px]" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm h-10 w-10 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
                            </svg>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">
                            Prevision<span className="text-white/70">Finance</span>
                        </span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                            Controle total
                            <br />
                            das suas <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-blue-200">finanças</span>
                        </h1>
                        <p className="text-white/60 text-lg max-w-md leading-relaxed">
                            Dashboard inteligente com IA, controle de parcelamentos e relatórios detalhados para você tomar decisões financeiras melhores.
                        </p>

                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white">100%</span>
                                <span className="text-white/50 text-xs uppercase tracking-wider">Gratuito</span>
                            </div>
                            <div className="h-10 w-px bg-white/20" />
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white">IA</span>
                                <span className="text-white/50 text-xs uppercase tracking-wider">Integrada</span>
                            </div>
                            <div className="h-10 w-px bg-white/20" />
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white">24/7</span>
                                <span className="text-white/50 text-xs uppercase tracking-wider">Disponível</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-white/30 text-sm">
                        © {new Date().getFullYear()} PrevisionFinance. Todos os direitos reservados.
                    </p>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-background relative">
                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-3 mb-10">
                    <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
                        </svg>
                    </div>
                    <span className="font-bold text-xl tracking-tight">
                        Prevision<span className="text-primary">Finance</span>
                    </span>
                </div>

                {children}

                {/* Mobile footer */}
                <p className="lg:hidden text-muted-foreground/50 text-xs mt-10">
                    © {new Date().getFullYear()} PrevisionFinance
                </p>
            </div>
        </div>
    );
}
