import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabase';
import { Check, X, MessageCircle, DollarSign, Plus, Edit, Send } from 'lucide-react';
import TemplateForm from '../components/TemplateForm';
import NewsTab from '../components/NewsTab';
import ProfileSettings from './expert/ProfileSettings';
import PortfolioManager from './expert/PortfolioManager';
import ProposalModal from '../components/ProposalModal';

const ExpertDashboard = () => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    // Force rebuild: v3 (Marketplace)
    const [activeTab, setActiveTab] = useState('available'); // available | my-leads | templates | portfolio | profile | news
    const [leads, setLeads] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Proposal Modal State
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 9;

    const fetchDashboardData = async (userId) => {
        setLoading(true);

        if (activeTab === 'available') {
            // MARKETPLACE LOGIC: Fetch OPEN projects that haven't expired
            // Calculate range for pagination
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, count, error } = await supabase
                .from('projects')
                .select('*', { count: 'exact' }) // Get total count for pagination
                .eq('status', 'open')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) console.error('Error fetching projects:', error);
            setLeads(data || []);
            setTotalItems(count || 0);

            // Check which projects this user has already applied to
            const { data: proposals, error: propError } = await supabase
                .from('project_proposals')
                .select('project_id')
                .eq('manager_id', userId);

            if (propError) console.error('Error fetching proposals:', propError);
            const appliedSet = new Set(proposals?.map(p => p.project_id));
            setMyProposals(appliedSet);

        } else if (activeTab === 'my-leads') {
            // 1. Fetch ACTIVE PROJECTS assigned to this expert
            const { data: assignedProjects, error: assignedError } = await supabase
                .from('projects')
                .select('*')
                .eq('assigned_manager_id', userId)
                .neq('status', 'contacted')
                .order('updated_at', { ascending: false });

            if (assignedError) console.error('Error fetching assigned projects:', assignedError);

            // 2. Fetch PROJECTS where I have an Active Proposal (not expired)
            // First get project_ids from proposals
            const { data: myProposalsData, error: proposalError } = await supabase
                .from('project_proposals')
                .select('project_id')
                .eq('manager_id', userId);

            let appliedProjects = [];
            if (!proposalError && myProposalsData && myProposalsData.length > 0) {
                const projectIds = myProposalsData.map(p => p.project_id);

                // Fetch the actual projects if they are still OPEN and NOT EXPIRED
                const { data: proposalsProjects, error: projectsError } = await supabase
                    .from('projects')
                    .select('*')
                    .in('id', projectIds)
                    .eq('status', 'open')
                    .gt('expires_at', new Date().toISOString()) // Only show if not expired
                    .order('created_at', { ascending: false });

                if (projectsError) console.error('Error fetching applied projects:', projectsError);
                appliedProjects = proposalsProjects || [];
            }

            // Combine and Deduplicate (just in case)
            const combined = [...(assignedProjects || []), ...appliedProjects];
            // Use a Map to remove duplicates by ID
            const uniqueLeads = Array.from(new Map(combined.map(item => [item.id, item])).values());

            setLeads(uniqueLeads.map(p => ({
                ...p,
                type: 'project', // or distinguish if needed
                client_name: p.client_name,
                deadline: p.deadline,
                tools: p.tools,
                automation_type: p.automation_type
            })));
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
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab, currentPage]); // Add currentPage dependency

    // Reset pagination when switching tabs
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to page 1
    };

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

    const openProposalModal = (project) => {
        setProposalTarget(project);
        setIsProposalModalOpen(true);
    };

    const handleSubmitProposal = async (proposalData) => {
        // 1. Save Proposal to DB
        const { error } = await supabase
            .from('project_proposals')
            .insert({
                ...proposalData,
                manager_id: user.id
            });

        if (error) throw error;

        // 2. Open WhatsApp with Proposal Text
        if (proposalTarget && proposalTarget.client_whatsapp) {
            const message = `Olá, ${proposalTarget.client_name}! Vi seu projeto "${proposalTarget.title || 'Automação'}" no Marketplace.\n\n` +
                `*Minha Proposta:*\n` +
                `💰 Orçamento: R$ ${proposalData.proposed_budget}\n` +
                `📅 Prazo: ${proposalData.proposed_deadline}\n\n` +
                `📝 ${proposalData.cover_letter}\n\n` +
                `Podemos conversar?`;

            const whatsappUrl = `https://wa.me/55${proposalTarget.client_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }

        alert('Proposta salva! O WhatsApp deve abrir em breve. 🚀');
        fetchDashboardData(user.id); // Refresh to update "Applied" status
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

    // Pagination Helpers
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
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
                            onClick={() => handleTabChange('available')}
                        >
                            Novas Oportunidades
                        </button>
                        <button
                            className={`btn ${activeTab === 'my-leads' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleTabChange('my-leads')}
                        >
                            Meus Projetos
                        </button>
                        <button
                            className={`btn ${activeTab === 'templates' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleTabChange('templates')}
                        >
                            Meus Templates
                        </button>
                        <button
                            className={`btn ${activeTab === 'news' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleTabChange('news')}
                        >
                            Notícias
                        </button>
                        <button
                            className={`btn ${activeTab === 'portfolio' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleTabChange('portfolio')}
                        >
                            Portfólio
                        </button>
                        <button
                            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleTabChange('profile')}
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
                        <p style={{ color: 'hsl(var(--text-secondary))' }}>Nenhum projeto encontrado nesta categoria.</p>
                    </div>
                ) : (
                    <div>
                        {activeTab === 'available' && totalItems > 0 && (
                            <div style={{ marginBottom: '16px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
                                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems} oportunidades
                            </div>
                        )}
                        <div className="leads-grid">
                            {leads.map((item) => {
                                const hasApplied = myProposals.has(item.id);
                                return (
                                    <div key={item.id} className="glass-card fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderColor: hasApplied ? 'hsl(var(--success))' : 'var(--glass-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <span style={{
                                                background: activeTab === 'available' ? 'hsl(var(--accent)/0.2)' : 'hsl(var(--primary)/0.2)',
                                                color: activeTab === 'available' ? 'hsl(var(--accent))' : 'hsl(var(--primary))',
                                                padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600'
                                            }}>
                                                {activeTab === 'available' ? 'NOVO PROJETO' : (typeof item.status === 'string' ? item.status.toUpperCase() : 'PROJETO')}
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



                                        <button
                                            onClick={() => setSelectedLead(item)}
                                            className="btn btn-outline"
                                            style={{ width: '100%', marginBottom: '8px', fontSize: '0.9rem', padding: '8px' }}
                                        >
                                            Ver Detalhes
                                        </button>

                                        {activeTab === 'available' ? (
                                            <div className="opportunity-card-footer">
                                                {hasApplied ? (
                                                    <button disabled className="btn btn-outline" style={{ width: '100%', borderColor: 'hsl(var(--success))', color: 'hsl(var(--success))', opacity: 1 }}>
                                                        Check <Check size={16} style={{ marginLeft: '4px' }} /> Proposta Enviada
                                                    </button>
                                                ) : (
                                                    <button onClick={() => openProposalModal(item)} className="btn btn-primary" style={{ width: '100%' }}>
                                                        <Send size={16} style={{ marginRight: '6px' }} /> Enviar Proposta
                                                    </button>
                                                )}
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
                                )
                            })}
                        </div>
                        {/* Pagination Controls */}
                        {activeTab === 'available' && totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="btn btn-outline"
                                    style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    Anterior
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                                        style={{
                                            padding: '8px 12px',
                                            minWidth: '40px',
                                            fontWeight: currentPage === page ? 'bold' : 'normal'
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="btn btn-outline"
                                    style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                >
                                    Próximo
                                </button>
                            </div>
                        )}
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

                                {/* Contact Info - ALWAYS VISIBLE */}
                                <div style={{ background: 'rgba(0, 255, 128, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0, 255, 128, 0.2)', marginBottom: '24px' }}>
                                    <h4 style={{ color: 'hsl(var(--success))', marginBottom: '12px' }}>Dados de Contato</h4>
                                    <p style={{ marginBottom: '8px', fontSize: '1.1rem' }}>📱 <strong>WhatsApp:</strong> {selectedLead.client_whatsapp}</p>
                                    <p style={{ fontSize: '1.1rem' }}>📧 <strong>Email:</strong> {selectedLead.client_email}</p>
                                </div>

                                {activeTab === 'available' ? (
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        {myProposals.has(selectedLead.id) ? (
                                            <button disabled className="btn btn-outline btn-lg" style={{ width: '100%', borderColor: 'hsl(var(--success))', color: 'hsl(var(--success))', opacity: 1 }}>
                                                Check <Check size={16} /> Proposta Já Enviada
                                            </button>
                                        ) : (
                                            <button onClick={() => { setSelectedLead(null); openProposalModal(selectedLead); }} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                                <Send size={18} style={{ marginRight: '8px' }} /> Enviar Proposta
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {/* Status moved above or just kept simple */}
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

                <ProposalModal
                    isOpen={isProposalModalOpen}
                    onClose={() => setIsProposalModalOpen(false)}
                    project={proposalTarget}
                    onSubmit={handleSubmitProposal}
                />
            </div>
        </>
    );
};

export default ExpertDashboard;
