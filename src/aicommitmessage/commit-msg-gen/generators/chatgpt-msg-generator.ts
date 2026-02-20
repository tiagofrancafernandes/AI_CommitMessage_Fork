/*
 * This code includes portions of code from the opencommit project, which is
 * licensed under the MIT License. Copyright (c) Dima Sukharev.
 * The original code can be found at https://github.com/di-sukharev/opencommit/blob/master/src/generateCommitMessageFromGitDiff.ts.
 */
import OpenAI from "openai";

import { trimNewLines } from "@utils/text";
import { Configuration as AppConfiguration } from "@utils/configuration";

import { MsgGenerator } from "./msg-generator";
import { ChatCompletionMessageParam } from "openai/resources";
import { logToOutputChannel } from "@utils/output";

function createInitMessagesPrompt(language: string): ChatCompletionMessageParam[] {
  return [
    {
      role: 'system',
      content: `You are to act as the author of a commit message in git. Your task is to generate commit messages according to Conventional Commits 1.0.0 rules. I'll send you the outputs of the 'git diff' command, and you convert it into the one commit message. Do not prefix the commit with anything and use the present tense. You should never add a description to a commit, only commit message.`,
    },
    {
      role: 'user',
      content: `The Conventional Commits specification is a lightweight convention on top of commit messages.
      It provides an easy set of rules for creating an explicit commit history; 
      which makes it easier to write automated tools on top of. 
      This convention dovetails with SemVer, 
      by describing the features, fixes, and breaking changes made in commit messages.
      The commit message must consist of multiple files as one message, as follows.
      <type>[optional scope]: <description>
      [optional body]`,
    },
    {
      role: 'assistant',
      content: `feat: allow provided config object to extend other configs
      BREAKING CHANGE: 'extends' key in config file is now used for extending other config files`,
    },
  ];
};

function generateCommitMessageChatCompletionPrompt(
  diff: string,
  language: string
): ChatCompletionMessageParam[] {
  const chatContextAsCompletionRequest = createInitMessagesPrompt(language);

  chatContextAsCompletionRequest.push({
    role: 'user',
    content: diff,
  });

  if (language !== 'English') {
    chatContextAsCompletionRequest.push({
      role: 'assistant',
      content: `Please request the language you would like to use when responding.`,
    });
    chatContextAsCompletionRequest.push({
      role: 'user',
      content: `Translate to ${language}.`
    });
  }

  return chatContextAsCompletionRequest;
}

const defaultModel = "gpt-4o";
const defaultTemperature = 0.8;
const defaultMaxTokens = 196;

export class ChatgptMsgGenerator implements MsgGenerator {
  openAI: OpenAI;
  config?: AppConfiguration["openAI"];

  constructor(config: AppConfiguration["openAI"]) {
    let baseURL: string | undefined;
    let apiKey = config.apiKey;

    if (config.customEndpoint) {
      const endpoint = config.customEndpoint.toLowerCase().trim();

      if (endpoint === "perplexity") {
        baseURL = "https://api.perplexity.ai";
      }

      if (endpoint === "ollama") {
        baseURL = "http://localhost:11434/v1";

        if (!apiKey || apiKey.trim().length === 0) {
          apiKey = "ollama";
        }
      }

      if (endpoint === "ollama-cloud") {
        baseURL = "https://api.ollama.com/v1";
      }

      if (endpoint.startsWith("http")) {
        baseURL = endpoint;
      }
    }

    this.openAI = new OpenAI({
      baseURL: baseURL,
      apiKey: apiKey
    });

    this.config = config;
  }

  async generate(diff: string, delimeter?: string) {
    const language = this.config?.language || "English";
    const messages = generateCommitMessageChatCompletionPrompt(diff, language);
    const data = await this.openAI.chat.completions.create({
      model: this.config?.gptVersion || defaultModel,
      messages: messages,
      temperature: this.config?.temperature || defaultTemperature,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_tokens: this.config?.maxTokens || defaultMaxTokens,
    });

    const message = data?.choices[0].message;
    const commitMessage = message?.content;

    logToOutputChannel("[customEndpoint] ", this.config?.customEndpoint);
    logToOutputChannel("[model]", this.config?.gptVersion);
    logToOutputChannel("[lang]", this.config?.language);
    logToOutputChannel("[Data_completion_tokens]", data.usage?.completion_tokens.toFixed(0));
    logToOutputChannel("[Data_prompt_tokens]", data.usage?.prompt_tokens.toFixed(0));
    logToOutputChannel("[Data_total_tokens]", data.usage?.total_tokens.toFixed(0));

    if (!commitMessage) {
      throw new Error("No commit message were generated. Try again.");
    }

    const alignedCommitMessage = trimNewLines(commitMessage, delimeter);
    return alignedCommitMessage;
  }
}
