import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Plus, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

const PortfolioManager = ({ user }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        image_url: '',
        project_link: '',
        tools_used: ''
    });

    useEffect(() => {
        if (user) fetchPortfolio();
    }, [user]);

    const fetchPortfolio = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('expert_id', user.id)
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        setItems(data || []);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

        const { error } = await supabase
            .from('portfolio_items')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir.');
        } else {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const toolsArray = newItem.tools_used.split(',').map(s => s.trim()).filter(s => s);

        const { data, error } = await supabase
            .from('portfolio_items')
            .insert([{
                expert_id: user.id,
                title: newItem.title,
                description: newItem.description,
                image_url: newItem.image_url,
                project_link: newItem.project_link,
                tools_used: toolsArray
            }])
            .select();

        if (error) {
            alert('Erro ao adicionar projeto: ' + error.message);
        } else {
            setItems([data[0], ...items]);
            setShowForm(false);
            setNewItem({ title: '', description: '', image_url: '', project_link: '', tools_used: '' });
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2>Meu Portfólio</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> {showForm ? 'Cancelar' : 'Adicionar Projeto'}
                </button>
            </div>

            {showForm && (
                <div className="glass-card fade-in" style={{ marginBottom: '32px', border: '1px solid hsl(var(--primary))' }}>
                    <h3 style={{ marginBottom: '16px' }}>Novo Projeto</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Título do Projeto</label>
                            <input
                                type="text"
                                required
                                value={newItem.title}
                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Descrição</label>
                            <textarea
                                required
                                rows="3"
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <ImageUpload
                                    label="Capa do Projeto"
                                    currentImage={newItem.image_url}
                                    onUpload={(url) => setNewItem({ ...newItem, image_url: url })}
                                    folder="portfolio"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Link do Projeto (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={newItem.project_link}
                                    onChange={e => setNewItem({ ...newItem, project_link: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Ferramentas Usadas (separadas por vírgula)</label>
                            <input
                                type="text"
                                placeholder="n8n, Supabase, React"
                                value={newItem.tools_used}
                                onChange={e => setNewItem({ ...newItem, tools_used: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Salvar Projeto
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <p>Carregando projetos...</p>
            ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-secondary))' }}>
                    Nenhum projeto no portfólio ainda.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {items.map(item => (
                        <div key={item.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                height: '160px',
                                background: item.image_url ? `url(${item.image_url}) center/cover` : 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {!item.image_url && <ImageIcon size={40} color="rgba(255,255,255,0.2)" />}
                            </div>

                            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{item.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', marginBottom: '16px', flex: 1 }}>
                                    {item.description}
                                </p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                                    {item.tools_used && item.tools_used.map((tool, i) => (
                                        <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                            {tool}
                                        </span>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    {item.project_link && (
                                        <a href={item.project_link} target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                                            Ver Projeto <ExternalLink size={14} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="btn btn-sm btn-outline"
                                        style={{ marginLeft: 'auto', color: 'hsl(var(--error))', borderColor: 'hsl(var(--error))' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortfolioManager;
