import { spawn } from 'child_process';
import { createInterface } from 'readline';

export interface RecordingOptions {
    sampleRate?: number;
    channels?: number;
}

const defaultOptions: RecordingOptions = {
    sampleRate: 16000,
    channels: 1,
};

/**
 * Records audio from the default microphone using sox
 * @param outputFile Path to save the recording
 * @param options Recording options (sample rate, channels)
 * @returns Promise that resolves when recording is stopped
 */
export async function recordAudio(
    outputFile: string, 
    options: RecordingOptions = defaultOptions
): Promise<void> {
    const { sampleRate = 16000, channels = 1 } = options;

    return new Promise((resolve, reject) => {
        const sox = spawn('sox', [
            '-d', // Use default audio device
            outputFile,
            'rate', sampleRate.toString(),
            'channels', channels.toString(),
        ]);

        sox.on('error', (err) => {
            console.error('Failed to start recording:', err);
            reject(err);
        });

        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('Recording... Press Enter to stop.');

        rl.question('', () => {
            sox.kill();
            rl.close();
            console.log('Recording stopped.');
            resolve();
        });
    });
}