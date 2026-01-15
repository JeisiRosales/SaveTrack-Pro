import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Intentar cargar variables de entorno del backend
dotenv.config({ path: path.resolve(__dirname, '../../savetrack-backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan SUPABASE_URL o SUPABASE_KEY en el .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("--- Diagnóstico de Base de Datos ---");

    // 1. Verificar usuarios
    const { data: users, error: userError } = await supabase.from('users').select('id, email').limit(5);
    console.log("Usuarios (ejemplo):", users || userError);

    if (users && users.length > 0) {
        const testUserId = users[0].id;
        console.log(`\nProbando con el primer usuario ID: ${testUserId}`);

        // 2. Cuentas
        const { data: accounts, error: accError } = await supabase
            .from('funding_accounts')
            .select('*')
            .eq('user_id', testUserId);
        console.log(`Cuentas encontradas: ${accounts?.length || 0}`, accounts || accError);

        // 3. Metas
        const { data: goals, error: goalError } = await supabase
            .from('savings_goals')
            .select('*')
            .eq('user_id', testUserId);
        console.log(`Metas encontradas: ${goals?.length || 0}`, goals || goalError);

        // 4. Transacciones
        if (accounts && accounts.length > 0) {
            const accIds = accounts.map(a => a.id);
            const { data: txs, error: txError } = await supabase
                .from('transactions')
                .select('*, funding_accounts(name), savings_goals(name)')
                .in('account_id', accIds);
            console.log(`Transacciones encontradas: ${txs?.length || 0}`, txs || txError);
        }
    } else {
        console.log("No se encontraron usuarios en la tabla 'users'.");
    }
}

diagnose();
