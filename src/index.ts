import { config } from 'dotenv';
import { resolve } from 'path';
import { recordAudio } from './lib/sox/recorder.js';
import { transcribeAudio } from './lib/gemini/transcriber.js';

// Load environment variables
config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error('API_KEY not found in environment variables');
}

async function main() {
    try {
        // Record audio
        const outputFile = resolve('./recording.wav');
        await recordAudio(outputFile, {
            sampleRate: 16000,
            channels: 1
        });
        console.log(`Audio saved to ${outputFile}`);

        // Transcribe audio
        const transcription = await transcribeAudio(outputFile, {
            apiKey: API_KEY,
            prompt: "Transcribe this audio clip word for word."
        });

        console.log('\nTranscription:');
        console.log(transcription);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();