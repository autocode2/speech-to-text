import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface TranscriptionOptions {
  apiKey: string;
  model?: string;
  prompt?: string;
}

const defaultOptions: Partial<TranscriptionOptions> = {
  model: "gemini-1.5-flash",
  prompt: "Transcribe this audio clip word for word.",
};

/**
 * Transcribes an audio file using Google's Gemini API
 * @param audioPath Path to the audio file
 * @param options Transcription options
 * @returns Promise with the transcription text
 */
export async function transcribeAudio(
  audioPath: string,
  options: TranscriptionOptions,
): Promise<string> {
  const {
    apiKey,
    model = defaultOptions.model,
    prompt = defaultOptions.prompt,
  } = options;
  const fileManager = new GoogleAIFileManager(apiKey);

  console.log("Uploading audio file...");
  const uploadResult = await fileManager.uploadFile(audioPath, {
    mimeType: "audio/wav",
    displayName: "Voice Recording",
  });

  console.log("Processing audio...");
  let file = await fileManager.getFile(uploadResult.file.name);
  while (file.state === FileState.PROCESSING) {
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    file = await fileManager.getFile(uploadResult.file.name);
  }

  if (file.state === FileState.FAILED) {
    throw new Error("Audio processing failed.");
  }

  console.log("\nGenerating transcription...");
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model });
  const result = await genModel.generateContent([
    prompt,
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
  ]);

  return result.response.text();
}
