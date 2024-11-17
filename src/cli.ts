#!/usr/bin/env node

import { config } from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { SpeechToText } from './index.js';

// Load environment variables
config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error('API_KEY not found in environment variables');
}

interface CliOptions {
    file?: string;
    sampleRate?: number;
    channels?: number;
    model?: string;
    prompt?: string;
}

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .usage('Usage: $0 [options]')
        .options({
            'file': {
                alias: 'f',
                describe: 'Audio file to transcribe (if not provided, will record from microphone)',
                type: 'string'
            },
            'sample-rate': {
                alias: 'r',
                describe: 'Sample rate for recording (Hz)',
                type: 'number',
                default: 16000
            },
            'channels': {
                alias: 'c',
                describe: 'Number of audio channels',
                type: 'number',
                default: 1
            },
            'model': {
                alias: 'm',
                describe: 'Gemini model to use',
                type: 'string',
                default: 'gemini-1.5-flash'
            },
            'prompt': {
                alias: 'p',
                describe: 'Custom prompt for transcription',
                type: 'string',
                default: 'Transcribe this audio clip word for word.'
            }
        })
        .example('$0', 'Record from microphone and transcribe')
        .example('$0 -f audio.wav', 'Transcribe existing audio file')
        .example('$0 -r 44100 -c 2', 'Record in 44.1kHz stereo')
        .help()
        .alias('help', 'h')
        .version()
        .alias('version', 'v')
        .parseAsync() as unknown as CliOptions;

    try {
        const stt = new SpeechToText({
            apiKey: API_KEY,
            recording: {
                sampleRate: argv.sampleRate,
                channels: argv.channels
            },
            transcription: {
                model: argv.model,
                prompt: argv.prompt
            }
        });

        let transcription: string;

        if (argv.file) {
            console.log(`Transcribing file: ${argv.file}`);
            transcription = await stt.transcribe(argv.file);
        } else {
            console.log('Starting recording... Press Enter to stop.');
            transcription = await stt.recordAndTranscribe();
        }
        
        console.log('\nTranscription:');
        console.log(transcription);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();