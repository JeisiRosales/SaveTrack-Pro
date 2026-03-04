import React from 'react';
import { ForgotPasswordForm } from '@/features/auth';

// Página de Olvidé mi Contraseña
const ForgotPassword: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <ForgotPasswordForm />
        </div>
    );
};

export default ForgotPassword;