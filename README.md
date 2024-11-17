# @autocode2/speech-to-text

A Node.js library and CLI tool for converting speech to text using sox for audio recording and Google's Gemini API for transcription.

## Prerequisites

- Node.js 18 or later
- `sox` command line utility installed on your system
  - macOS: `brew install sox`
  - Linux: `apt-get install sox`
  - Windows: Download from [Sox website](https://sourceforge.net/projects/sox/)
- Google API key with access to Gemini API

## Quick Start

The quickest way to use the tool is via `npx`:

```bash
npx @autocode2/speech-to-text --api-key YOUR_API_KEY
```

## Installation

### Global Installation

If you plan to use the tool frequently, you can install it globally:

```bash
npm install -g @autocode2/speech-to-text
```

Then use it directly:

```bash
speech-to-text --api-key YOUR_API_KEY
```

### Local Installation

For use in a project:

```bash
npm install @autocode2/speech-to-text
```

## CLI Usage

```bash
npx @autocode2/speech-to-text --api-key YOUR_API_KEY [options]
```

### Options

- `-k, --api-key`: Google API Key for Gemini (required)
- `-i, --input`: Input audio file to transcribe (if not provided, will record from microphone)
- `-o, --output`: Output file to save the recording (only applies when recording from microphone)
- `-r, --sample-rate`: Sample rate for recording in Hz (default: 16000)
- `-c, --channels`: Number of audio channels (default: 1)
- `-m, --model`: Gemini model to use (default: "gemini-1.5-flash")
- `-p, --prompt`: Custom prompt for transcription
- `-f, --format`: Output format (text|json, defaults to text in terminal, json in pipe)
- `-h, --help`: Show help
- `-v, --version`: Show version number

### Examples

```bash
# Record from microphone and transcribe (uses temporary file)
npx @autocode2/speech-to-text --api-key YOUR_API_KEY

# Record, save to file, and transcribe
npx @autocode2/speech-to-text --api-key YOUR_API_KEY -o recording.wav

# Transcribe existing file
npx @autocode2/speech-to-text --api-key YOUR_API_KEY -i existing.wav

# Record in high quality
npx @autocode2/speech-to-text --api-key YOUR_API_KEY -r 44100 -c 2 -o high-quality.wav

# Use custom transcription prompt
npx @autocode2/speech-to-text --api-key YOUR_API_KEY -p "Provide a detailed transcription with punctuation"

# Output in JSON format
npx @autocode2/speech-to-text --api-key YOUR_API_KEY --format json > output.json

# Pipe transcription to other tools
npx @autocode2/speech-to-text --api-key YOUR_API_KEY | jq .text
```

### JSON Output Format

When using JSON output (either explicitly with `--format json` or implicitly when piping), the output will be a JSON object with the following structure:

```json
{
  "text": "The transcribed text",
  "timestamp": "2024-01-20T12:34:56.789Z",
  "input": "input-file.wav", // If provided
  "output": "output-file.wav", // If provided
  "sampleRate": 16000, // If recording
  "channels": 1, // If recording
  "model": "gemini-1.5-flash" // If specified
}
```

## Library Usage

You can also use this as a library in your Node.js projects:

```typescript
import { SpeechToText } from "@autocode2/speech-to-text";

const stt = new SpeechToText({
  apiKey: "your-google-api-key",
  recording: {
    sampleRate: 16000,
    channels: 1,
  },
  transcription: {
    model: "gemini-1.5-flash",
    prompt: "Custom transcription prompt",
  },
});

// Record to temporary file (automatically cleaned up)
const text1 = await stt.recordAndTranscribe();

// Record and save to file
const text2 = await stt.recordAndTranscribe("output.wav");

// Transcribe existing file
const text3 = await stt.transcribe("existing.wav");
```

## License

ISC

## Author

Gareth Andrew
