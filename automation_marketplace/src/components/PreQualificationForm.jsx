import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

const PreQualificationForm = ({ onQualified }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        urgency: 'Imediata',
        objective: 'Vendas',
        budget_range: '',
        aware_of_recurring: 'Sim'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const isQualified = formData.budget_range !== 'Menos de R$ 1.500';

        try {
            // Save to pre_qualified_leads table
            await supabase.from('pre_qualified_leads').insert([{
                name: formData.name,
                email: formData.email,
                whatsapp: formData.whatsapp,
                urgency: formData.urgency,
                objective: formData.objective,
                budget_range: formData.budget_range,
                aware_of_recurring: formData.aware_of_recurring === 'Sim',
                qualified: isQualified
            }]);

            if (isQualified) {
                onQualified(formData); // Pass data to parent to pre-fill main form
            } else {
                // Show rejection UI (handled by local state or redirect)
                // For now, let's just use alert/navigate or valid UI
            }

        } catch (error) {
            console.error('Error saving pre-qualification:', error);
        } finally {
            setLoading(false);
            if (!isQualified) {
                // If not qualified, we show the rejection screen within this component
                setStep('rejected');
            }
        }
    };

    if (step === 'rejected') {
        return (
            <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(255, 200, 0, 0.1)', padding: '16px', borderRadius: '50%' }}>
                        <AlertTriangle size={48} color="#ffd700" />
                    </div>
                </div>
                <h2 style={{ marginBottom: '16px' }}>Orçamento abaixo do investimento mínimo</h2>
                <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '24px', lineHeight: '1.6' }}>
                    Nossos projetos de automação sob medida são desenvolvidos de forma personalizada e, por isso, o investimento inicial começa a partir de <strong>R$ 1.500</strong> para implementação, além de possíveis custos recorrentes das ferramentas utilizadas.
                    <br /><br />
                    Para investimentos menores, recomendamos nossos <strong style={{ color: 'hsl(var(--primary))' }}>Templates Prontos</strong>, que são mais acessíveis e eficientes para começar.
                </p>
                <button
                    onClick={() => navigate('/templates')}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    Ver Templates Disponíveis <ArrowRight size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="glass-card fade-in">
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'hsl(var(--primary))' }}>
                    Etapa {step} de 2
                </span>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '8px', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: step === 1 ? '50%' : '100%', height: '100%', background: 'hsl(var(--primary))', transition: 'width 0.3s ease' }}></div>
                </div>
            </div>

            <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Vamos entender seu momento</h2>
            <p style={{ textAlign: 'center', color: 'hsl(var(--text-secondary))', marginBottom: '32px' }}>
                Responda algumas perguntas rápidas para direcionarmos você ao especialista ideal.
            </p>

            <form onSubmit={step === 1 ? handleNext : handleSubmit}>
                {step === 1 ? (
                    <div className="fade-in">
                        <div className="form-group">
                            <label>Nome Completo</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Seu nome" />
                        </div>
                        <div className="form-group">
                            <label>WhatsApp</label>
                            <input type="tel" name="whatsapp" required value={formData.whatsapp} onChange={handleChange} placeholder="(11) 99999-9999" />
                        </div>
                        <div className="form-group">
                            <label>E-mail Corporativo</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="seu@email.com" />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                            Próximo <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                        </button>
                    </div>
                ) : (
                    <div className="fade-in">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Objetivo Principal</label>
                                <select name="objective" value={formData.objective} onChange={handleChange}>
                                    <option>Vendas</option>
                                    <option>Atendimento</option>
                                    <option>Financeiro</option>
                                    <option>Marketing</option>
                                    <option>IA / Produtividade</option>
                                    <option>Outro</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Urgência</label>
                                <select name="urgency" value={formData.urgency} onChange={handleChange}>
                                    <option>Imediata</option>
                                    <option>Próximos 30 dias</option>
                                    <option>Apenas pesquisando</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Investimento para Implementação</label>
                            <select name="budget_range" value={formData.budget_range} onChange={handleChange} required>
                                <option value="">Selecione...</option>
                                <option value="Menos de R$ 1.500">Menos de R$ 1.500</option>
                                <option value="Entre R$ 1.500 e R$ 3.000">Entre R$ 1.500 e R$ 3.000</option>
                                <option value="Entre R$ 3.000 e R$ 5.000">Entre R$ 3.000 e R$ 5.000</option>
                                <option value="Acima de R$ 5.000">Acima de R$ 5.000</option>
                            </select>
                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
                                Valor apenas para o serviço de configuração/desenvolvimento.
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Ciente sobre custos recorrentes?</label>
                            <select name="aware_of_recurring" value={formData.aware_of_recurring} onChange={handleChange}>
                                <option>Sim</option>
                                <option>Não</option>
                            </select>
                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
                                (Ferramentas como OpenAI, n8n, Z-API podem ter custos mensais)
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                            <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>
                                Voltar
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                                {loading ? 'Verificando...' : 'Verificar Disponibilidade'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default PreQualificationForm;
