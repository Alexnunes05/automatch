import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Save, X, Plus } from 'lucide-react';
import ImageUpload from './ImageUpload';

const TemplateForm = ({ user, onCancel, onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        title: '',
        short_description: '',
        full_description: '',
        category: 'Vendas',
        price: '',
        difficulty: 'Iniciante',
        delivery_type: 'download',
        tools: '', // comma separated for input
        integrations: '', // comma separated
        preview_image: '',
        template_file_url: '',
        checkout_link: '',
        status: 'published'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                short_description: initialData.short_description || '',
                full_description: initialData.full_description || '',
                category: initialData.category || 'Vendas',
                price: initialData.price || '',
                difficulty: initialData.difficulty || 'Iniciante',
                delivery_type: initialData.delivery_type || 'download',
                tools: initialData.tools ? initialData.tools.join(', ') : '',
                integrations: initialData.integrations ? initialData.integrations.join(', ') : '',
                preview_image: initialData.preview_images?.[0] || '',
                template_file_url: initialData.template_file_url || '',
                checkout_link: initialData.checkout_link || '',
                status: initialData.status || 'published'
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Process arrays
            const toolsArray = formData.tools.split(',').map(t => t.trim()).filter(t => t);
            const integrationsArray = formData.integrations.split(',').map(t => t.trim()).filter(t => t);
            const previewImagesArray = formData.preview_image ? [formData.preview_image] : [];

            const payload = {
                expert_id: user.id,
                title: formData.title,
                short_description: formData.short_description,
                full_description: formData.full_description,
                category: formData.category,
                price: parseFloat(formData.price) || 0,
                difficulty: formData.difficulty,
                delivery_type: formData.delivery_type,
                tools: toolsArray,
                integrations: integrationsArray,
                preview_images: previewImagesArray,
                template_file_url: formData.template_file_url,
                checkout_link: formData.checkout_link,
                status: formData.status
            };

            let error;
            if (initialData) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('templates')
                    .update(payload)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                // Create new
                const { error: insertError } = await supabase
                    .from('templates')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            alert(initialData ? 'Template atualizado com sucesso!' : 'Template publicado com sucesso!');
            onSuccess();

        } catch (error) {
            console.error('Error saving template:', error);
            alert('Erro ao salvar template: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card fade-in" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3>{initialData ? 'Editar Template' : 'Novo Template'}</h3>
                <button onClick={onCancel} className="btn btn-outline" style={{ border: 'none' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Título do Template</label>
                        <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="Ex: Chatbot de Vendas para WhatsApp" />
                    </div>
                    <div className="form-group">
                        <label>Categoria</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option>Vendas</option>
                            <option>Atendimento</option>
                            <option>Financeiro</option>
                            <option>Marketing</option>
                            <option>IA</option>
                            <option>Produtividade</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Descrição Curta (aparece no card)</label>
                    <input type="text" name="short_description" required maxLength={150} value={formData.short_description} onChange={handleChange} placeholder="Resumo em uma frase..." />
                </div>

                <div className="form-group">
                    <label>Descrição Completa</label>
                    <textarea name="full_description" required rows={6} value={formData.full_description} onChange={handleChange} placeholder="Detalhes, como funciona, requisitos..." />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Ferramentas (separar por vírgula)</label>
                        <input type="text" name="tools" value={formData.tools} onChange={handleChange} placeholder="n8n, OpenAI, Google Sheets" />
                    </div>
                    <div className="form-group">
                        <label>Integrações (separar por vírgula)</label>
                        <input type="text" name="integrations" value={formData.integrations} onChange={handleChange} placeholder="WhatsApp, HubSpot, Gmail" />
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Preço (R$)</label>
                        <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" />
                    </div>
                    <div className="form-group">
                        <label>Dificuldade</label>
                        <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                            <option>Iniciante</option>
                            <option>Intermediário</option>
                            <option>Avançado</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <ImageUpload
                        label="Imagem de Capa do Template"
                        currentImage={formData.preview_image}
                        onUpload={(url) => setFormData({ ...formData, preview_image: url })}
                        folder="templates"
                    />
                </div>

                <div className="form-group">
                    <label>Link de Checkout (Pagamento Externo)</label>
                    <input type="url" name="checkout_link" value={formData.checkout_link} onChange={handleChange} placeholder="https://pay.kiwify.com.br/..." />
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Se preenchido, o botão "Comprar" levará para este link.</p>
                </div>

                <div className="form-group">
                    <label>Link do Arquivo/Download (Privado)</label>
                    <input type="text" name="template_file_url" value={formData.template_file_url} onChange={handleChange} placeholder="Link do Google Drive ou JSON do n8n" />
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Este link só será enviado para quem comprar.</p>
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                    </select>
                </div>

                <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Template'}
                    </button>
                    <button type="button" onClick={onCancel} className="btn btn-outline">Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default TemplateForm;
