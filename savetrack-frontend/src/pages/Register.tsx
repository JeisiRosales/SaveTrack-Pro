import React from 'react';
import { RegisterForm } from '@/features/auth';

// Página de Registro
const Register: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <RegisterForm />
        </div>
    );
};

export default Register;