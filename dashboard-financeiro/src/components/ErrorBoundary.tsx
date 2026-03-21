"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Em produção, enviar para serviço de monitoramento (ex: Sentry)
        console.error("ErrorBoundary capturou erro:", error, info.componentStack)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback

            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8 text-center">
                    <div className="rounded-full bg-destructive/10 p-4">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Algo deu errado</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Ocorreu um erro inesperado. Tente recarregar a página.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={this.handleReset}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Tentar novamente
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
}
