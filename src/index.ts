import { spawn } from 'child_process';
import { createInterface } from 'readline';

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

async function main() {
    try {
        const outputFile = 'recording.wav';
        await recordAudio(outputFile);
        console.log(`Audio saved to ${outputFile}`);
    } catch (error) {
        console.error('Recording failed:', error);
    }
}

main();