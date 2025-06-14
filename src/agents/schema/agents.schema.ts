export const createAgentSchemaExample = {
  example: {
    summary: 'Example agent creation payload',
    value: {
      owner_wallet: '0x1234567890abcdef1234567890abcdef12345678',
      name: 'Agent DeFi',
      prompt: 'You are a crypto expert who explains complex DeFi concepts in simple terms',
      image_url: 'https://example.com/image.png',
      docs_url: 'https://example.com/docs',
      conversation_starters: [
        'Tell me about DeFi.',
        'What is blockchain?',
        'How do smart contracts work?'
      ],
      description:
        'A helpful DeFi agent for answering web3 questions.',
      domain: 'Web3, DeFi, Customer Support'
    },
  },
};