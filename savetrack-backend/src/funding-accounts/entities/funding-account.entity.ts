export interface FundingAccount {
    id: string; // ID único de la cuenta de financiamiento
    user_id: string; // ID del usuario propietario de la cuenta
    name: string; // Nombre de la cuenta de financiamiento
    balance: number; // Saldo actual de la cuenta de financiamiento
    created_at: Date; // Fecha de creación de la cuenta de financiamiento
    updated_at: Date; // Fecha de actualización de la cuenta de financiamiento
}