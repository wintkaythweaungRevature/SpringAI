import React, { useState } from "react";

function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateImage = async () => {
        if (!prompt) return alert("Please enter a prompt!");
        
        setLoading(true);
        try {
            // ✅ URL ကို api. subdomain သို့ လှမ်းခေါ်ထားသည်
            const response = await fetch(`https://api.wintkaythweaung.com/generate-image?prompt=${encodeURIComponent(prompt)}`);
            
            if (!response.ok) throw new Error("Image generation failed");

            const data = await response.text(); 
            console.log("Image URL:", data);
            
            // OpenAI URL ကို array ထဲထည့်လိုက်ပါ
            setImageUrls([data]); 
            
        } catch (error) {
            console.error("Error generating Image:", error);
            alert("ပုံထုတ်ရတာ အဆင်မပြေဖြစ်သွားပါတယ်။ Backend ကို စစ်ဆေးပါ။");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tab-content">
            <h2> Generate Image </h2>
            <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt for Image"
                disabled={loading}
                style={{ padding: '10px', width: '70%', marginBottom: '10px' }}
            /> 
            <button onClick={generateImage} disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                {loading ? "Generating..." : "Generate Image"}
            </button>

            <div className="image-grid" style={{ marginTop: '20px' }}>
                {imageUrls.map((url, index) => (
                    <img 
                        key={index} 
                        src={url} 
                        alt={`Generated ${index}`} 
                        style={{ width: '100%', maxWidth: '500px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                    />
                ))}
                
                {imageUrls.length === 0 && !loading && (
                    <div className="empty-image-slot" style={{ border: '2px dashed #ccc', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                        No image generated yet.
                    </div>
                )}
            </div>
        </div>
    ); // ✅ ပိတ်ဖို့ကျန်ခဲ့တဲ့ bracket လေး ပြန်ထည့်ပေးထားပါတယ်
}

export default ImageGenerator;