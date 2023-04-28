// Import the required libraries
const { InteractionResponseType, InteractionType, verifyKey } = require('discord-interactions');
const { createMessage } = require('discord-message-builder');

// Define the public key provided by Discord
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
// Cloudflare Pages function
async function handleRequest(request) {
    // Verify the request signature
    if (!verifyKey(request, PUBLIC_KEY)) {
      return new Response('Invalid request signature', { status: 401 });
    }
    // Parse the request body
    const interaction = await request.json();

    // Check if the interaction is a command
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        // Handle the command and build a response
        const response = createMessage()
        .setContent('Hello from Cloudflare Pages!')
        .toJSON();
  
      // Return the response
      return new Response(JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: response,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    // If the interaction is not a command, return a 400 Bad Request
    return new Response('Invalid interaction type', { status: 400 });
    }

// Add an event listener for incoming requests
export async function onRequest(context) {
    // Contents of context object
    const {
        request, // same as existing Worker API
        env, // same as existing Worker API
        params, // if filename includes [id] or [[path]]
        waitUntil, // same as ctx.waitUntil in existing Worker API
        next, // used for middleware or to fetch assets
        data, // arbitrary space for passing data between middlewares
    } = context;
    const url = params.path?.join('/') ?? ''
    const urlParams = Object.fromEntries(
        new URLSearchParams(request.url)
    )
    return handleRequest(request)
}
