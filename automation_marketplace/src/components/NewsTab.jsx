import { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, ImageOff } from 'lucide-react';

const NewsTab = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fontes mais visuais e populares do Brasil
    const FEEDS = [
        { name: 'TecMundo', url: 'https://rss.tecmundo.com.br/feed', color: '#05c2e2' },
        { name: 'Olhar Digital', url: 'https://olhardigital.com.br/feed/', color: '#ff6600' },
        { name: 'Canaltech', url: 'https://canaltech.com.br/rss/', color: '#007bc2' },
        // { name: 'TabNews', url: 'https://www.tabnews.com.br/recentes/rss', color: '#24292e' } // TabNews é ótimo mas sem imagens
    ];

    const extractImage = (item) => {
        // 1. Tenta thumbnail direta do JSON
        if (item.thumbnail && item.thumbnail.match(/^http/)) return item.thumbnail;

        // 2. Tenta enclosure (padrão RSS para mídia)
        if (item.enclosure && item.enclosure.link) return item.enclosure.link;

        // 3. Tenta extrair src de tag img na descrição/conteúdo
        const content = item.content || item.description || '';
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) return imgMatch[1];

        return null;
    };

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const promises = FEEDS.map(feed =>
                fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
                    .then(res => {
                        if (!res.ok) throw new Error('Network response was not ok');
                        return res.json();
                    })
                    .then(data => {
                        if (data.status === 'ok') {
                            return data.items.map(item => ({
                                ...item,
                                source: feed.name,
                                sourceColor: feed.color,
                                image: extractImage(item)
                            }));
                        }
                        return [];
                    })
                    .catch(err => {
                        console.error(`Erro ao buscar ${feed.name}:`, err);
                        return [];
                    })
            );

            const results = await Promise.all(promises);
            let allNews = results.flat();

            // Filtrar notícias de cultura pop/entretenimento que as vezes vazam nos feeds de tecnologia
            const blockedKeywords = ['filme', 'série', 'anime', 'manga', 'marvel', 'dc', 'netflix', 'disney', 'hbo', 'jogo', 'game', 'ps5', 'xbox', 'nintendo', 'steam'];

            allNews = allNews.filter(item => {
                const text = (item.title + ' ' + item.description).toLowerCase();
                return !blockedKeywords.some(keyword => text.includes(keyword));
            });

            // Ordenar por data
            allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

            setNews(allNews);
        } catch (err) {
            console.error('Erro geral ao buscar notícias:', err);
            setError('Erro ao atualizar notícias.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px', color: 'hsl(var(--text-secondary))' }}>
                <RefreshCw className="spin" size={32} style={{ marginBottom: '16px', color: 'hsl(var(--primary))' }} />
                <p style={{ fontSize: '1.1rem' }}>Carregando notícias do mundo tech...</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Últimas Notícias</h3>
                    <span style={{
                        background: 'hsl(var(--primary)/0.1)', color: 'hsl(var(--primary))',
                        padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600'
                    }}>
                        Tech & Inovação
                    </span>
                </div>
                <button onClick={fetchNews} className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <RefreshCw size={16} /> Atualizar Feed
                </button>
            </div>

            {news.length === 0 && !error ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Nenhuma notícia encontrada no momento.</p>
                </div>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {news.map((item, index) => (
                    <div key={index} className="glass-card news-card" style={{
                        display: 'flex', flexDirection: 'column', height: '100%',
                        padding: 0, overflow: 'hidden', border: '1px solid var(--glass-border)',
                        transition: 'transform 0.2s', cursor: 'default'
                    }}>
                        {/* Imagem de Capa */}
                        <div style={{ height: '180px', width: '100%', position: 'relative', background: '#1a1a1a' }}>
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : null}
                            {/* Fallback se não tiver imagem ou der erro */}
                            <div style={{
                                display: item.image ? 'none' : 'flex',
                                width: '100%', height: '100%', position: 'absolute', top: 0, left: 0,
                                alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                                background: `linear-gradient(135deg, ${item.sourceColor}22, #111)`
                            }}>
                                <ImageOff size={32} color={item.sourceColor} style={{ opacity: 0.5, marginBottom: '8px' }} />
                                <span style={{ fontSize: '0.8rem', color: item.sourceColor, opacity: 0.8, fontWeight: 'bold' }}>
                                    {item.source}
                                </span>
                            </div>

                            {/* Badge da Fonte */}
                            <div style={{
                                position: 'absolute', top: '12px', right: '12px',
                                background: item.sourceColor, color: '#fff',
                                padding: '4px 10px', borderRadius: '4px',
                                fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}>
                                {item.source}
                            </div>
                        </div>

                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', display: 'block' }}>
                                {new Date(item.pubDate).toLocaleDateString(undefined, { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                            </span>

                            <h4 style={{ fontSize: '1.1rem', marginBottom: '12px', lineHeight: '1.4' }}>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} className="hover-link">
                                    {item.title}
                                </a>
                            </h4>

                            <p style={{
                                color: 'hsl(var(--text-secondary))',
                                fontSize: '0.9rem',
                                lineHeight: '1.6',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                marginBottom: '20px'
                            }}>
                                {item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 140) + '...' : ''}
                            </p>

                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline"
                                style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', gap: '8px', width: '100%' }}
                            >
                                Ler Notícia Completa <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .news-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
                }
                .hover-link:hover {
                    color: hsl(var(--primary));
                }
            `}</style>
        </div>
    );
};

export default NewsTab;
