import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env del backend
dotenv.config({ path: path.resolve(__dirname, 'savetrack-backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function countAll() {
    console.log("--- Conteo General de Tablas ---");

    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    console.log("Total Usuarios:", userCount);

    const { count: accCount } = await supabase.from('funding_accounts').select('*', { count: 'exact', head: true });
    console.log("Total Cuentas:", accCount);

    const { count: goalCount } = await supabase.from('savings_goals').select('*', { count: 'exact', head: true });
    console.log("Total Metas:", goalCount);

    const { count: txCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
    console.log("Total Transacciones:", txCount);

    if (goalCount! > 0) {
        const { data: sampleGoals } = await supabase.from('savings_goals').select('id, user_id, name').limit(3);
        console.log("Muestra de metas:", sampleGoals);
    }
}

countAll();
