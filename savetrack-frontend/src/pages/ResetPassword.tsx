import React from 'react';
import { ResetPasswordForm } from '@/features/auth';

const ResetPassword: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <ResetPasswordForm />
        </div>
    );
};

export default ResetPassword;