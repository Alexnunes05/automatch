import { useState } from 'react';
import Navbar from '../components/Navbar';
import { n8nApi } from '../services/api';
import { supabase } from '../services/supabase';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import PreQualificationForm from '../components/PreQualificationForm';

const ClientRequest = () => {
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        email: '',
        type: 'leads',
        tools: '',
        budget: '',
        deadline: '',
        description: ''
    });

    // Step 1: Pre-qualification, Step 2: Main Form
    const [isQualified, setIsQualified] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Callback from PreQualificationForm
    const handleQualified = (preData) => {
        setFormData(prev => ({
            ...prev,
            name: preData.name,
            email: preData.email,
            whatsapp: preData.whatsapp,
            budget: preData.budget_range // Optional pre-fill
        }));
        setIsQualified(true);
        // Scroll to top
        window.scrollTo(0, 0);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Submit via RPC (Secure & Simple for Anon)
            // We use a custom RPC that handles the insert + smart queue trigger in one go.
            // This bypasses the RLS issues for anonymous "insert + select" operations.

            // Robust budget parsing for Brazil (R$ 5.000,00) and Ranges
            const parseBudget = (str) => {
                if (!str) return 0;
                // Take only first numeric part if it's a range
                const firstPart = str.split(' e ')[0];
                // 1. Remove all dots (thousands)
                // 2. Replace comma with dot (decimal)
                // 3. Remove non-numeric/non-dot chars (R$, spaces)
                const cleaned = firstPart.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
                return parseFloat(cleaned) || 0;
            };

            const payload = {
                p_client_name: formData.name,
                p_client_email: formData.email,
                p_client_whatsapp: formData.whatsapp,
                p_title: formData.type + ' Automation',
                p_description: formData.description,
                p_budget: parseBudget(formData.budget),
                p_deadline: formData.deadline,
                p_tools: formData.tools,
                p_type: formData.type
            };

            const { data, error } = await supabase.rpc('rpc_submit_project_anon', payload);

            if (error) throw error;
            // Check if RPC returned explicit error in JSON
            if (data && data.success === false) {
                throw new Error(data.message || 'Erro ao processar pedido');
            }

            console.log('Submission result:', data);

            // 2. Optional: Trigger n8n webhook
            if (import.meta.env.VITE_N8N_WEBHOOK_URL) {
                n8nApi.sendNewLead({
                    ...formData,
                    id: data.project_id,
                    budget: payload.p_budget
                }).catch(err =>
                    console.error('Failed to trigger n8n webhook:', err)
                );
            }

            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting project:', error);
            alert(`Falha ao salvar pedido: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <>
                <Navbar />
                <div className="container" style={{ padding: '80px 0', textAlign: 'center', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card fade-in" style={{ maxWidth: '600px', width: '100%', padding: '60px' }}>
                        <CheckCircle size={64} color="hsl(var(--success))" style={{ margin: '0 auto 24px' }} />
                        <h2>Pedido Recebido!</h2>
                        <p style={{ fontSize: '1.2rem', color: 'hsl(var(--text-secondary))', marginTop: '16px' }}>
                            Recebemos sua solicitação. Um de nossos especialistas entrará em contato via WhatsApp em breve.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '40px 20px', position: 'relative' }}>
                <div className="hero-blob" style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '800px',
                    height: '800px',
                    opacity: 0.5,
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}></div>

                <div className="glass-card fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>

                    {!isQualified ? (
                        <PreQualificationForm onQualified={handleQualified} />
                    ) : (
                        <div className="fade-in">
                            <div className="section-header" style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                                    <span style={{ background: 'hsl(var(--success)/0.2)', color: 'hsl(var(--success))', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <ShieldCheck size={14} /> Pré-qualificado
                                    </span>
                                </div>
                                <h2 style={{ marginBottom: '8px' }}>
                                    Descreva sua <span className="text-gradient">Automação</span>
                                </h2>
                                <p>
                                    Conte-nos o que você precisa e receba propostas de especialistas.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nome Completo</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Seu nome ou da empresa"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>WhatsApp</label>
                                        <input
                                            type="tel"
                                            name="whatsapp"
                                            required
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>E-mail Corporativo</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="seu@email.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tipo de Automação</label>
                                    <select name="type" value={formData.type} onChange={handleChange}>
                                        <option value="leads">Gestão de Leads (CRM)</option>
                                        <option value="finance">Financeiro & Notas Fiscais</option>
                                        <option value="whatsapp">Chatbots & WhatsApp</option>
                                        <option value="ai">Inteligência Artificial (GPT)</option>
                                        <option value="dashboards">Dashboards & Relatórios</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Ferramentas que você já usa (opcional)</label>
                                    <input
                                        type="text"
                                        name="tools"
                                        value={formData.tools}
                                        onChange={handleChange}
                                        placeholder="Ex: Trello, Pipedrive, Google Sheets..."
                                    />
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Orçamento Estimado</label>
                                        <input
                                            type="text"
                                            name="budget"
                                            value={formData.budget}
                                            onChange={handleChange}
                                            placeholder="Ex: R$ 2.000"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Prazo Desejado</label>
                                        <input
                                            type="text"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                            placeholder="Ex: 1 semana"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Descrição do Problema</label>
                                    <textarea
                                        name="description"
                                        rows="5"
                                        required
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Descreva o processo atual e o que deseja automatizar..."
                                    ></textarea>
                                </div>

                                <div style={{ marginTop: '32px' }}>
                                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                                        {loading ? 'Enviando...' : 'Solicitar Orçamento'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ClientRequest;
