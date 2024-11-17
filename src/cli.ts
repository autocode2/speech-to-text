#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { SpeechToText } from "./index.js";

interface CliOptions {
  apiKey: string;
  input?: string;
  output?: string;
  sampleRate?: number;
  channels?: number;
  model?: string;
  prompt?: string;
  format?: "text" | "json";
}

interface TranscriptionResult {
  text: string;
  timestamp: string;
  input?: string;
  output?: string;
  sampleRate?: number;
  channels?: number;
  model?: string;
}

// Handle broken pipe gracefully
process.stdout.on("error", (err) => {
  if (err.code === "EPIPE") process.exit(0);
});

function logStatus(message: string) {
  if (process.stderr.isTTY) {
    console.error(message);
  }
}

function outputResult(result: TranscriptionResult, format: "text" | "json") {
  if (format === "json") {
    process.stdout.write(JSON.stringify(result) + "\n");
  } else {
    console.log("\nTranscription:");
    console.log(result.text);
  }
}

async function main() {
  const argv = (await yargs(hideBin(process.argv))
    .usage("Usage: $0 --api-key YOUR_API_KEY [options]")
    .options({
      "api-key": {
        alias: "k",
        describe: "Google API Key for Gemini",
        type: "string",
        demandOption: true,
        requiresArg: true,
      },
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
      format: {
        alias: "f",
        describe: "Output format",
        choices: ["text", "json"] as const,
        default: process.stdout.isTTY ? "text" : "json",
      },
    })
    .example("$0 -k YOUR_API_KEY", "Record from microphone and transcribe")
    .example(
      "$0 -k YOUR_API_KEY -o recording.wav",
      "Record from microphone, save to file, and transcribe",
    )
    .example(
      "$0 -k YOUR_API_KEY -i audio.wav",
      "Transcribe existing audio file",
    )
    .example("$0 -k YOUR_API_KEY -r 44100 -c 2", "Record in 44.1kHz stereo")
    .example(
      "$0 -k YOUR_API_KEY --format json > output.json",
      "Output in JSON format",
    )
    .example("$0 -k YOUR_API_KEY | jq .text", "Pipe transcription text to jq")
    .help()
    .alias("help", "h")
    .version()
    .alias("version", "v")
    .parseAsync()) as unknown as CliOptions;

  try {
    const stt = new SpeechToText({
      apiKey: argv.apiKey,
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
      logStatus(`Transcribing file: ${argv.input}`);
      transcription = await stt.transcribe(argv.input);
    } else {
      if (argv.output) {
        logStatus(`Recording to file: ${argv.output}`);
      }
      logStatus("Starting recording... Press Enter to stop.");
      transcription = await stt.recordAndTranscribe(argv.output);

      if (argv.output) {
        logStatus(`Recording saved to: ${argv.output}`);
      }
    }

    const result: TranscriptionResult = {
      text: transcription,
      timestamp: new Date().toISOString(),
      ...(argv.input && { input: argv.input }),
      ...(argv.output && { output: argv.output }),
      ...(argv.sampleRate && { sampleRate: argv.sampleRate }),
      ...(argv.channels && { channels: argv.channels }),
      ...(argv.model && { model: argv.model }),
    };

    outputResult(result, argv.format || "text");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
