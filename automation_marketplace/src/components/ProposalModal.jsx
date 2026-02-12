import React, { useState } from 'react';
import { X, Send, DollarSign, Calendar, MessageSquare } from 'lucide-react';

const ProposalModal = ({ isOpen, onClose, project, onSubmit }) => {
    const [formData, setFormData] = useState({
        budget: '',
        deadline: '',
        coverLetter: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen || !project) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                project_id: project.id,
                proposed_budget: parseFloat(formData.budget),
                proposed_deadline: formData.deadline,
                cover_letter: formData.coverLetter
            });
            onClose();
        } catch (error) {
            console.error('Error submitting proposal:', error);
            alert('Erro ao enviar proposta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-card fade-in" style={{
                maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto',
                position: 'relative', background: '#111', border: '1px solid var(--glass-border)',
                padding: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Enviar Proposta</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{project.title || project.client_name}</h4>
                    <p style={{ margin: 0, color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
                        Orçamento Cliente: <strong>{project.budget ? `R$ ${project.budget}` : 'A combinar'}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <DollarSign size={16} /> Sua Oferta (R$)
                        </label>
                        <input
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            required
                            placeholder="Ex: 1500.00"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <Calendar size={16} /> Prazo de Entrega
                        </label>
                        <input
                            type="text"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            required
                            placeholder="Ex: 7 dias, 2 semanas..."
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <MessageSquare size={16} /> Mensagem de Apresentação
                        </label>
                        <textarea
                            name="coverLetter"
                            value={formData.coverLetter}
                            onChange={handleChange}
                            required
                            rows={4}
                            placeholder="Descreva por que você é ideal para este projeto..."
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff', resize: 'vertical' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            marginTop: '16px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px'
                        }}
                    >
                        {loading ? 'Enviando...' : <><Send size={18} /> Enviar Proposta</>}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default ProposalModal;
