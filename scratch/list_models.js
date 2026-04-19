const API_URL = 'https://integrate.api.nvidia.com/v1/models';
const API_KEY = "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";

async function listModels() {
  console.log("Fetching available models from NVIDIA...");
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("AVAILABLE MODELS:");
      data.data.forEach(m => console.log(`- ${m.id}`));
    } else {
      const err = await response.json().catch(() => ({}));
      console.error("FAILED:", response.status, err.message || "Unknown error");
    }
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

listModels();
