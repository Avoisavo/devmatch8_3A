# Llama Integration with Three AI Personalities

This integration allows you to chat with local Llama models using Ollama in your Scaffold-ETH 2 application, featuring three distinct AI personalities that respond sequentially to create dynamic conversations.

## 🚀 Quick Start

### 1. Install Ollama
```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Start Ollama
```bash
ollama serve
```

### 3. Pull a Model
```bash
# Pull the Gemma 3B model (recommended for testing)
ollama pull gemma3:4b

# Or pull other models
ollama pull llama3.2:3b
ollama pull mistral:7b
```

### 4. Start Your App
```bash
# From the root directory
yarn start
```

### 5. Test the Integration
1. Open your browser: http://localhost:3000/
2. Type a message in the chatbox
3. Watch as all three AI personalities respond in sequence!

## 📁 File Structure

```
packages/nextjs/
├── components/llama/
│   ├── ChatBox.tsx          # Main chat interface
│   ├── MessageInput.tsx     # Input component
│   ├── MessageList.tsx      # Message display
│   ├── ResultPanel.tsx      # Results panel
│   └── index.ts            # Exports
├── hooks/llama/
│   ├── useChat.ts          # Chat state management
│   ├── useOllama.ts        # Ollama API interactions
│   └── index.ts            # Exports
├── types/
│   └── llama.ts            # TypeScript interfaces
├── utils/
│   ├── llama.ts            # Ollama utilities
│   └── aiPersonalities.ts  # AI personality configurations
└── app/page.tsx            # Main page with chat interface
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in `packages/nextjs/`:
```env
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434
```

### Model Configuration
Edit `packages/nextjs/utils/llama.ts` to change the default model:
```typescript
export const DEFAULT_MODEL = 'your-model-name';
```

## 🎭 AI Personalities

### 1. **The Helper** (First Speaker)
- **Personality**: Friendly, helpful, gives immediate responses
- **Behavior**: Responds first to user messages
- **Delay**: 0 seconds

### 2. **The Thinker** (Second Speaker)
- **Personality**: Analytical, thoughtful, adds insights
- **Behavior**: Waits 2 seconds, then adds to the conversation
- **Delay**: 2 seconds

### 3. **The Curious One** (Third Speaker)
- **Personality**: Always curious, asks follow-up questions
- **Behavior**: Always asks a relevant question at the end
- **Delay**: 4 seconds

## 🎯 Features

- **Three AI Personalities**: Sequential responses from different AI characters
- **Real-time streaming**: Responses appear as they're generated
- **Error handling**: Clear error messages for connection issues
- **Message history**: View all conversation messages
- **Personality badges**: Visual indicators for each AI personality
- **Responsive design**: Works on desktop and mobile
- **TypeScript support**: Full type safety

## 🐛 Troubleshooting

### Ollama not running
If you see "Ollama is not running" error:
1. Make sure Ollama is installed: `ollama --version`
2. Start Ollama: `ollama serve`
3. Check if it's running: `curl http://localhost:11434/api/tags`

### Model not found
If you get a model error:
1. List available models: `ollama list`
2. Pull the model: `ollama pull gemma3:4b`
3. Check model status: `ollama show gemma3:4b`

### Connection issues
- Ensure Ollama is running on port 11434
- Check firewall settings
- Try restarting Ollama: `ollama serve`

## 🔄 Customization

### Adding New Models
1. Pull a new model: `ollama pull model-name`
2. Update the model in the chat interface
3. Test with different models

### Styling
The components use DaisyUI classes and can be customized in:
- `packages/nextjs/styles/globals.css`
- Individual component files

### API Configuration
Modify `packages/nextjs/utils/llama.ts` to:
- Change API endpoints
- Adjust model parameters (temperature, top_p, etc.)
- Add authentication if needed

## 📝 Usage Examples

### Basic Chat
```typescript
import { useChat, useOllama } from '../hooks/llama';

const { messages, addMessage } = useChat();
const { sendMessage } = useOllama();

// Send a message
await sendMessage([
  { role: 'user', content: 'Hello, how are you?' }
], 'gemma3:4b');
```

### Streaming Response
```typescript
let response = '';
await sendMessage(messages, 'gemma3:4b', (chunk) => {
  response += chunk;
  // Update UI with streaming response
});
```

## 🚀 Next Steps

- Add conversation persistence
- Implement model switching UI
- Add conversation export/import
- Integrate with blockchain data
- Add voice input/output
- Implement conversation templates 