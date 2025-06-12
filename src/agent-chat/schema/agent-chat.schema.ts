export const agentChatSchemaExample = {
      example: {
        summary: 'Example of Agent Chat Request',
        description: 'This is an example of how to structure a request to chat with an agent.',
        value: {
          agent_id: 'c32543c6-ab0d-4599-a1a4-e8e08f2fb6db',
          user_wallet: '0x1234567890abcdef1234567890abcdef12345678',
          agent_prompt: 'You are a crypto expert who explains complex DeFi concepts in simple terms',
          chat_history: [
            { role: 'user', content: 'Hey, can you explain yield farming to me?' },
            { role: 'assistant', content: 'Sure! Yield farming is like lending your crypto to earn interest or rewards, often in other tokens.' },
            { role: 'user', content: 'What kind of risks are involved?' },
            { role: 'assistant', content: 'In yield farming, there are a few key risks to watch out for. One big one is liquidity risk - if the market suddenly dries up, you might not be able to sell your tokens for what you think they' },
            { role: 'user', content: 'Wow, Thanks' }
          ]
        }
      }
    }
