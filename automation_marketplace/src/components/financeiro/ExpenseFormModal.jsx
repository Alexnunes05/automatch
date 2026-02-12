import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const ExpenseFormModal = ({ isOpen, onClose, onSave, expense = null }) => {
    const [formData, setFormData] = useState({
        nome_custo: '',
        categoria: 'tools', // default
        tipo_custo: 'fixed', // default
        valor: '',
        data: new Date().toISOString().split('T')[0],
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (expense) {
            setFormData({
                nome_custo: expense.nome_custo,
                categoria: expense.categoria,
                tipo_custo: expense.tipo_custo,
                valor: expense.valor,
                data: expense.data
            });
        } else {
            setFormData({
                nome_custo: '',
                categoria: 'tools',
                tipo_custo: 'fixed',
                valor: '',
                data: new Date().toISOString().split('T')[0],
            });
        }
        setError(null);
    }, [expense, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validation
        if (!formData.nome_custo || !formData.valor || !formData.data) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        if (isNaN(formData.valor) || Number(formData.valor) <= 0) {
            setError('Value must be a positive number');
            setLoading(false);
            return;
        }

        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError('Failed to save expense. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px',
                border: '1px solid var(--glass-border)', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#fff' }}>{expense ? 'Editar Custo' : 'Novo Custo'}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px',
                        marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
                    }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '4px', fontSize: '14px' }}>Nome do Custo *</label>
                        <input
                            type="text"
                            name="nome_custo"
                            value={formData.nome_custo}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                            placeholder="Ex: Assinatura OpenAI"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '4px', fontSize: '14px' }}>Categoria *</label>
                            <select
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                            >
                                <option value="api">API</option>
                                <option value="server">Servidor</option>
                                <option value="tools">Ferramentas</option>
                                <option value="freelancer">Freelancer</option>
                                <option value="other">Outros</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '4px', fontSize: '14px' }}>Tipo *</label>
                            <select
                                name="tipo_custo"
                                value={formData.tipo_custo}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                            >
                                <option value="fixed">Fixo Mensal</option>
                                <option value="variable">Variável</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '4px', fontSize: '14px' }}>Valor (R$) *</label>
                            <input
                                type="number"
                                name="valor"
                                value={formData.valor}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '4px', fontSize: '14px' }}>Data *</label>
                            <input
                                type="date"
                                name="data"
                                value={formData.data}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '10px 20px', borderRadius: '8px', border: '1px solid #666', background: 'transparent', color: '#ccc', cursor: 'pointer'
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary" style={{
                            padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'hsl(var(--primary))', color: '#000', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? 'Salvando...' : <><Save size={18} /> Salvar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseFormModal;
