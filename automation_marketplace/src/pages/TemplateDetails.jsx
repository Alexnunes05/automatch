import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabase';
import { Check, ShoppingCart, ArrowLeft, Clock, ShieldCheck, Zap } from 'lucide-react';

const TemplateDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [template, setTemplate] = useState(null);
    const [expert, setExpert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplate();
    }, [id]);

    const fetchTemplate = async () => {
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching template:', error);
            navigate('/templates'); // Redirect if not found
            return;
        }
        setTemplate(data);

        // Fetch Expert
        if (data.expert_id) {
            const { data: expertData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.expert_id)
                .single();
            setExpert(expertData);
        }

        setLoading(false);
    };

    if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Carregando...</div>;
    if (!template) return null;

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '40px 0', minHeight: '100vh' }}>
                <button
                    onClick={() => navigate('/templates')}
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', border: 'none', paddingLeft: 0 }}
                >
                    <ArrowLeft size={18} /> Voltar para Marketplace
                </button>

                <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '40px' }}>

                    {/* Left Column: Details */}
                    <div>
                        <div style={{
                            height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                        }}>
                            {template.preview_images?.[0] ? (
                                <img src={template.preview_images[0]} alt={template.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Zap size={64} style={{ color: 'hsl(var(--primary))', opacity: 0.5 }} />
                            )}
                        </div>

                        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{template.title}</h1>

                        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                            <span style={{ background: 'hsl(var(--primary)/0.2)', color: 'hsl(var(--primary))', padding: '4px 12px', borderRadius: '100px', fontSize: '0.9rem' }}>
                                {template.category}
                            </span>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.9rem' }}>
                                {template.difficulty}
                            </span>
                        </div>

                        <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
                            <h3 style={{ marginBottom: '16px' }}>Descrição</h3>
                            <p style={{ lineHeight: '1.8', color: 'hsl(var(--text-secondary))', whiteSpace: 'pre-wrap' }}>
                                {template.full_description || template.short_description}
                            </p>
                        </div>

                        <div className="glass-card" style={{ padding: '32px' }}>
                            <h3 style={{ marginBottom: '16px' }}>O que está incluso</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {template.tools?.map((tool, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Check size={16} color="hsl(var(--success))" />
                                        <span>{tool}</span>
                                    </div>
                                ))}
                                {template.integrations?.map((int, i) => (
                                    <div key={`int-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Check size={16} color="hsl(var(--success))" />
                                        <span>Integração {int}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Checkout/CTA */}
                    <div>
                        {/* Expert Card */}
                        {expert && (
                            <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px', border: '1px solid hsl(var(--primary))', background: 'rgba(124, 58, 237, 0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {expert.avatar_url ? (
                                            <img src={expert.avatar_url} alt={expert.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontWeight: 'bold', color: '#000' }}>{expert.full_name?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Criado por</p>
                                        <h4 style={{ fontSize: '1.1rem' }}>{expert.full_name}</h4>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {expert.bio || 'Especialista verificado da plataforma.'}
                                </p>
                                <button
                                    onClick={() => navigate(`/expert/${expert.id}`)}
                                    className="btn btn-outline btn-sm"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    Ver Perfil Completo
                                </button>
                            </div>
                        )}

                        <div className="glass-card" style={{ padding: '32px', position: 'sticky', top: '100px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <span style={{ color: 'hsl(var(--text-secondary))' }}>Valor do Investimento</span>
                                <span style={{ fontSize: '2rem', fontWeight: '800', color: 'hsl(var(--success))' }}>
                                    {Number(template.price) === 0 ? 'Grátis' : `R$ ${template.price}`}
                                </span>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                                <li style={{ display: 'flex', gap: '12px', marginBottom: '12px', color: 'hsl(var(--text-secondary))' }}>
                                    <Clock size={20} /> Entrega imediata (Download)
                                </li>
                                <li style={{ display: 'flex', gap: '12px', marginBottom: '12px', color: 'hsl(var(--text-secondary))' }}>
                                    <ShieldCheck size={20} /> Garantia de funcionamento
                                </li>
                                <li style={{ display: 'flex', gap: '12px', marginBottom: '12px', color: 'hsl(var(--text-secondary))' }}>
                                    <Zap size={20} /> Suporte do Especialista
                                </li>
                            </ul>

                            {template.checkout_link ? (
                                <a
                                    href={template.checkout_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <ShoppingCart size={18} /> Comprar Agora
                                </a>
                            ) : (
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); alert("Este template não possui link de checkout configurado. Entre em contato com o gestor."); }}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                                        opacity: 0.8, cursor: 'not-allowed'
                                    }}
                                >
                                    <ShoppingCart size={18} /> Comprar (Indisponível)
                                </a>
                            )}

                            <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'hsl(var(--text-secondary))', marginTop: '16px' }}>
                                Compra realizada diretamente com o especialista.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TemplateDetails;
