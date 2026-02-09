import { useState } from 'react';
import { supabase } from '../services/supabase';
import { Upload, X, Loader } from 'lucide-react';

const ImageUpload = ({ onUpload, currentImage, label = "Upload Imagem", folder = "uploads" }) => {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (event) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Você deve selecionar uma imagem para upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);

            if (data) {
                onUpload(data.publicUrl);
            }

        } catch (error) {
            alert('Erro ao fazer upload da imagem: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
                {label}
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {currentImage ? (
                    <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img
                            src={currentImage}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                            onClick={() => onUpload('')}
                            style={{
                                position: 'absolute', top: '4px', right: '4px',
                                background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                                width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#fff'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '8px',
                        border: '2px dashed rgba(255,255,255,0.1)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: 'hsl(var(--text-secondary))', fontSize: '0.8rem'
                    }}>
                        {uploading ? <Loader size={24} className="animate-spin" /> : <Upload size={24} />}
                    </div>
                )}

                {!currentImage && (
                    <div>
                        <input
                            type="file"
                            id={`single-${folder}`} // unique id
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />
                        <label
                            htmlFor={`single-${folder}`}
                            className="btn btn-outline btn-sm"
                            style={{ cursor: uploading ? 'wait' : 'pointer' }}
                        >
                            {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
                            JPG, PNG ou GIF. Max 2MB.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
