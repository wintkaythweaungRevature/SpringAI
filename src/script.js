// Replace this with your ACTUAL AWS URL from the Beanstalk dashboard
const AWS_BACKEND_URL = "http://wintspringbootaws.eba-2kvb9tdk.us-east-2.elasticbeanstalk.com/";

async function askAI(userPrompt) {
    try {
        const response = await fetch(`${AWS_BACKEND_URL}/ai/generate`, { // adjust /ai/generate to your @PostMapping path
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userPrompt })
        });
        
        const data = await response.json();
        console.log("AI Response:", data);
    } catch (error) {
        console.error("Error calling AWS Backend:", error);
    }
}