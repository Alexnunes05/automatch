import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { financialService } from '../services/financialService';
import FinancialOverview from '../components/financeiro/FinancialOverview';
import FinancialClients from '../components/financeiro/FinancialClients';
import FinancialExpenses from '../components/financeiro/FinancialExpenses';
import { BarChart3, Users, Receipt } from 'lucide-react';
import Navbar from '../components/Navbar';
import '../components/financeiro/financeiro.css';

// Simple Tab Component
const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className="financial-tab-btn"
        style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
            background: active ? 'hsl(var(--primary))' : 'transparent',
            color: active ? '#000' : '#888',
            border: active ? 'none' : '1px solid transparent',
            fontWeight: active ? 'bold' : 'normal',
            transition: 'all 0.2s'
        }}
    >
        <Icon size={18} /> {label}
    </button>
);

const FinancialDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, clients, expenses
    const [clients, setClients] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clientsData, expensesData] = await Promise.all([
                financialService.getClients(),
                financialService.getExpenses()
            ]);
            setClients(clientsData || []);
            setExpenses(expensesData || []);
        } catch (err) {
            console.error(err);
            setError('Falha ao carregar dados financeiros.');
        } finally {
            setLoading(false);
        }
    };

    // Client Handlers
    const addClient = async (data) => {
        const newClient = await financialService.createClient(data);
        setClients([newClient, ...clients]);
    };
    const editClient = async (id, data) => {
        const updated = await financialService.updateClient(id, data);
        setClients(clients.map(c => c.id === id ? updated : c));
    };
    const deleteClient = async (id) => {
        await financialService.deleteClient(id);
        setClients(clients.filter(c => c.id !== id));
    };

    // Expense Handlers
    const addExpense = async (data) => {
        const newExpense = await financialService.createExpense(data);
        setExpenses([newExpense, ...expenses]); // usually expenses are sorted by date but we just push to top for immediate feedback
        fetchData(); // re-fetch to sort correctly or we can sort manually
    };
    const editExpense = async (id, data) => {
        const updated = await financialService.updateExpense(id, data);
        setExpenses(expenses.map(e => e.id === id ? updated : e));
    };
    const deleteExpense = async (id) => {
        await financialService.deleteExpense(id);
        setExpenses(expenses.filter(e => e.id !== id));
    };


    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '40px' }}>
            <Navbar />
            <div className="container" style={{ marginTop: '40px' }}>
                <header style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
                        Gestão <span style={{ color: 'hsl(var(--primary))' }}>Financeira</span>
                    </h1>
                    <p style={{ color: '#888' }}>Controle completo de clientes, receitas e despesas.</p>
                </header>

                {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Carregando dados financeiros...</div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="financial-tabs-container">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={BarChart3} label="Visão Geral" />
                            <TabButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={Users} label="Clientes" />
                            <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={Receipt} label="Custos" />
                        </div>

                        {/* Content */}
                        <div>
                            {activeTab === 'overview' && (
                                <FinancialOverview
                                    clients={clients}
                                    expenses={expenses}
                                    selectedDate={selectedDate}
                                    onDateChange={setSelectedDate}
                                />
                            )}
                            {activeTab === 'clients' && (
                                <FinancialClients
                                    clients={clients}
                                    onAdd={addClient}
                                    onEdit={editClient}
                                    onDelete={deleteClient}
                                />
                            )}
                            {activeTab === 'expenses' && (
                                <FinancialExpenses
                                    expenses={expenses}
                                    onAdd={addExpense}
                                    onEdit={editExpense}
                                    onDelete={deleteExpense}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FinancialDashboard;
