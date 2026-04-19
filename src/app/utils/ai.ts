import { CapacitorHttp } from '@capacitor/core';

const NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;
const API_URL = import.meta.env.DEV 
  ? '/nvidia-api/v1/chat/completions' 
  : 'https://integrate.api.nvidia.com/v1/chat/completions';

export const callNvidiaApi = async (messages: any[], options: { temperature?: number, max_tokens?: number } = {}) => {
  if (!NVIDIA_API_KEY) throw new Error('API Key missing');

  try {
    // For web development with Vite proxy, we need the full origin if using CapacitorHttp
    const finalUrl = (import.meta.env.DEV && API_URL.startsWith('/')) 
      ? `${window.location.origin}${API_URL}` 
      : API_URL;

    const response = await CapacitorHttp.post({
      url: finalUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      data: {
        model: 'meta/llama-3.1-8b-instruct',
        messages,
        temperature: options.temperature ?? 0.6,
        max_tokens: options.max_tokens ?? 512,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      // CapacitorHttp data is already parsed as JSON
      return response.data.choices[0].message.content;
    } else {
      throw new Error(response.data?.message || response.data?.error?.message || `API request failed with status ${response.status}`);
    }
  } catch (error: any) {
    console.error('CapacitorHttp Error:', error);
    throw error;
  }
};
