export const agentChatSchemaExample = {
      example: {
        summary: 'Example of Agent Chat Request',
        description: 'This is an example of how to structure a request to chat with an agent.',
        value: {
          agent_id: '3df5f188-80bd-418e-b61e-799827027ae1',
          user_wallet: '0x07dA4915Da364bFBEf7Df743523047b4BA7085f0',
          chat_history: [
            { role: 'user', content: 'Hey, can you explain what is DxSale?' },
            { role: 'assistant', content: 'DxSale is a leading launchpad, token minting, and liquidity locking platform that simplifies the process of creating, launching, and securing tokens in the cryptocurrency decentralized finance (DeFi) sector. It is an advanced web3.0 platform designed to cater to the needs of users in the rapidly growing DeFi space.\n\nWith DxSale, users can create their own tokens through DxMint, raise funds via DxSale.\n\nWould you like to know more about how DxSale works or its features, such as DxMint and DxLock?' },
            { role: 'user', content: 'What is DxLock now?' },
            { role: 'assistant', content: 'DxLock is a unique feature on the DxSale platform that allows creators to control the pace and quantity of token sales, providing reassurance to investors of their commitment to the projects long-term success. It acts as a safeguard against fraud and misuse of funds by locking the liquidity pool tokens key within DxLock.\n\nIn simpler terms, DxLock is a decentralized app that enables users to lock their tokens or liquidity pool tokens, giving their community peace of mind and protecting their investments.\n\nIs there anything else you like to know about DxLock or how it works?' },
            { role: 'user', content: 'How to contact Dxsale Team?' }
          ]
        }
      }
    }