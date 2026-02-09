import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabase';
import { Search, Filter, ShoppingCart, ArrowRight, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const TemplateMarketplace = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    const categories = ['Todas', 'Vendas', 'Atendimento', 'Financeiro', 'Marketing', 'IA', 'Produtividade'];

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching templates:', error);
        setTemplates(data || []);
        setLoading(false);
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '40px 0', minHeight: '100vh' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '60px', position: 'relative' }}>
                    <div className="hero-blob" style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '600px', height: '600px', opacity: 0.2, zIndex: -1
                    }}></div>

                    <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>
                        Marketplace de <span className="text-gradient">Automação</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'hsl(var(--text-secondary))', maxWidth: '600px', margin: '0 auto' }}>
                        Templates prontos para escalar seu negócio. Escolha, instale e comece a usar em minutos.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-secondary))' }} />
                            <input
                                type="text"
                                placeholder="Buscar templates (ex: CRM, Chatbot...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '48px', width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: 'hsl(var(--text-secondary))' }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid hsl(var(--primary))', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 24px' }}></div>
                        Carregando templates...
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <Zap size={48} style={{ color: 'hsl(var(--text-secondary))', marginBottom: '16px', opacity: 0.5 }} />
                        <h3 style={{ marginBottom: '8px' }}>Nenhum template encontrado</h3>
                        <p style={{ color: 'hsl(var(--text-secondary))' }}>Tente ajustar os filtros ou busque por outro termo.</p>
                        <button onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); }} className="btn btn-outline" style={{ marginTop: '24px' }}>
                            Limpar Filtros
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                        {filteredTemplates.map(template => (
                            <Link to={`/templates/${template.id}`} key={template.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="glass-card fade-in" style={{
                                    height: '100%', display: 'flex', flexDirection: 'column',
                                    transition: 'transform 0.2s, border-color 0.2s',
                                    cursor: 'pointer'
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'hsl(var(--primary))'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                                >
                                    {/* Preview Image Placeholder or Real Image */}
                                    <div style={{
                                        height: '180px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '20px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'
                                    }}>
                                        {template.preview_images?.[0] ? (
                                            <img src={template.preview_images[0]} alt={template.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Zap size={40} style={{ color: 'hsl(var(--primary))', opacity: 0.5 }} />
                                        )}
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', backdropFilter: 'blur(4px)' }}>
                                            {template.category}
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', lineHeight: '1.4' }}>{template.title}</h3>
                                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', marginBottom: '20px', flex: 1, lineHeight: '1.6' }}>
                                        {template.short_description || 'Sem descrição.'}
                                    </p>

                                    {/* Tools Tags */}
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                                        {template.tools?.slice(0, 3).map((tool, i) => (
                                            <span key={i} style={{
                                                fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)',
                                                padding: '4px 8px', borderRadius: '4px', color: 'hsl(var(--text-secondary))'
                                            }}>
                                                {tool}
                                            </span>
                                        ))}
                                        {template.tools?.length > 3 && <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>+{template.tools.length - 3}</span>}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Preço</span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'hsl(var(--success))' }}>
                                                {Number(template.price) === 0 ? 'Grátis' : `R$ ${template.price}`}
                                            </span>
                                        </div>
                                        <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            Detalhes <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default TemplateMarketplace;
