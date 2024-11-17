import { RecordingOptions } from './lib/sox/recorder.js';
import { TranscriptionOptions } from './lib/gemini/transcriber.js';
import { recordAudio } from './lib/sox/recorder.js';
import { transcribeAudio } from './lib/gemini/transcriber.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { unlink } from 'fs/promises';

export interface SpeechToTextOptions {
    apiKey: string;
    recording?: RecordingOptions;
    transcription?: Omit<TranscriptionOptions, 'apiKey'>;
}

export class SpeechToText {
    private apiKey: string;
    private recordingOptions: RecordingOptions;
    private transcriptionOptions: Omit<TranscriptionOptions, 'apiKey'>;

    constructor(options: SpeechToTextOptions) {
        this.apiKey = options.apiKey;
        this.recordingOptions = options.recording ?? {
            sampleRate: 16000,
            channels: 1
        };
        this.transcriptionOptions = options.transcription ?? {
            model: "gemini-1.5-flash",
            prompt: "Transcribe this audio clip word for word."
        };
    }

    /**
     * Creates a temporary file path
     */
    private getTempFilePath(): string {
        return join(tmpdir(), `stt-recording-${Date.now()}.wav`);
    }

    /**
     * Safely deletes a file if it exists
     */
    private async cleanupFile(filepath: string): Promise<void> {
        try {
            await unlink(filepath);
        } catch (error) {
            // Ignore errors if file doesn't exist
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                console.warn(`Warning: Failed to cleanup file ${filepath}:`, error);
            }
        }
    }

    /**
     * Records audio from the microphone and transcribes it
     * @param outputFile Optional path to save the recording
     * @returns The transcribed text
     */
    async recordAndTranscribe(outputFile?: string): Promise<string> {
        const audioFile = outputFile ?? this.getTempFilePath();
        
        try {
            // Record audio
            await recordAudio(audioFile, this.recordingOptions);

            // Transcribe audio
            const transcription = await transcribeAudio(audioFile, {
                apiKey: this.apiKey,
                ...this.transcriptionOptions
            });

            return transcription;
        } finally {
            // Clean up temp file if no output file was specified
            if (!outputFile) {
                await this.cleanupFile(audioFile);
            }
        }
    }

    /**
     * Transcribes an existing audio file
     * @param audioFile Path to the audio file
     * @returns The transcribed text
     */
    async transcribe(audioFile: string): Promise<string> {
        return await transcribeAudio(audioFile, {
            apiKey: this.apiKey,
            ...this.transcriptionOptions
        });
    }
}

// Export the types and utilities for library users
export type { RecordingOptions } from './lib/sox/recorder.js';
export type { TranscriptionOptions } from './lib/gemini/transcriber.js';