const API_URL = 'https://integrate.api.nvidia.com/v1/models';
const API_KEY = "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";

async function listAsrModels() {
  console.log("Fetching ASR models from NVIDIA...");
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("ASR/AUDIO MODELS:");
      data.data
        .filter(m => m.id.toLowerCase().includes('audio') || m.id.toLowerCase().includes('asr') || m.id.toLowerCase().includes('canary'))
        .forEach(m => console.log(`- ${m.id}`));
    } else {
      console.error("FAILED:", response.status);
    }
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

listAsrModels();
