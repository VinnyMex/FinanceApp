import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <SignIn
            appearance={{
                elements: {
                    rootBox: "w-full max-w-md",
                    cardBox: "w-full shadow-none border-none bg-transparent",
                    card: "w-full shadow-none bg-transparent p-0",
                    headerTitle: "text-2xl font-bold text-foreground",
                    headerSubtitle: "text-muted-foreground",
                    socialButtonsBlockButton: "bg-card border border-border/50 text-foreground hover:bg-accent transition-colors",
                    socialButtonsBlockButtonText: "text-foreground font-medium",
                    dividerLine: "bg-border/50",
                    dividerText: "text-muted-foreground",
                    formFieldLabel: "text-foreground font-medium",
                    formFieldInput: "bg-card border-border/50 text-foreground focus:ring-primary rounded-lg",
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg h-11 transition-colors",
                    footerActionLink: "text-primary hover:text-primary/80 font-medium",
                    footerActionText: "text-muted-foreground",
                    identityPreviewEditButton: "text-primary",
                    formFieldAction: "text-primary",
                },
            }}
        />
    );
}
