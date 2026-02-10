import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabase';
import { Check, X, MessageCircle, DollarSign, Plus, Edit } from 'lucide-react';
import TemplateForm from '../components/TemplateForm';
import NewsTab from '../components/NewsTab';
import ProfileSettings from './expert/ProfileSettings';
import PortfolioManager from './expert/PortfolioManager';

const ExpertDashboard = () => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    // Force rebuild: v2
    const [activeTab, setActiveTab] = useState('available'); // available | my-leads | templates | portfolio | profile | news
    const [leads, setLeads] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const fetchDashboardData = async (userId) => {
        setLoading(true);

        if (activeTab === 'available') {
            // Fetch OFFERS for this expert
            const { data, error } = await supabase
                .from('project_offers')
                .select(`
                    id,
                    status,
                    expires_at,
                    projects (
                        id,
                        title,
                        description,
                        budget,
                        deadline,
                        client_id,
                        client_name,
                        tools,
                        automation_type
                    )
                `)
                .eq('manager_id', userId)
                .eq('status', 'offered')
                .gt('expires_at', new Date().toISOString());

            if (error) console.error('Error fetching offers:', error);
            setLeads(data?.map(offer => ({
                ...offer.projects,
                offer_id: offer.id,
                expires_at: offer.expires_at,
                type: 'offer' // Marker
            })) || []);

        } else if (activeTab === 'my-leads') {
            // Fetch ACTIVE PROJECTS assigned to this expert
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('assigned_manager_id', userId)
                .neq('status', 'contacted') // Filter out contacted
                .order('updated_at', { ascending: false });

            if (error) console.error('Error fetching projects:', error);
            setLeads(data?.map(p => ({
                ...p,
                type: 'project',
                client_name: p.client_name,
                deadline: p.deadline,
                tools: p.tools,
                automation_type: p.automation_type
            })) || []);
        }
        setLoading(false);
    };


    const fetchMyTemplates = async (userId) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('expert_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching templates:', error);
        } else {
            setTemplates(data || []);
        }
        setLoading(false);
    };

    // Replace fetchLeads with this in useEffect
    useEffect(() => {
        const fetchUserAndData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (!user) {
                setLoading(false);
                return;
            }

            if (activeTab === 'templates') {
                await fetchMyTemplates(user.id);
            } else if (activeTab === 'news') {
                // No data needed
            } else if (activeTab !== 'portfolio' && activeTab !== 'profile') {
                await fetchDashboardData(user.id);
            }
            setLoading(false);
        };
        fetchUserAndData();
    }, [activeTab]);

    if (!loading && !user) {
        return (
            <>
                <Navbar />
                <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                    <div className="glass-card">
                        <h2>Acesso Restrito</h2>
                        <p style={{ color: 'hsl(var(--text-secondary))', margin: '16px 0' }}>
                            Você precisa estar logado como gestor para acessar esta página.
                        </p>
                        <button onClick={() => window.location.href = '/login'} className="btn btn-primary">
                            Ir para Login
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const handleAcceptOffer = async (offerId) => {
        try {
            const { data, error } = await supabase.rpc('rpc_accept_offer', { offer_id: offerId });

            if (error) throw error;
            if (!data.success) throw new Error(data.message);

            alert('Projeto aceito com sucesso! ✅');
            fetchDashboardData(user.id);
        } catch (error) {
            console.error('Erro ao aceitar:', error);
            alert(`Erro: ${error.message}`);
        }
    };

    const handleDeclineOffer = async (offerId) => {
        if (!confirm('Tem certeza? Isso passará a oportunidade para outro gestor.')) return;
        try {
            const { data, error } = await supabase.rpc('rpc_decline_offer', { offer_id: offerId });

            if (error) throw error;
            if (!data.success) throw new Error(data.message);

            fetchDashboardData(user.id);
        } catch (error) {
            console.error('Erro ao recusar:', error);
            alert(`Erro: ${error.message}`);
        }
    };

    const handleMarkContacted = async (projectId) => {
        if (!confirm('Marcar como contatado? O projeto sairá desta lista.')) return;
        try {
            const { error } = await supabase
                .from('projects')
                .update({ status: 'contacted' })
                .eq('id', projectId);

            if (error) throw error;

            // Remove from local list
            setLeads(prev => prev.filter(l => l.id !== projectId));
            if (activeTab === 'my-leads') fetchDashboardData(user.id);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '40px 20px' }}>
                <div className="dashboard-header-flex">
                    <h2 style={{ fontSize: '1.75rem' }}>Painel do Gestor</h2>
                    <div className="glass-card dashboard-tabs-wrapper">
                        <button
                            className={`btn ${activeTab === 'available' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('available')}
                        >
                            Novas Oportunidades
                        </button>
                        <button
                            className={`btn ${activeTab === 'my-leads' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('my-leads')}
                        >
                            Meus Projetos
                        </button>
                        <button
                            className={`btn ${activeTab === 'templates' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('templates')}
                        >
                            Meus Templates
                        </button>
                        <button
                            className={`btn ${activeTab === 'news' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('news')}
                        >
                            Notícias
                        </button>
                        <button
                            className={`btn ${activeTab === 'portfolio' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('portfolio')}
                        >
                            Portfólio
                        </button>
                        <button
                            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Perfil
                        </button>
                    </div>
                </div>

                {activeTab === 'templates' ? (
                    showTemplateForm ? (
                        <TemplateForm
                            user={user}
                            initialData={editingTemplate}
                            onCancel={() => { setShowTemplateForm(false); setEditingTemplate(null); }}
                            onSuccess={() => { setShowTemplateForm(false); setEditingTemplate(null); fetchMyTemplates(user.id); }}
                        />
                    ) : (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                                <button className="btn btn-primary" onClick={() => { setEditingTemplate(null); setShowTemplateForm(true); }} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <Plus size={18} /> Novo Template
                                </button>
                            </div>

                            {templates.length === 0 ? (
                                <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
                                    <p style={{ color: 'hsl(var(--text-secondary))' }}>Você ainda não publicou nenhum template.</p>
                                </div>
                            ) : (
                                <div className="leads-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                    {templates.map(tpl => (
                                        <div key={tpl.id} className="glass-card" style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                                <span style={{
                                                    background: tpl.status === 'published' ? 'hsl(var(--success)/0.2)' : 'hsl(var(--text-secondary)/0.2)',
                                                    color: tpl.status === 'published' ? 'hsl(var(--success))' : 'hsl(var(--text-secondary))',
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem'
                                                }}>
                                                    {tpl.status === 'published' ? 'Publicado' : 'Rascunho'}
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', paddingRight: '60px' }}>{tpl.title}</h3>
                                            <p style={{ color: 'hsl(var(--text-secondary))', minHeight: '60px', fontSize: '0.9rem' }}>{tpl.short_description}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                                                <span style={{ fontWeight: 'bold' }}>{formatCurrency(tpl.price)}</span>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => { setEditingTemplate(tpl); setShowTemplateForm(true); }}
                                                >
                                                    Editar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                ) : activeTab === 'portfolio' ? (
                    <PortfolioManager user={user} />
                ) : activeTab === 'profile' ? (
                    <ProfileSettings user={user} />
                ) : activeTab === 'news' ? (
                    <NewsTab />
                ) : loading ? (
                    <p>Carregando...</p>
                ) : leads.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
                        <p style={{ color: 'hsl(var(--text-secondary))' }}>Nenhum lead encontrado nesta categoria.</p>
                    </div>
                ) : (
                    <div className="leads-grid">
                        {leads.map((item) => (
                            <div key={item.id} className="glass-card fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderColor: item.type === 'offer' ? 'hsl(var(--accent))' : 'var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{
                                        background: activeTab === 'available' ? 'hsl(var(--accent)/0.2)' : 'hsl(var(--primary)/0.2)',
                                        color: activeTab === 'available' ? 'hsl(var(--accent))' : 'hsl(var(--primary))',
                                        padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600'
                                    }}>
                                        {activeTab === 'available' ? 'OFERTA EXCLUSIVA' : (typeof item.status === 'string' ? item.status.toUpperCase() : 'PROJETO')}
                                    </span>
                                    <span style={{ color: 'hsl(var(--success))', fontWeight: 'bold' }}>
                                        {item.budget ? formatCurrency(item.budget) : 'A combinar'}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{item.client_name || item.title}</h3>
                                {item.deadline && (
                                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', marginBottom: '8px' }}>
                                        Prazo: {item.deadline}
                                    </p>
                                )}
                                <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '16px', fontSize: '0.95rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.description}
                                </p>

                                {activeTab === 'available' && item.expires_at && (
                                    <div style={{ marginBottom: '16px', color: 'hsl(var(--error))', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        Expira em: {new Date(item.expires_at).toLocaleTimeString()}
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedLead(item)}
                                    className="btn btn-outline"
                                    style={{ width: '100%', marginBottom: '8px', fontSize: '0.9rem', padding: '8px' }}
                                >
                                    Ver Detalhes
                                </button>

                                {activeTab === 'available' ? (
                                    <div className="opportunity-card-footer" style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleAcceptOffer(item.offer_id)} className="btn btn-primary" style={{ flex: 1 }}>
                                            Aceitar
                                        </button>
                                        <button onClick={() => handleDeclineOffer(item.offer_id)} className="btn btn-outline" style={{ flex: 1, borderColor: 'hsl(var(--error))', color: 'hsl(var(--error))' }}>
                                            Recusar
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ padding: '4px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                                            Status: {typeof item.status === 'string' ? item.status.toUpperCase() : 'N/A'}
                                        </div>
                                        <button
                                            onClick={() => handleMarkContacted(item.id)}
                                            className="btn btn-primary"
                                            style={{
                                                width: '100%',
                                                background: 'hsl(var(--success))',
                                                borderColor: 'hsl(var(--success))',
                                                textTransform: 'uppercase',
                                                fontSize: '0.8rem',
                                                fontWeight: '700'
                                            }}
                                        >
                                            Entrei em contato com a empresa
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {selectedLead && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        backdropFilter: 'blur(5px)'
                    }} onClick={() => setSelectedLead(null)}>
                        <div className="glass-card fade-in" style={{
                            maxWidth: '600px', width: '90%', maxHeight: '90vh',
                            display: 'flex', flexDirection: 'column',
                            position: 'relative', background: '#111', border: '1px solid var(--glass-border)',
                            padding: '0' // Padding moved to children
                        }} onClick={e => e.stopPropagation()}>
                            {/* Fixed Header with Close Button */}
                            <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <button onClick={() => setSelectedLead(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Fechar</span> <X size={24} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div style={{ padding: '32px', overflowY: 'auto' }}>

                                <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{selectedLead.client_name}</h3>
                                <span style={{
                                    background: 'hsl(var(--primary)/0.2)', color: 'hsl(var(--primary))',
                                    padding: '4px 12px', borderRadius: '100px', fontSize: '0.9rem', marginBottom: '24px', display: 'inline-block'
                                }}>
                                    {selectedLead.automation_type ? selectedLead.automation_type.toUpperCase() : 'N/A'}
                                </span>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    <div>
                                        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Orçamento</p>
                                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(selectedLead.budget)}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Prazo</p>
                                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedLead.deadline}</p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Ferramentas</p>
                                    <p style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', marginTop: '4px' }}>
                                        {selectedLead.tools || 'Não especificadas'}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Descrição Detalhada</p>
                                    <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginTop: '4px' }}>
                                        {selectedLead.description}
                                    </p>
                                </div>

                                {activeTab === 'available' ? (
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <button onClick={() => { handleAcceptOffer(selectedLead.offer_id); setSelectedLead(null); }} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                                            Aceitar Oferta
                                        </button>
                                        <button onClick={() => { handleDeclineOffer(selectedLead.offer_id); setSelectedLead(null); }} className="btn btn-outline btn-lg" style={{ flex: 1, borderColor: 'hsl(var(--error))', color: 'hsl(var(--error))' }}>
                                            Recusar
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ background: 'rgba(0, 255, 128, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0, 255, 128, 0.2)' }}>
                                        <h4 style={{ color: 'hsl(var(--success))', marginBottom: '12px' }}>Dados de Contato</h4>
                                        <p style={{ marginBottom: '8px', fontSize: '1.1rem' }}>📱 <strong>WhatsApp:</strong> {selectedLead.client_whatsapp}</p>
                                        <p style={{ fontSize: '1.1rem' }}>📧 <strong>Email:</strong> {selectedLead.client_email}</p>
                                    </div>
                                )}

                                {/* Additional Close Button at Screen Bottom for Mobile */}
                                <button onClick={() => setSelectedLead(null)} className="btn btn-outline" style={{ width: '100%', marginTop: '24px' }}>
                                    Voltar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ExpertDashboard;
