import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, MoreHorizontal } from 'lucide-react';
import ClientFormModal from './ClientFormModal';

const FinancialClients = ({ clients, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    const filteredClients = clients.filter(client =>
        client.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditClick = (client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        if (editingClient) {
            await onEdit(editingClient.id, data);
        } else {
            await onAdd(data);
        }
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            onDelete(id);
        }
    };

    return (
        <div>
            <div className="management-header">
                <div className="management-search-wrapper">
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="management-search-input"
                    />
                </div>
                <button
                    onClick={handleAddClick}
                    className="btn-primary"
                    style={{
                        padding: '10px 20px', borderRadius: '8px', border: 'none',
                        background: 'hsl(var(--primary))', color: '#000', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Plus size={18} /> Adicionar Cliente
                </button>
            </div>

            <div className="table-container" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(10,10,10,0.5)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                            <th style={{ padding: '16px' }}>Nome</th>
                            <th style={{ padding: '16px' }}>Tipo</th>
                            <th style={{ padding: '16px' }}>Valor</th>
                            <th style={{ padding: '16px' }}>Início</th>
                            <th style={{ padding: '16px' }}>Renovação</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                                <tr key={client.id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '16px', fontWeight: '500' }}>{client.nome_cliente}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                            background: client.tipo_contrato === 'recurring' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(96, 165, 250, 0.2)',
                                            color: client.tipo_contrato === 'recurring' ? '#34d399' : '#60a5fa'
                                        }}>
                                            {client.tipo_contrato === 'recurring' ? 'Recorrente' : 'Único'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>R$ {Number(client.valor).toFixed(2)}</td>
                                    <td style={{ padding: '16px' }}>{new Date(client.data_inicio).toLocaleDateString('pt-BR')}</td>
                                    <td style={{ padding: '16px' }}>
                                        {client.data_renovacao ? new Date(client.data_renovacao).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                            background: client.status === 'active' ? 'rgba(52, 211, 153, 0.2)' : client.status === 'pending' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: client.status === 'active' ? '#34d399' : client.status === 'pending' ? '#fbbf24' : '#ef4444'
                                        }}>
                                            {client.status === 'active' ? 'Ativo' : client.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button onClick={() => handleEditClick(client)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteClick(client.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                                    Nenhum cliente encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ClientFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                client={editingClient}
            />
        </div>
    );
};

export default FinancialClients;
