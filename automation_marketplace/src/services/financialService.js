import { supabase } from './supabase';

export const financialService = {
    // --- Clients ---
    async getClients() {
        const { data, error } = await supabase
            .from('financial_clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async createClient(clientData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Sanitize data
        const payload = {
            ...clientData,
            gestor_id: user.id,
            valor: Number(clientData.valor), // Ensure it's a number
            data_renovacao: clientData.data_renovacao || null // Convert empty string to null
        };

        const { data, error } = await supabase
            .from('financial_clients')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateClient(id, updates) {
        // Sanitize updates
        const payload = { ...updates };
        if (payload.valor) payload.valor = Number(payload.valor);
        if (payload.data_renovacao === '') payload.data_renovacao = null;

        const { data, error } = await supabase
            .from('financial_clients')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteClient(id) {
        const { error } = await supabase
            .from('financial_clients')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // --- Expenses ---
    async getExpenses() {
        const { data, error } = await supabase
            .from('financial_expenses')
            .select('*')
            .order('data', { ascending: false }); // Ordered by expense date usually makes more sense

        if (error) throw error;
        return data;
    },

    async createExpense(expenseData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('financial_expenses')
            .insert([{ ...expenseData, gestor_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateExpense(id, updates) {
        const { data, error } = await supabase
            .from('financial_expenses')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteExpense(id) {
        const { error } = await supabase
            .from('financial_expenses')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
