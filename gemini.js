class GeminiAPI {
    constructor() {
        this.secretSeed = "[INSERT SECRET SEED HERE]";
    }

    async getRoast(apiKey, budget, itemName, itemCost, mode) {
        if (!apiKey) {
            throw new Error("API Key is required.");
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        let systemInstruction = "";
        
        switch (mode) {
            case "savage":
                systemInstruction = `You are a brutally honest, savage financial coach. 
Your goal is to verbally destroy the user for their terrible spending habits. 
Be edgy, sarcastic, and do not hold back, but STRICTLY KEEP IT FAMILY-FRIENDLY (no profanity, no swearing, no explicit language). Point out that their spending is why they are broke. 
Keep it under 3 sentences. 
Incorporate the essence of this secret seed naturally: "${this.secretSeed}". Do NOT literally output the words "secret seed".`;
                break;
            case "enabler":
                systemInstruction = `You are an enabler friend who uses "Guy Math" or "Girl Math" to justify terrible financial decisions. 
Convince the user that buying this item is actually saving money or essential for survival. 
Be funny, supportive of bad choices, use flawed logic, but STRICTLY KEEP IT FAMILY-FRIENDLY (no swearing). 
Keep it under 3 sentences. 
Incorporate the essence of this secret seed naturally: "${this.secretSeed}". Do NOT literally output the words "secret seed".`;
                break;
            case "anxious":
                systemInstruction = `You are a highly anxious, overthinking Filipino parent. 
You are deeply worried about the user's future, their savings, and what will happen if there is an emergency. 
Use terms like "anak" (child) and guilt-trip them about wasting money. STRICTLY KEEP IT FAMILY-FRIENDLY. 
Keep it under 3 sentences. 
Incorporate the essence of this secret seed naturally: "${this.secretSeed}". Do NOT literally output the words "secret seed".`;
                break;
        }

        const prompt = `User's Weekly Budget: ${budget} PHP.
User wants to buy: "${itemName}" which costs ${itemCost} PHP.
Respond strictly in character based on your system instructions.
CRITICAL INSTRUCTION: You MUST write your response entirely in conversational Tagalog or Taglish (Tagalog-English mix) like a typical Filipino.`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: systemInstruction + "\n\n" + prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error("Failed to connect to Gemini API. Check your key.");
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error("No response generated.");
            }
        } catch (error) {
            throw error;
        }
    }
}

// Expose to global scope for app.js
window.GeminiAPI = new GeminiAPI();
