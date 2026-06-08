import { GoogleGenAI, Modality } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
  'gemini-3.1-flash-tts-preview',
  'gemini-2.5-flash-native-audio-preview-12-2025',
];

const LIVE_TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-3.1-flash-tts-preview',
  'gemini-2.5-flash-native-audio-preview-12-2025',
];

const pcmToWav = (pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16) => {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
};

const getAudioData = (response: any) => {
  if (typeof response?.data === 'string' && response.data) {
    return { data: response.data, mimeType: 'audio/pcm;rate=24000' };
  }

  const parts = response?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inlineData = part?.inlineData || part?.inline_data;
    if (typeof inlineData?.data === 'string' && inlineData.data) {
      return {
        data: inlineData.data,
        mimeType: inlineData.mimeType || inlineData.mime_type || 'audio/pcm;rate=24000',
      };
    }
  }

  return null;
};

const audioDataUrl = (base64Audio: string, mimeType: string) => {
  if (/audio\/wav/i.test(mimeType)) return `data:audio/wav;base64,${base64Audio}`;
  if (/audio\/mpeg|audio\/mp3/i.test(mimeType)) return `data:audio/mpeg;base64,${base64Audio}`;
  const sampleRate = Number(mimeType.match(/rate=(\d+)/i)?.[1] || 24000);
  const wav = pcmToWav(Buffer.from(base64Audio, 'base64'), sampleRate);
  return `data:audio/wav;base64,${wav.toString('base64')}`;
};

export async function POST(request: Request) {
  try {
    const { text, lowLatency } = await request.json();
    const cleanText = String(text || '').replace(/\*\*/g, '').trim();
    if (!cleanText) return NextResponse.json({ error: 'Missing text' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Gemini voice is not configured' }, { status: 503 });

    const ai = new GoogleGenAI({ apiKey });

    const models = lowLatency ? LIVE_TTS_MODELS : TTS_MODELS;
    const maxChars = lowLatency ? 280 : 3500;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: cleanText.slice(0, maxChars),
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });

        const audio = getAudioData(response);
        if (!audio) throw new Error('No audio returned');
        return NextResponse.json({
          audio: audioDataUrl(audio.data, audio.mimeType),
          model,
        });
      } catch (error) {
        console.warn(`Z TTS failed with ${model}`, error);
      }
    }

    return NextResponse.json({ error: 'Gemini voice is unavailable right now' }, { status: 503 });
  } catch (error) {
    console.error('Z TTS failed', error);
    return NextResponse.json({ error: 'Failed to generate Z voice' }, { status: 500 });
  }
}
