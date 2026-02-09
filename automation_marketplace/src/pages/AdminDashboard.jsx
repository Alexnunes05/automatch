import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabase';

const AdminDashboard = () => {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExperts();
    }, []);

    const fetchExperts = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'expert');
        setExperts(data || []);
        setLoading(false);
    };

    const approveExpert = async (id) => {
        await supabase.from('profiles').update({ status: 'approved' }).eq('id', id);
        fetchExperts();
    };

    const blockExpert = async (id) => {
        await supabase.from('profiles').update({ status: 'rejected' }).eq('id', id);
        fetchExperts();
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '40px 0' }}>
                <h2>Admin Dashboard</h2>
                <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '32px' }}>Gerenciamento de Gestores</p>

                <div className="glass-card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                <th style={{ padding: '16px' }}>Nome</th>
                                <th style={{ padding: '16px' }}>Email</th>
                                <th style={{ padding: '16px' }}>WhatsApp</th>
                                <th style={{ padding: '16px' }}>Status</th>
                                <th style={{ padding: '16px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {experts.map((expert) => (
                                <tr key={expert.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '16px' }}>{expert.full_name}</td>
                                    <td style={{ padding: '16px' }}>{expert.email}</td>
                                    <td style={{ padding: '16px' }}>{expert.whatsapp}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                            background: expert.status === 'approved' ? 'hsl(var(--success)/0.2)' : expert.status === 'pending' ? 'hsl(var(--accent)/0.2)' : 'hsl(var(--error)/0.2)',
                                            color: expert.status === 'approved' ? 'hsl(var(--success))' : expert.status === 'pending' ? 'hsl(var(--accent))' : 'hsl(var(--error))'
                                        }}>
                                            {expert.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {expert.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => approveExpert(expert.id)} className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', borderColor: 'hsl(var(--success))' }}>
                                                    Aprovar
                                                </button>
                                                <button onClick={() => blockExpert(expert.id)} className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', borderColor: 'hsl(var(--error))' }}>
                                                    Bloquear
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
