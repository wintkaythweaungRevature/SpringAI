import React, { useState } from "react";

function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateImage = async () => {
        if (!prompt) return alert("Please enter a prompt!");

        setLoading(true);
        try {
            const response = await fetch(`https://api.wintkaythweaung.com/api/ai/ask-ai?prompt=${encodeURIComponent(prompt)}`);
            
            // ✅ ပြဿနာကို ဒီမှာ ဖြေရှင်းထားပါတယ်: JSON အစား Text အနေနဲ့ အရင်ဖတ်ပါ
            const data = await response.text();
            console.log("Raw Response:", data);

            // Backend က URL စာသားတစ်ခုတည်း ပြန်လာတယ်ဆိုရင် Array ထဲထည့်ပေးရပါမယ်
            // အကယ်၍ backend က JSON array ပြန်တာသေချာမှ .json() ကို သုံးသင့်ပါတယ်
            setImageUrls([data]); 

        } catch (error) {
            console.error("Error generating Image : ", error);
            alert("Image ထုတ်ပေးရာတွင် အမှားအယွင်းရှိနေပါသည်။");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tab-content">
            <h2>Generate Image</h2>
            <div className="input-group">
                <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter prompt for Image (e.g. A cat flying in space)"
                    style={{ padding: '10px', width: '250px' }}
                /> 
                <button onClick={generateImage} disabled={loading}>
                    {loading ? "Generating..." : "Generate Image"}
                </button>
            </div>

            <div className="image-grid" style={{ marginTop: '20px' }}>
                {imageUrls.length > 0 ? (
                    imageUrls.map((url, index) => (
                        <img 
                            key={index} 
                            src={url} 
                            alt={`Generated ${index}`} 
                            style={{ width: '300px', borderRadius: '8px', border: '1px solid #ddd' }}
                            onError={(e) => { e.target.alt = "Invalid Image URL"; }}
                        />
                    ))
                ) : (
                    <div className="empty-image-slot" style={{ width: '300px', height: '300px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        No image yet
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageGenerator; 