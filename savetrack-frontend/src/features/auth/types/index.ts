export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface AuthResponse {
    data: {
        user: User;
        session: {
            access_token: string;
            refresh_token: string;
        };
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    name: string;
}