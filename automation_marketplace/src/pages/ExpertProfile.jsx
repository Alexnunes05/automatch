import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Navbar from '../components/Navbar';
import { User, MapPin, Globe, Linkedin, Instagram, ExternalLink, MessageCircle, Image as ImageIcon } from 'lucide-react';

const ExpertProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpertData();
    }, [id]);

    const fetchExpertData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

            // 2. Fetch Portfolio
            const { data: portfolioData, error: portfolioError } = await supabase
                .from('portfolio_items')
                .select('*')
                .eq('expert_id', id)
                .order('created_at', { ascending: false });

            if (portfolioError) throw portfolioError;
            setPortfolio(portfolioData || []);

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <div style={{ padding: '80px', textAlign: 'center', color: '#fff' }}>Carregando perfil...</div>
        </>
    );

    if (!profile) return (
        <>
            <Navbar />
            <div style={{ padding: '80px', textAlign: 'center', color: '#fff' }}>Perfil não encontrado.</div>
        </>
    );

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <Navbar />

            {/* Header / Hero Profile */}
            <div style={{ background: 'linear-gradient(to bottom, rgba(124, 58, 237, 0.1), transparent)', padding: '120px 0 60px' }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%',
                        background: 'hsl(var(--primary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '3rem', fontWeight: 'bold', color: '#000', marginBottom: '24px',
                        border: '4px solid rgba(255,255,255,0.1)'
                    }}>
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            profile.full_name?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>

                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{profile.full_name}</h1>
                    <p style={{ fontSize: '1.2rem', color: 'hsl(var(--primary))', marginBottom: '24px' }}>
                        {profile.title || 'Especialista em Automação'}
                    </p>

                    <p style={{ maxWidth: '600px', margin: '0 auto 32px', color: 'hsl(var(--text-secondary))', lineHeight: '1.6' }}>
                        {profile.bio || 'Este especialista ainda não adicionou uma biografia.'}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                        {profile.whatsapp && (
                            <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} target="_blank" className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
                                <MessageCircle size={18} /> Contatar no WhatsApp
                            </a>
                        )}
                        {profile.instagram && (
                            <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
                                <Instagram size={18} /> Instagram
                            </a>
                        )}
                        {profile.linkedin && (
                            <a href={profile.linkedin} target="_blank" className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
                                <Linkedin size={18} /> LinkedIn
                            </a>
                        )}
                        {profile.portfolio_url && (
                            <a href={profile.portfolio_url} target="_blank" className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
                                <Globe size={18} /> Site Externo
                            </a>
                        )}
                    </div>

                    {profile.skills && profile.skills.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {profile.skills.map((skill, index) => (
                                <span key={index} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '6px 16px', borderRadius: '100px',
                                    fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Portfolio Section */}
            <div className="container">
                <h2 style={{ marginBottom: '32px', borderLeft: '4px solid hsl(var(--primary))', paddingLeft: '16px' }}>
                    Portfólio de Projetos
                </h2>

                {portfolio.length === 0 ? (
                    <p style={{ color: 'hsl(var(--text-secondary))' }}>Nenhum projeto publicado ainda.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                        {portfolio.map(item => (
                            <div key={item.id} className="glass-card fade-in" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    height: '200px',
                                    background: item.image_url ? `url(${item.image_url}) center/cover` : 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {!item.image_url && <ImageIcon size={48} color="rgba(255,255,255,0.1)" />}
                                </div>
                                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{item.title}</h3>
                                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
                                        {item.description}
                                    </p>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                                        {item.tools_used && item.tools_used.map((tool, i) => (
                                            <span key={i} style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', background: 'hsl(var(--primary)/0.1)', padding: '4px 10px', borderRadius: '4px' }}>
                                                {tool}
                                            </span>
                                        ))}
                                    </div>

                                    {item.project_link && (
                                        <a href={item.project_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                                            Ver Projeto <ExternalLink size={16} style={{ marginLeft: '4px' }} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpertProfile;
