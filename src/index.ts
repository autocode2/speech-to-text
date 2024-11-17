import { spawn } from 'child_process';
import { createInterface } from 'readline';
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error('API_KEY not found in environment variables');
}

async function recordAudio(outputFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Spawn sox command to record from default microphone
        const sox = spawn('sox', [
            '-d', // Use default audio device
            outputFile,
            'rate', '16k', // Set sample rate to 16kHz
            'channels', '1', // Mono audio
        ]);

        // Handle potential errors
        sox.on('error', (err) => {
            console.error('Failed to start recording:', err);
            reject(err);
        });

        // Set up readline interface to watch for Enter key
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('Recording... Press Enter to stop.');

        // Wait for Enter key
        rl.question('', () => {
            // Kill the sox process to stop recording
            sox.kill();
            rl.close();
            console.log('Recording stopped.');
            resolve();
        });
    });
}

async function transcribeAudio(audioPath: string): Promise<string> {
    const fileManager = new GoogleAIFileManager(API_KEY);

    console.log('Uploading audio file...');
    const uploadResult = await fileManager.uploadFile(audioPath, {
        mimeType: "audio/wav",
        displayName: "Voice Recording",
    });

    console.log('Processing audio...');
    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === FileState.PROCESSING) {
        process.stdout.write(".");
        // Sleep for 10 seconds
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        // Fetch the file from the API again
        file = await fileManager.getFile(uploadResult.file.name);
    }

    if (file.state === FileState.FAILED) {
        throw new Error("Audio processing failed.");
    }

    console.log('\nGenerating transcription...');
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
        "Transcribe this audio clip word for word.",
        {
            fileData: {
                fileUri: uploadResult.file.uri,
                mimeType: uploadResult.file.mimeType,
            },
        },
    ]);

    return result.response.text();
}

async function main() {
    try {
        const outputFile = resolve('./recording.wav');
        await recordAudio(outputFile);
        console.log(`Audio saved to ${outputFile}`);

        const transcription = await transcribeAudio(outputFile);
        console.log('\nTranscription:');
        console.log(transcription);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();