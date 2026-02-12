import React, { useMemo } from 'react';
import { TrendingUp, Users, DollarSign, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend }) => (
    <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#999', fontSize: '14px', fontWeight: '500' }}>{title}</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: 'hsl(var(--primary))' }}>
                <Icon size={20} />
            </div>
        </div>
        <div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>{value}</div>
            {subtitle && <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{subtitle}</div>}
        </div>
    </div>
);

const FinancialOverview = ({ clients, expenses, selectedDate, onDateChange }) => {

    // Helper to check if date is in selected month/year
    const isInMonth = (dateStr) => {
        const date = new Date(dateStr);
        const [year, month] = selectedDate.split('-');
        return date.getFullYear() === parseInt(year) && (date.getMonth() + 1) === parseInt(month);
    };

    // --- KPI Calculations ---

    const revenue = useMemo(() => {
        let total = 0;
        const [year, month] = selectedDate.split('-').map(Number);
        const selectedMonthStart = new Date(year, month - 1, 1);
        const selectedMonthEnd = new Date(year, month, 0);

        clients.forEach(client => {
            if (client.status !== 'active') return;

            if (client.tipo_contrato === 'one_time') {
                if (isInMonth(client.data_inicio)) {
                    total += Number(client.valor);
                }
            } else if (client.tipo_contrato === 'recurring') {
                // Check if active in this period
                const start = new Date(client.data_inicio);
                // Simple logic: if started before or during this month
                if (start <= selectedMonthEnd) {
                    total += Number(client.valor);
                }
            }
        });
        return total;
    }, [clients, selectedDate]);

    const mrr = useMemo(() => {
        return clients
            .filter(c => c.status === 'active' && c.tipo_contrato === 'recurring')
            .reduce((acc, c) => acc + Number(c.valor), 0);
    }, [clients]);

    const activeClients = clients.filter(c => c.status === 'active').length;

    const costs = useMemo(() => {
        return expenses
            .filter(e => isInMonth(e.data)) // Simplification: expenses are dated
            .reduce((acc, e) => acc + Number(e.valor), 0);
    }, [expenses, selectedDate]);

    const profit = revenue - costs;

    const canceledInMonth = useMemo(() => {
        return clients.filter(c => c.status === 'canceled' && isInMonth(c.data_inicio)).length; // Simplified logic for cancellation date (using start date for now as cancellation date isn't stored explicitly)
    }, [clients, selectedDate]);

    // Prediction: MRR - recurring expiring next month (mock logic as per requirements)
    const nextMonthPrediction = useMemo(() => {
        // Just simply MRR for now, advanced prediction requires more data
        return mrr;
    }, [mrr]);


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="financial-dashboard-header">
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Visão Geral</h2>
                <input
                    type="month"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    style={{
                        background: '#000', color: '#fff', border: '1px solid #333',
                        padding: '8px 12px', borderRadius: '8px', cursor: 'pointer'
                    }}
                />
            </div>

            <div className="financial-overview-grid">
                <KPICard
                    title="Receita do Mês"
                    value={`R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                />
                <KPICard
                    title="MRR (Recorrente)"
                    value={`R$ ${mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon={TrendingUp}
                />
                <KPICard
                    title="Lucro Estimado"
                    value={`R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon={Activity}
                    subtitle={`${((profit / (revenue || 1)) * 100).toFixed(1)}% de margem`}
                />
                <KPICard
                    title="Custos do Mês"
                    value={`R$ ${costs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon={CreditCard}
                />
                <KPICard
                    title="Clientes Ativos"
                    value={activeClients}
                    icon={Users}
                    subtitle={`${canceledInMonth} cancelamentos este mês`}
                />
                <KPICard
                    title="Previsão Próx. Mês"
                    value={`R$ ${nextMonthPrediction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon={ArrowUpRight}
                />
            </div>

            {/* Simple Charts Placeholder - using pure CSS bars for simplicity and performance */}
            <div className="financial-charts-grid">
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Distribuição de Custos</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {['api', 'server', 'tools', 'freelancer', 'other'].map(cat => {
                            const catTotal = expenses
                                .filter(e => e.categoria === cat && isInMonth(e.data))
                                .reduce((acc, e) => acc + Number(e.valor), 0);
                            const percent = costs > 0 ? (catTotal / costs) * 100 : 0;

                            if (percent === 0) return null;

                            return (
                                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '100px', fontSize: '14px', color: '#999', textTransform: 'capitalize' }}>{cat}</div>
                                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${percent}%`, height: '100%', background: 'hsl(var(--primary))', borderRadius: '4px' }}></div>
                                    </div>
                                    <div style={{ width: '80px', fontSize: '14px', color: '#fff', textAlign: 'right' }}>{Math.round(percent)}%</div>
                                </div>
                            );
                        })}
                        {costs === 0 && <div style={{ color: '#666', fontSize: '14px' }}>Sem dados de custos para este mês.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialOverview;
