import { SignIn, SignUp } from '@clerk/clerk-react';
import { X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState(() => 
    searchParams.get('auth_mode') === 'signup' ? 'signup' : 'login'
  );

  useEffect(() => {
    const mode = searchParams.get('auth_mode') === 'signup' ? 'signup' : 'login';
    setAuthMode(mode);
  }, [searchParams]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-[480px] flex justify-center">
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-background border rounded-full p-2 hover:bg-muted transition-colors z-[60] shadow-md"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="w-full" key={authMode}>
          {authMode === 'login' ? (
            <SignIn 
              routing="hash"
              signUpUrl="/?auth_mode=signup"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-2xl border border-border w-full",
                  headerTitle: "text-2xl font-bold font-heading",
                  headerSubtitle: "text-muted-foreground",
                  socialButtonsBlockButton: "border-border hover:bg-secondary transition-colors",
                  formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20",
                  footerActionLink: "text-primary hover:text-primary/80 font-medium"
                }
              }}
            />
          ) : (
            <SignUp 
              routing="hash"
              signInUrl="/?auth_mode=login"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-2xl border border-border w-full",
                  headerTitle: "text-2xl font-bold font-heading",
                  headerSubtitle: "text-muted-foreground",
                  socialButtonsBlockButton: "border-border hover:bg-secondary transition-colors",
                  formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20",
                  footerActionLink: "text-primary hover:text-primary/80 font-medium"
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
