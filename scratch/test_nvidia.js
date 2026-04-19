const API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const API_KEY = "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";

async function testConnection() {
  console.log("Testing connection to NVIDIA NIM API...");
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: 'Say "Connection Successful"' }],
        temperature: 0.5,
        max_tokens: 10,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("SUCCESS!", data.choices[0].message.content);
    } else {
      const err = await response.json();
      console.error("FAILED:", response.status, err.message || "Unknown error");
    }
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

testConnection();
