import React, { useState } from "react";

function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateImage = async () => {
        if (!prompt) return alert("Please enter a prompt!");

        setLoading(true);
        try {
            // ၁။ Endpoint ကို /generate-image သို့ ပြောင်းပါ
            const response = await fetch(`https://api.wintkaythweaung.com/api/ai/generate-image?prompt=${encodeURIComponent(prompt)}`);
            
            if (!response.ok) {
                throw new Error("Backend error or Forbidden");
            }

            // ၂။ Backend က Map<String, String> ပို့တာမို့ JSON အနေနဲ့ ဖတ်ပါ
            const data = await response.json(); 

            // ၃။ { "url": "http://..." } ဆိုတဲ့ object ထဲက url ကိုပဲ ယူသုံးပါ
            if (data.url) {
                setImageUrls([data.url]); // Array အသစ်အနေနဲ့ ထည့်လိုက်တာပါ
            } else {
                alert("Image URL not found in response.");
            }

        } catch (error) {
            console.error("Error generating Image : ", error);
            alert("Image ထုတ်ပေးရာတွင် အမှားအယွင်းရှိနေပါသည်။ (Check Backend Status)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tab-content">
            <h2>AI Image Generator</h2>
            <div className="input-group">
                <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. A futuristic city in Myanmar..."
                    style={{ padding: '10px', width: '300px', border: '1px solid #ccc', borderRadius: '4px' }}
                /> 
                <button 
                    onClick={generateImage} 
                    disabled={loading}
                    style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? "Generating..." : "Generate Image"}
                </button>
            </div>

            <div className="image-grid" style={{ marginTop: '20px' }}>
                {imageUrls.length > 0 ? (
                    imageUrls.map((url, index) => (
                        <div key={index} style={{ textAlign: 'center' }}>
                            <img 
                                src={url} 
                                alt={`Generated result`} 
                                style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                onError={(e) => { e.target.src = "https://via.placeholder.com/500?text=Invalid+Image+URL"; }}
                            />
                            <br/>
                            <a href={url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '10px', color: '#007bff' }}>
                                Open Full Image
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="empty-image-slot" style={{ width: '100%', maxWidth: '500px', height: '300px', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                        <p>{loading ? "AI is painting your imagination..." : "No image generated yet"}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageGenerator;