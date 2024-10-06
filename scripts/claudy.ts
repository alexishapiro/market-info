import { AnthropicVertex } from '@anthropic-ai/vertex-sdk'

const projectId = 'inspired-goal-431506-b4'

const region = 'europe-west1'

// Goes through the standard `google-auth-library` flow.
const client = new AnthropicVertex({
  projectId,
  region,
  })
  console.log()
  
  async function main() {
    const result = await client.messages.create({
      model: 'claude-3-5-sonnet@20240620',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Hey Claude!',
        },
      ],
    })
    console.log(JSON.stringify(result, null, 2))
  }
  
  main()