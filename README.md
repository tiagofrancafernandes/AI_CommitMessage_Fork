![header](https://capsule-render.vercel.app/api?type=venom&height=200&color=0:EEFF00,100:a82da8&fontColor=0:EEFF00,100:a82da8&text=ACM&desc=AI%20Commit%20Message&descAlignY=70)

# 🚀 AI Commit Message - Say Goodbye to Commit Message Struggles! 🤖✨

Welcome to the **AI Commit Message** extension for VS Code - your ultimate companion for crafting perfect commit messages effortlessly! 📝💡 Harness the power of artificial intelligence to generate compelling and informative commit messages that accurately describe your code changes. 🧠💬

## 🌟 Features

- 🎨 **Seamless Generation**: Generate commit messages with a single click on the 'Generate AI commit' button in the source control tab.

![Example of usage](assets/images/example.gif)

> 💡 Tip: You can also generate commits from the command palette by calling the 'Generate AI commit' command.

- ⚙️ **Customizable Settings**: Tailor the extension to your preferences with a range of configurable settings.
- 🎭 **Appearance**: Customize the delimiter between commit lines.
- 🌐 **General**: Choose your preferred generator (ChatGPT) and message approval method (Quick pick or Message file).
- 🔑 **OpenAI**: Configure your OpenAI API key, GPT version, custom endpoint, temperature, and max tokens.

## 📋 Requirements

To unleash the full potential of AI Commit Message, configure one provider credential: OpenAI, Perplexity, Ollama local, or Ollama cloud. For local Ollama, no external key is required (the extension uses the local endpoint). 🔑✨

## 🎨 Extension Settings

AI Commit Message offers a range of settings to customize your experience:

### Appearance 🎭

- `aicommitmessage.appearance.delimeter`: Delimiter between commit lines.

### General 🌐

- `aicommitmessage.general.generator`: Generator used to create commit messages. Available options: ChatGPT.
- `aicommitmessage.general.messageApproveMethod`: Method used to approve generated commit messages. Available options: Quick pick, Message file.

- `aicommitmessage.openAI.apiKey`: API key for the selected provider. For local Ollama this can stay as the default local value.
- `aicommitmessage.openAI.gptVersion`: Model name used by OpenAI, Perplexity, or Ollama.
- `aicommitmessage.openAI.customEndpoint`: Enter "openai", "perplexity", "ollama", "ollama-cloud", or a custom endpoint URL.
- `aicommitmessage.openAI.temperature`: Controls randomness. Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive
- `aicommitmessage.openAI.maxTokens`: The maximum number of tokens to generate. Requests can use up to 2048 tokens shared between prompt and completion
- `aicommitmessage.openAI.language`: The language of the prompt. The default language is English (en).


### Ollama Model Suggestions

When using Ollama, the extension offers the following ready-to-use model list:

- `codellama:7b`
- `qwen2.5:latest`
- `qwen2.5:7b`

You can also choose **Manual model** in the setup command to type another model name.

## 📝 Release Notes

### 1.0.5

- Added advanced configuration for ChatGPT.
- Introduced option to accept and edit generated commits via temp message file. (Thanks, [chenweiyi](https://github.com/chenweiyi)!)
- Added option to set custom ChatGPT endpoint URL. (Thanks, [aiyogg](https://github.com/aiyogg)!)
- Fixed issue with git on Windows (Issue [#5](https://github.com/dmytrobaida/GPTCommitVSCode/issues/5)).
- Added option to select different ChatGPT versions (Issue [#6](https://github.com/dmytrobaida/GPTCommitVSCode/issues/6)).
- Set default ChatGPT version to gpt-4.

### 1.0.4

- Updated commit formatting.
- Added new setting.

### 1.0.3

- Added OpenAI API Key input prompt.

### 1.0.2

- Fixed UX.

### 1.0.1

- Updated icons.

### 1.0.0

- Initial release of AI Commit Message.

## 📜 License

Released under [MIT](/LICENSE) by [@dmytrobaida](https://github.com/dmytrobaida).

---

Elevate your commit game to new heights with AI Commit Message! Let's make commit messages great again! 🚀🌟
