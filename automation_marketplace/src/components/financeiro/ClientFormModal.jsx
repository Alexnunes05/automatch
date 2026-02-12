import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const ClientFormModal = ({ isOpen, onClose, onSave, client = null }) => {
    const [formData, setFormData] = useState({
        nome_cliente: '',
        tipo_contrato: 'one_time', // default
        valor: '',
        data_inicio: new Date().toISOString().split('T')[0],
        data_renovacao: '',
        status: 'active'
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (client) {
            setFormData({
                nome_cliente: client.nome_cliente,
                tipo_contrato: client.tipo_contrato,
                valor: client.valor,
                data_inicio: client.data_inicio,
                data_renovacao: client.data_renovacao || '',
                status: client.status
            });
        } else {
            setFormData({
                nome_cliente: '',
                tipo_contrato: 'one_time',
                valor: '',
                data_inicio: new Date().toISOString().split('T')[0],
                data_renovacao: '',
                status: 'active'
            });
        }
        setError(null);
    }, [client, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validation
        if (!formData.nome_cliente || !formData.valor || !formData.data_inicio) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        if (formData.tipo_contrato === 'recurring' && !formData.data_renovacao) {
            setError('Renewal date is required for recurring contracts.');
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
            setError('Failed to save client. ' + err.message);
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
                    <h3 style={{ margin: 0, color: '#fff' }}>{client ? 'Editar Cliente' : 'Novo Cliente'}</h3>
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
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '4px', fontSize: '14px' }}>Nome do Cliente *</label>
                        <input
                            type="text"
                            name="nome_cliente"
                            value={formData.nome_cliente}
                            onChange={handleChange}
                            className="form-control"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                            placeholder="Ex: Empresa X"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '4px', fontSize: '14px' }}>Tipo de Contrato *</label>
                            <select
                                name="tipo_contrato"
                                value={formData.tipo_contrato}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                            >
                                <option value="one_time">Projeto Único</option>
                                <option value="recurring">Recorrente (Mensal)</option>
                            </select>
                        </div>
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
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '4px', fontSize: '14px' }}>Data Início *</label>
                            <input
                                type="date"
                                name="data_inicio"
                                value={formData.data_inicio}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                            />
                        </div>
                        {formData.tipo_contrato === 'recurring' && (
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '4px', fontSize: '14px' }}>Renovação *</label>
                                <input
                                    type="date"
                                    name="data_renovacao"
                                    value={formData.data_renovacao}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '4px', fontSize: '14px' }}>Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
                        >
                            <option value="active">Ativo</option>
                            <option value="pending">Pendente</option>
                            <option value="canceled">Cancelado</option>
                        </select>
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

export default ClientFormModal;
