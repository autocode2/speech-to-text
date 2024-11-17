#!/usr/bin/env node

import { config } from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { SpeechToText } from "./index.js";

// Load environment variables
config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY not found in environment variables");
}

interface CliOptions {
  input?: string;
  output?: string;
  sampleRate?: number;
  channels?: number;
  model?: string;
  prompt?: string;
}

async function main() {
  const argv = (await yargs(hideBin(process.argv))
    .usage("Usage: $0 [options]")
    .options({
      input: {
        alias: "i",
        describe:
          "Input audio file to transcribe (if not provided, will record from microphone)",
        type: "string",
      },
      output: {
        alias: "o",
        describe:
          "Output file to save the recording (only applies when recording from microphone)",
        type: "string",
      },
      "sample-rate": {
        alias: "r",
        describe: "Sample rate for recording (Hz)",
        type: "number",
        default: 16000,
      },
      channels: {
        alias: "c",
        describe: "Number of audio channels",
        type: "number",
        default: 1,
      },
      model: {
        alias: "m",
        describe: "Gemini model to use",
        type: "string",
        default: "gemini-1.5-flash",
      },
      prompt: {
        alias: "p",
        describe: "Custom prompt for transcription",
        type: "string",
        default: "Transcribe this audio clip word for word.",
      },
    })
    .example("$0", "Record from microphone and transcribe")
    .example(
      "$0 -o recording.wav",
      "Record from microphone, save to file, and transcribe",
    )
    .example("$0 -i audio.wav", "Transcribe existing audio file")
    .example("$0 -r 44100 -c 2", "Record in 44.1kHz stereo")
    .help()
    .alias("help", "h")
    .version()
    .alias("version", "v")
    .parseAsync()) as unknown as CliOptions;

  try {
    const stt = new SpeechToText({
      apiKey: API_KEY,
      recording: {
        sampleRate: argv.sampleRate,
        channels: argv.channels,
      },
      transcription: {
        model: argv.model,
        prompt: argv.prompt,
      },
    });

    let transcription: string;

    if (argv.input) {
      // Transcribe existing file
      console.log(`Transcribing file: ${argv.input}`);
      transcription = await stt.transcribe(argv.input);
    } else {
      // Record and transcribe
      if (argv.output) {
        console.log(`Recording to file: ${argv.output}`);
      }
      console.log("Starting recording... Press Enter to stop.");
      transcription = await stt.recordAndTranscribe(argv.output);

      if (argv.output) {
        console.log(`Recording saved to: ${argv.output}`);
      }
    }

    console.log("\nTranscription:");
    console.log(transcription);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
