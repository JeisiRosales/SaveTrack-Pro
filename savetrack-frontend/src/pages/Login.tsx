import React from 'react';
import { LoginForm } from '@/features/auth';
import { Github } from 'lucide-react';

const Login: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col relative overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full flex flex-col items-center">

                    <LoginForm />

                    {/* Enlace a GitHub */}
                    <div className="pt-8 flex justify-center">
                        <a
                            href="https://github.com/JeisiRosales"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card)] text-[10px] text-[var(--muted)] hover:text-[var(--color-primary)] transition-all border border-[var(--card-border)]"
                        >
                            <Github className="w-3 h-3" />
                            <span className="font-bold uppercase tracking-wider">Entra a mi GitHub</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;