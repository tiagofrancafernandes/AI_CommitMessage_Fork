// located at : src/utils/configuration.ts
import * as vscode from "vscode";
import { z } from "zod";

import { DeepKey } from "./types";

const gptVersionsOpenAI = z.enum([
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
]);

const gptVersionsPerplexity = z.enum([
  "llama-3-sonar-small-32k-chat",
  "llama-3-sonar-small-32k-online",
  "llama-3-sonar-large-32k-chat",
  "llama-3-sonar-large-32k-online",
  "llama-3-8b-instruct",
  "llama-3-70b-instruct",
  "mixtral-8x7b-instruct"
]);

const ollamaVersions = z.enum([
  "codellama:7b",
  "qwen2.5:latest",
  "qwen2.5:7b"
]);

function isValidModelByEndpoint(version: string, endpoint: string) {
  if (endpoint === "perplexity") {
    return gptVersionsPerplexity.safeParse(version).success;
  }

  if (endpoint === "ollama" || endpoint === "ollama-cloud") {
    if (ollamaVersions.safeParse(version).success) {
      return true;
    }

    return version.trim().length > 0;
  }

  if (endpoint.startsWith("http")) {
    return version.trim().length > 0;
  }

  return gptVersionsOpenAI.safeParse(version).success;
}

const configurationSchema = z.object({
  appearance: z.object({
    delimeter: z.string().optional(),
  }),
  general: z.object({
    generator: z
      .enum(["ChatGPT"])
      .default("ChatGPT")
      .catch("ChatGPT")
      .optional(),
    messageApproveMethod: z
      .enum(["Quick pick", "Message file"])
      .default("Quick pick")
      .catch("Quick pick")
      .optional(),
  }),
  openAI: z.object({
    apiKey: z.string().optional(),
    customEndpoint: z.union([
      z.literal("openai"),
      z.literal("perplexity"),
      z.literal("ollama"),
      z.literal("ollama-cloud"),
      z.string().regex(/^http/)
    ])
      .default("openai")
      .catch("openai")
      .optional(),
    gptVersion: z.string()
      .refine((version: string) => {
        const customEndpoint: string | undefined = vscode.workspace
          .getConfiguration("aicommitmessage")
          .get("openAI.customEndpoint");
        const normalizedEndpoint = customEndpoint?.toLowerCase().trim() ?? "openai";

        return isValidModelByEndpoint(version, normalizedEndpoint);
      }, {
        message: "Invalid model version for the specified endpoint"
      })
      .default("gpt-4.1")
      .catch("gpt-4.1"),
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    language: z.enum([
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
    ])
      .default("English")
      .catch("English")
      .optional(),
  }),
});

export type Configuration = z.infer<typeof configurationSchema>;

export async function setConfigurationValue(
  key: DeepKey<Configuration>,
  value: any
) {
  const configuration = vscode.workspace.getConfiguration("aicommitmessage");
  await configuration.update(key, value, vscode.ConfigurationTarget.Global);
}

export function getConfiguration() {
  const configuration = vscode.workspace.getConfiguration("aicommitmessage");
  return configurationSchema.parse(configuration);
}
