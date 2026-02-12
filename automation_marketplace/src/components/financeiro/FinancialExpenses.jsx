import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import ExpenseFormModal from './ExpenseFormModal';

const FinancialExpenses = ({ expenses, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const filteredExpenses = expenses.filter(expense =>
        expense.nome_custo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditClick = (expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        if (editingExpense) {
            await onEdit(editingExpense.id, data);
        } else {
            await onAdd(data);
        }
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Tem certeza que deseja excluir este custo?')) {
            onDelete(id);
        }
    };

    const getCategoryLabel = (cat) => {
        const map = {
            'api': 'API',
            'server': 'Servidor',
            'tools': 'Ferramentas',
            'freelancer': 'Freelancer',
            'other': 'Outros'
        };
        return map[cat] || cat;
    };

    return (
        <div>
            <div className="management-header">
                <div className="management-search-wrapper">
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input
                        type="text"
                        placeholder="Buscar custo..."
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
                    <Plus size={18} /> Adicionar Custo
                </button>
            </div>

            <div className="table-container" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(10,10,10,0.5)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                            <th style={{ padding: '16px' }}>Nome</th>
                            <th style={{ padding: '16px' }}>Categoria</th>
                            <th style={{ padding: '16px' }}>Tipo</th>
                            <th style={{ padding: '16px' }}>Valor</th>
                            <th style={{ padding: '16px' }}>Data</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.length > 0 ? (
                            filteredExpenses.map(expense => (
                                <tr key={expense.id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '16px', fontWeight: '500' }}>{expense.nome_custo}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', color: '#ccc' }}>
                                            {getCategoryLabel(expense.categoria)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {expense.tipo_custo === 'fixed' ? 'Fixo' : 'Variável'}
                                    </td>
                                    <td style={{ padding: '16px' }}>R$ {Number(expense.valor).toFixed(2)}</td>
                                    <td style={{ padding: '16px' }}>{new Date(expense.data).toLocaleDateString('pt-BR')}</td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button onClick={() => handleEditClick(expense)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteClick(expense.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                                    Nenhum custo registrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ExpenseFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                expense={editingExpense}
            />
        </div>
    );
};

export default FinancialExpenses;
