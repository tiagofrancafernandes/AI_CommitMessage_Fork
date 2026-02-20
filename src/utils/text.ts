// located at : src/utils/text.ts
import { getConfiguration } from "./configuration";
import { logToOutputChannel } from "./output";

export function trimNewLines(str: string, delimeter?: string) {
  const stringParts = str.split("\n");

  if (stringParts.length === 0) {
    return str;
  }

  let formattedStrings = stringParts.map((part) => part.trimStart());

  if (delimeter) {
    console.log("delimeter", delimeter);
    formattedStrings = formattedStrings.map((strPart) => `${delimeter} ${strPart}`);
  }

  return formattedStrings.join("\n");
}

export function isValidApiKey() {
  const configuration = getConfiguration();
  const apiKey = configuration.openAI.apiKey ?? "";
  const customEndpoint = configuration.openAI.customEndpoint?.toLowerCase().trim() ?? "openai";

  if (customEndpoint === "ollama") {
    return true;
  }

  if (apiKey.trim().length === 0) {
    logToOutputChannel("Invalid API key", apiKey);
    return false;
  }

  if (customEndpoint === "perplexity") {
    return apiKey.startsWith("pplx-");
  }

  if (customEndpoint === "ollama-cloud") {
    return apiKey.startsWith("ollama_");
  }

  if (customEndpoint.startsWith("http")) {
    return true;
  }

  return apiKey.startsWith("sk-");
}
