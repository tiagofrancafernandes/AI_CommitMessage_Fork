// located at : src/commands/set-openai-api-key.ts
import * as vscode from "vscode";

import { setConfigurationValue } from "@utils/configuration";
import { trimNewLines } from "@utils/text";
import { logToOutputChannel } from "@utils/output";

type EndpointType = "openai" | "perplexity" | "ollama" | "ollama-cloud" | "http-url";

function getModelOptionsByEndpoint(endpoint: EndpointType): string[] {
  if (endpoint === "perplexity") {
    return [
      "llama-3-sonar-small-32k-chat",
      "llama-3-sonar-small-32k-online",
      "llama-3-sonar-large-32k-chat",
      "llama-3-sonar-large-32k-online",
      "llama-3-8b-instruct",
      "llama-3-70b-instruct",
      "mixtral-8x7b-instruct"
    ];
  }

  if (endpoint === "ollama" || endpoint === "ollama-cloud") {
    return [
      "codellama:7b",
      "qwen2.5:latest",
      "qwen2.5:7b",
      "Manual model"
    ];
  }

  return [
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "gpt-4o",
    "gpt-4o-2024-11-20",
    "gpt-4o-2024-08-06",
    "gpt-4o-2024-05-13",
    "gpt-4o-mini",
    "gpt-4o-mini-2024-07-18",
    "o3-mini"
  ];
}

async function askForManualModel() {
  const manualModel = await vscode.window.showInputBox({
    prompt: "Enter the model name manually (for example: qwen2.5:14b).",
    ignoreFocusOut: true,
    placeHolder: "model:tag"
  });

  if (manualModel === undefined) {
    logToOutputChannel("User cancelled model manual input.");
    vscode.window.showInformationMessage("Operation cancelled.");
    return undefined;
  }

  if (!manualModel || trimNewLines(manualModel).length === 0) {
    vscode.window.showErrorMessage("Model name is required.");
    return undefined;
  }

  return manualModel;
}

function getExpectedApiKeyPrefix(endpoint: EndpointType) {
  if (endpoint === "perplexity") {
    return "pplx-";
  }

  if (endpoint === "openai") {
    return "sk-";
  }

  if (endpoint === "ollama-cloud") {
    return "ollama_";
  }

  return "";
}

async function askForApiKey(endpoint: EndpointType) {
  if (endpoint === "ollama") {
    return "ollama";
  }

  const expectedPrefix = getExpectedApiKeyPrefix(endpoint);
  const shouldValidatePrefix = expectedPrefix.length > 0;

  while (true) {
    const apiKey = await vscode.window.showInputBox({
      prompt: shouldValidatePrefix
        ? `Enter the API key for endpoint '${endpoint}'. It should start with '${expectedPrefix}'.`
        : `Enter the API key for endpoint '${endpoint}'.`,
      ignoreFocusOut: true,
      placeHolder: shouldValidatePrefix ? `Starts with '${expectedPrefix}'` : "API key"
    });

    if (apiKey === undefined) {
      logToOutputChannel("User cancelled the operation.");
      vscode.window.showInformationMessage("Operation cancelled.");
      return undefined;
    }

    if (!apiKey || trimNewLines(apiKey).length === 0) {
      vscode.window.showErrorMessage("API key is required.");
      continue;
    }

    if (!shouldValidatePrefix) {
      return apiKey;
    }

    if (apiKey.startsWith(expectedPrefix)) {
      return apiKey;
    }

    vscode.window.showErrorMessage(`API key must start with '${expectedPrefix}'.`);
  }
}

export async function setOpenaiApiKey() {
  logToOutputChannel("Starting setOpenaiApiKey command");

  let endpointSelection: string | undefined;
  const endpoints = [
    "openai",
    "perplexity",
    "ollama",
    "ollama-cloud",
    "HTTP URL"
  ];

  while (true) {
    endpointSelection = await vscode.window.showQuickPick(endpoints, {
      placeHolder: "Select the endpoint for AI.",
      ignoreFocusOut: true
    });

    if (endpointSelection === undefined) {
      logToOutputChannel("User cancelled the operation.");
      vscode.window.showInformationMessage("Operation cancelled.");
      return;
    }

    if (trimNewLines(endpointSelection).length > 0) {
      break;
    }
  }

  let customEndpoint = endpointSelection;
  let endpointType: EndpointType = "http-url";

  if (endpointSelection === "HTTP URL") {
    const endpointInput = await vscode.window.showInputBox({
      prompt: "Enter your custom HTTP URL endpoint (OpenAI-compatible).",
      ignoreFocusOut: true,
      placeHolder: "http://your-custom-api.com/v1"
    });

    if (endpointInput === undefined) {
      logToOutputChannel("User cancelled the operation.");
      vscode.window.showInformationMessage("Operation cancelled.");
      return;
    }

    if (!endpointInput.startsWith("http")) {
      vscode.window.showErrorMessage("Valid HTTP URL is required.");
      return;
    }

    customEndpoint = endpointInput;
  } else {
    endpointType = endpointSelection;
  }

  const modelOptions = getModelOptionsByEndpoint(endpointType);
  let selectedModel = await vscode.window.showQuickPick(modelOptions, {
    placeHolder: "Select the model version.",
    ignoreFocusOut: true
  });

  if (selectedModel === undefined) {
    logToOutputChannel("User cancelled the operation.");
    vscode.window.showInformationMessage("Operation cancelled.");
    return;
  }

  if (selectedModel === "Manual model") {
    const manualModel = await askForManualModel();

    if (!manualModel) {
      return;
    }

    selectedModel = manualModel;
  }

  const apiKey = await askForApiKey(endpointType);

  if (!apiKey) {
    return;
  }

  const languageOptions = [
    "English",
    "Korean",
    "Japanese",
    "Chinese",
    "Spanish",
    "Arabic",
    "Portuguese",
    "Russian",
    "French",
    "German",
    "Italian"
  ];

  const language = await vscode.window.showQuickPick(languageOptions, {
    placeHolder: "English, Korean, Japanese, etc.",
    ignoreFocusOut: true
  });

  if (!language) {
    logToOutputChannel("User cancelled the operation.");
    vscode.window.showInformationMessage("Operation cancelled.");
    return;
  }

  await setConfigurationValue("openAI.customEndpoint", customEndpoint);
  await setConfigurationValue("openAI.gptVersion", selectedModel);
  await setConfigurationValue("openAI.apiKey", apiKey);
  await setConfigurationValue("openAI.language", language);

  logToOutputChannel("OpenAI/Ollama configuration updated successfully.");
  vscode.window.showInformationMessage("AI provider configuration saved successfully.");
}
