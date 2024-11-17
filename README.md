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
# Set your Google API key
export API_KEY=your_google_api_key_here

# Run the tool
npx @autocode2/speech-to-text
```

## Installation

### Global Installation

If you plan to use the tool frequently, you can install it globally:

```bash
npm install -g @autocode2/speech-to-text
```

Then use it directly:

```bash
speech-to-text
```

### Local Installation

For use in a project:

```bash
npm install @autocode2/speech-to-text
```

## CLI Usage

```bash
npx @autocode2/speech-to-text [options]
```

### Options

- `-i, --input`: Input audio file to transcribe (if not provided, will record from microphone)
- `-o, --output`: Output file to save the recording (only applies when recording from microphone)
- `-r, --sample-rate`: Sample rate for recording in Hz (default: 16000)
- `-c, --channels`: Number of audio channels (default: 1)
- `-m, --model`: Gemini model to use (default: "gemini-1.5-flash")
- `-p, --prompt`: Custom prompt for transcription
- `-h, --help`: Show help
- `-v, --version`: Show version number

### Examples

```bash
# Record from microphone and transcribe (uses temporary file)
npx @autocode2/speech-to-text

# Record, save to file, and transcribe
npx @autocode2/speech-to-text -o recording.wav

# Transcribe existing file
npx @autocode2/speech-to-text -i existing.wav

# Record in high quality
npx @autocode2/speech-to-text -r 44100 -c 2 -o high-quality.wav

# Use custom transcription prompt
npx @autocode2/speech-to-text -p "Provide a detailed transcription with punctuation"
```

## Library Usage

You can also use this as a library in your Node.js projects:

```typescript
import { SpeechToText } from '@autocode2/speech-to-text';

const stt = new SpeechToText({
    apiKey: 'your-google-api-key',
    recording: {
        sampleRate: 16000,
        channels: 1
    },
    transcription: {
        model: 'gemini-1.5-flash',
        prompt: 'Custom transcription prompt'
    }
});

// Record to temporary file (automatically cleaned up)
const text1 = await stt.recordAndTranscribe();

// Record and save to file
const text2 = await stt.recordAndTranscribe('output.wav');

// Transcribe existing file
const text3 = await stt.transcribe('existing.wav');
```

## Configuration

The tool can be configured using command line arguments or environment variables:

- `API_KEY`: Your Google API key (required)
  ```bash
  export API_KEY=your_google_api_key_here
  ```

## License

ISC

## Author

Gareth Andrew