import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

const MODEL_PRIMARY = 'meta-llama/llama-3.3-8b-instruct:free';

@Injectable()
export class OpenRouterService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY
        });
    }

    async chatWithSLM(messages) {
        try {
            const response = await this.openai.chat.completions.create({
                model: MODEL_PRIMARY,
                messages,
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Error in chatWithSLM:', error);
            throw new Error('Failed to communicate with the agent');
        }
    }
}
