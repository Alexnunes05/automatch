import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Save, User, Globe, Linkedin, Instagram, Phone } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

const ProfileSettings = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        avatar_url: '',
        full_name: '',
        title: '',
        bio: '',
        whatsapp: '',
        instagram: '',
        linkedin: '',
        portfolio_url: '',
        skills: '' // We'll manage as comma-separated string for simplicity
    });

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setFormData({
                    avatar_url: data.avatar_url || '',
                    full_name: data.full_name || '',
                    title: data.title || '',
                    bio: data.bio || '',
                    whatsapp: data.whatsapp || '',
                    instagram: data.instagram || '',
                    linkedin: data.linkedin || '',
                    portfolio_url: data.portfolio_url || '',
                    skills: data.skills ? data.skills.join(', ') : ''
                });
            }
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Convert comma-separated skills to array
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);

            const { error } = await supabase
                .from('profiles')
                .update({
                    avatar_url: formData.avatar_url,
                    full_name: formData.full_name,
                    title: formData.title,
                    bio: formData.bio,
                    whatsapp: formData.whatsapp,
                    instagram: formData.instagram,
                    linkedin: formData.linkedin,
                    portfolio_url: formData.portfolio_url,
                    skills: skillsArray,
                    updated_at: new Date()
                })
                .eq('id', user.id);

            if (error) throw error;
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar perfil.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Carregando perfil...</p>;

    return (
        <div className="glass-card fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User /> Editar Meu Perfil
            </h2>

            <form onSubmit={handleSubmit}>
                <ImageUpload
                    label="Foto de Perfil"
                    currentImage={formData.avatar_url}
                    onUpload={(url) => setFormData({ ...formData, avatar_url: url })}
                    folder="avatars"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Nome Completo</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="form-control"
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Título Profissional</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Ex: Especialista em n8n"
                            value={formData.title}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Bio / Sobre Mim</label>
                    <textarea
                        name="bio"
                        rows="4"
                        placeholder="Conte um pouco sobre sua experiência..."
                        value={formData.bio}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontFamily: 'inherit' }}
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Habilidades (separadas por vírgula)</label>
                    <input
                        type="text"
                        name="skills"
                        placeholder="n8n, Python, Zapier, Marketing"
                        value={formData.skills}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', marginTop: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                    Dados de Contato & Redes
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Phone size={16} /> WhatsApp</label>
                        <input
                            type="text"
                            name="whatsapp"
                            placeholder="(11) 99999-9999"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Instagram size={16} /> Instagram</label>
                        <input
                            type="text"
                            name="instagram"
                            placeholder="@seu.perfil"
                            value={formData.instagram}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Linkedin size={16} /> LinkedIn</label>
                        <input
                            type="text"
                            name="linkedin"
                            placeholder="url-do-perfil"
                            value={formData.linkedin}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Globe size={16} /> Portfólio Externo (URL)</label>
                        <input
                            type="text"
                            name="portfolio_url"
                            placeholder="https://..."
                            value={formData.portfolio_url}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </form>
        </div>
    );
};

export default ProfileSettings;
