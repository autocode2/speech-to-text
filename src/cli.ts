#!/usr/bin/env node

import { config } from 'dotenv';
import { SpeechToText } from './index.js';

// Load environment variables
config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error('API_KEY not found in environment variables');
}

async function main() {
    try {
        const stt = new SpeechToText({
            apiKey: API_KEY,
        });

        console.log('Starting recording...');
        const transcription = await stt.recordAndTranscribe();
        
        console.log('\nTranscription:');
        console.log(transcription);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();