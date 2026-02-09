import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { ExternalLink, User, Search } from 'lucide-react';

const ProjectShowcase = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            // Fetch projects and related expert profile data
            const { data, error } = await supabase
                .from('portfolio_items')
                .select(`
                    *,
                    profiles:expert_id (
                        id,
                        full_name,
                        avatar_url,
                        title
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Erro ao buscar projetos:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tools_used?.some(tool => tool.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="project-showcase">
            <Navbar />

            <div className="container" style={{ padding: '40px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
                        Galeria de <span className="text-gradient">Projetos Reais</span>
                    </h1>
                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 32px' }}>
                        Explore automações desenvolvidas pelos nossos especialistas.
                        Inspire-se e encontre o profissional ideal para o seu desafio.
                    </p>

                    <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
                        <input
                            type="text"
                            placeholder="Buscar por nome, ferramenta ou descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px 16px 16px 48px',
                                borderRadius: '100px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                fontSize: '1rem',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-secondary))' }} />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <p>Carregando projetos...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'hsl(var(--text-secondary))' }}>
                        Nenhum projeto encontrado.
                    </div>
                ) : (
                    <div className="projects-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '32px'
                    }}>
                        {filteredProjects.map(project => (
                            <div key={project.id} className="glass-card fade-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'default' }}>
                                <div style={{
                                    height: '200px',
                                    background: project.image_url ? `url(${project.image_url}) center/cover` : 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)',
                                    position: 'relative'
                                }}>
                                    {!project.image_url && (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.1)' }}>
                                            Imagem Indisponível
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <h3 style={{ fontSize: '1.25rem', lineHeight: '1.4' }}>{project.title}</h3>
                                        {project.project_link && (
                                            <a href={project.project_link} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Ver Projeto Online">
                                                <ExternalLink size={18} />
                                            </a>
                                        )}
                                    </div>

                                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', marginBottom: '20px', flex: 1, lineHeight: '1.6' }}>
                                        {project.description}
                                    </p>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                                        {project.tools_used && project.tools_used.map((tool, i) => (
                                            <span key={i} style={{
                                                fontSize: '0.75rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                padding: '4px 10px',
                                                borderRadius: '100px',
                                                color: 'hsl(var(--text-secondary))'
                                            }}>
                                                {tool}
                                            </span>
                                        ))}
                                    </div>

                                    <div style={{
                                        marginTop: 'auto',
                                        paddingTop: '16px',
                                        borderTop: '1px solid var(--glass-border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <Link to={`/expert/${project.expert_id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
                                                background: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {project.profiles?.avatar_url ? (
                                                    <img src={project.profiles.avatar_url} alt={project.profiles.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <User size={20} color="#fff" />
                                                )}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{project.profiles?.full_name || 'Especialista'}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                                                    {project.profiles?.title || 'Gestor de Automação'}
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectShowcase;
