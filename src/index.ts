import { RecordingOptions } from './lib/sox/recorder.js';
import { TranscriptionOptions } from './lib/gemini/transcriber.js';
import { recordAudio } from './lib/sox/recorder.js';
import { transcribeAudio } from './lib/gemini/transcriber.js';

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
     * Records audio from the microphone and transcribes it
     * @returns The transcribed text
     */
    async recordAndTranscribe(): Promise<string> {
        const tempFile = `recording-${Date.now()}.wav`;
        
        try {
            // Record audio
            await recordAudio(tempFile, this.recordingOptions);

            // Transcribe audio
            const transcription = await transcribeAudio(tempFile, {
                apiKey: this.apiKey,
                ...this.transcriptionOptions
            });

            return transcription;
        } finally {
            // TODO: Clean up temp file
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