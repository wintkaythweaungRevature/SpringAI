import react, { useState } from "react";

function ImageGenerator()
{

    const [prompt ,setPrompt ] = useState('');
    const [imageUrls , setImageUrls] = useState([]);

    const generateImage = async () => {

    };

    return (
        <div className="tab-content" >

            <h2> Generate Image </h2>
            <input type = "text " 
            value ={prompt}
            onChange={(e)=>setPrompt(e.target.value)}
            placeholder="Enter prompt for Image "/> 
            <button onClick={generateImage}>Generate Image</button>
            <div className=" image-grid">

            </div>
                    </div>
       
    );
}
export default ImageGenerator;