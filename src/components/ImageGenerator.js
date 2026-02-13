import React, { useState } from "react";

function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateImage = async () => {
        if (!prompt) return alert("Please enter a prompt!");

        setLoading(true);
        try {
            // ✅ AWS Backend URL (Cloudflare DNS မှတစ်ဆင့်)
            // Port 5000 လိုအပ်ပါက :5000 ထည့်ပေးပါ
const response = await fetch(`https://main.dk6jk3fcod2l.amplifyapp.com/api/ai/generate-image?prompt=${encodeURIComponent(prompt)}`);
            
            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }

            const data = await response.json(); 

            // Backend က { "url": "http://..." } ပို့ပေးသည်ကို စစ်ဆေးခြင်း
            if (data.url) {
                setImageUrls([data.url]); 
            } else {
                alert("Image URL not found in response.");
            }

        } catch (error) {
            console.error("Error generating Image : ", error);
            alert("Image ထုတ်ပေးရာတွင် အမှားအယွင်းရှိနေပါသည်။ AWS Server နှင့် API Key ကို စစ်ဆေးပါ။");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>🎨 AI Image Generator</h2>
                <p style={styles.subtitle}>သင်စိတ်ကူးရှိရာကို စာသားရိုက်ရုံဖြင့် ပုံဖော်လိုက်ပါ</p>
                
                <div style={styles.inputGroup}>
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && generateImage()}
                        placeholder="e.g. A futuristic city in Myanmar with golden pagodas..."
                        style={styles.input}
                        disabled={loading}
                    /> 
                    <button 
                        onClick={generateImage} 
                        disabled={loading}
                        style={{
                            ...styles.button,
                            backgroundColor: loading ? '#ccc' : '#007bff',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? "Generating..." : "Generate"}
                    </button>
                </div>

                <div style={styles.displayArea}>
                    {imageUrls.length > 0 ? (
                        imageUrls.map((url, index) => (
                            <div key={index} style={styles.imageWrapper}>
                                <img 
                                    src={url} 
                                    alt={`Generated result`} 
                                    style={styles.image} 
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/500?text=Invalid+Image+URL"; }}
                                />
                                <div style={styles.actionArea}>
                                    <a href={url} target="_blank" rel="noreferrer" style={styles.link}>
                                        🔍 View Full Size
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={styles.placeholder}>
                            <p style={styles.placeholderText}>
                                {loading ? "AI က သင့်အတွက် ပုံဆွဲပေးနေပါပြီ..." : "ပုံထုတ်ရန် စာသားရိုက်ထည့်ပါ"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Inline Styles for simplicity
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: '#f4f7f6',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
    },
    card: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
    },
    title: {
        margin: '0 0 10px 0',
        color: '#333'
    },
    subtitle: {
        color: '#666',
        marginBottom: '25px',
        fontSize: '14px'
    },
    inputGroup: {
        display: 'flex',
        gap: '10px',
        marginBottom: '30px'
    },
    input: {
        flex: 1,
        padding: '12px 15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '16px',
        outline: 'none'
    },
    button: {
        padding: '12px 24px',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: '0.3s'
    },
    displayArea: {
        marginTop: '20px',
        minHeight: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageWrapper: {
        width: '100%',
        animation: 'fadeIn 0.5s ease-in'
    },
    image: {
        width: '100%',
        borderRadius: '12px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    },
    placeholder: {
        width: '100%',
        height: '300px',
        border: '2px dashed #ccc',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa'
    },
    placeholderText: {
        color: '#999',
        fontSize: '15px'
    },
    actionArea: {
        marginTop: '15px'
    },
    link: {
        textDecoration: 'none',
        color: '#007bff',
        fontWeight: 'bold',
        fontSize: '14px'
    }
};

export default ImageGenerator;