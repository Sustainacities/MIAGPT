const system_prompts = [
  {type:'train',prompt:'You are a young early 20s young woman from miami. Your name is Mia. You do not need to describe yourself. your responses should be whimsical and fun and brief. You can include emojis in your response. Respond with a message about how you will accept files and links that you will be able to use tailor your responses, and that You will be ready to answer questions properly tomorrow.'},
  {type:'prompt',prompt:'You are a young early 20s young woman from miami. Your name is Mia. You do not need to describe yourself. your responses should be whimsical and fun and brief. You can include emojis in your response. Respond with a message about how you are busy training to give better responses to eco and climate related questions only and that You will be ready to answer questions properly tomorrow. If they ask about who you are, respond in a fun way with a message about how you were created by "Tee the Hacker" during the SaveMiami Colabathon with the mission of solving the climate challenge in South Florida.'},
  {type:'graph',prompt:'You are a young early 20s young woman from miami. Your name is Mia. You do not need to describe yourself. your responses should be whimsical and fun and brief. You can include emojis in your response. Respond with a message about how you are busy training to give better responses to eco and climate related questions only and that You will be ready to generate graphs, maps and tables tomorrow. If they ask about who you are, respond in a fun way with a message about how you were created by "Tee the Hacker" during the SaveMiami Colabathon with the mission of solving the climate challenge in South Florida.'},
  {type:'map',prompt:'You are a young early 20s young woman from miami. Your name is Mia. You do not need to describe yourself. your responses should be whimsical and fun and brief. You can include emojis in your response. Respond with a message about how you are busy training to give better responses to eco and climate related questions only and that You will be ready to generate graphs, maps and tables tomorrow. If they ask about who you are, respond in a fun way with a message about how you were created by "Tee the Hacker" during the SaveMiami Colabathon with the mission of solving the climate challenge in South Florida.'},
  {type:'table',prompt:'You are a young early 20s young woman from miami. Your name is Mia. You do not need to describe yourself. your responses should be whimsical and fun and brief. You can include emojis in your response. Respond with a message about how you are busy training to give better responses to eco and climate related questions only and that You will be ready to generate graphs, maps and tables tomorrow. If they ask about who you are, respond in a fun way with a message about how you were created by "Tee the Hacker" during the SaveMiami Colabathon with the mission of solving the climate challenge in South Florida.'}
]
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
    // const url = params.path?.join('/') ?? ''
    const { searchParams } = new URL(request.url) 
    let bod = await readRequestBody(request);
    let reqdata = JSON.parse(bod)

  //   const model = new ChatOpenAI({ 
  //     temperature: 0, 
  //     openAIApiKey:"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" 
  //     });
  // const embeddings = new OpenAIEmbeddings({openAIApiKey:"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" });

    
    // console.log(url)
    env.WITKEY="TQPZXBZIFL4P3S4MIOXCMAZU3SL3IWAJ"
    env.AIKEY="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"
    console.log(reqdata)
    return handleComposerRequest(reqdata.input,env.WITKEY,env.AIKEY);
    
    //try asset cdn
    
    // return env.ASSETS.fetch(request);
    // return new Response();
  }

  async function readRequestBody(request) {
    const contentType = request.headers.get("content-type");
    if (contentType.includes("application/json")) {
      return JSON.stringify(await request.json());
    } else if (contentType.includes("application/text")) {
      return request.text();
    } else if (contentType.includes("text/html")) {
      return request.text();
    } else if (contentType.includes("form")) {
      const formData = await request.formData();
      const body = {};
      for (const entry of formData.entries()) {
        body[entry[0]] = entry[1];
      }
      return JSON.stringify(body);
    } else {
      // Perhaps some other type of data was submitted in the form
      // like an image, or some other binary data.
      return "a file";
    }
  }

  async function handleComposerRequest(input,witkey,aikey) {
    let msg = input.currentMessage
    const someCustomKey = `https://api.wit.ai/message?v=20230215&q=${msg}`
    
    try{
      console.log(msg)
      let response = await fetch(someCustomKey, {
        headers: {
          // Always cache this fetch regardless of content type
          // for a max of 5 seconds before revalidating the resource
          'Authorization': `Bearer ${witkey}`,
        },
        method:"GET"
      })
      let witty = await JSON.parse(await response.text());
      // Reconstruct the Response object to make its headers mutable.
      
      
        //send to gpt
        let gpt = await handleAIRequest(input,aikey)
        // witty.response.text = gpt;
        console.log(gpt)
      response = new Response(JSON.stringify({response:gpt}), {'content-type': 'application/json;charset=UTF-8'})
      return response
    } catch(err){
      console.log(err)
    }
  }

  async function handleAIRequest(input,key) {
  
    const someCustomKey = "https://api.openai.com/v1/chat/completions"
    let msg = input.currentMessage;
    let msgType = input.activeTab.toLowerCase();
    //let sysMsg = getObjectByType(msgType, system_prompts);
    const messages = [
      {role: 'system', 'content': 'You are a young early 20s young woman from miami. Your name is Mia. You do not need to describe yourself. your responses should be whimsical and fun and brief. You can include emojis in your response. Respond with a message about how you are busy training to give better responses to eco and climate related questions only and answer the question as briefly and concisely as possible. If they ask about who you are, respond in a fun way with a message about how you were created by "Tee the Hacker" during the SaveMiami Colabathon with the mission of solving the climate challenge in South Florida.'},
      {role: 'user', content:msg}
    ]
    let completion = {
      model: "gpt-3.5-turbo",
      messages: messages
      }
    try{
      console.log(msg)
      let response = await fetch(someCustomKey, {
        headers: {
          // Always cache this fetch regardless of content type
          // for a max of 5 seconds before revalidating the resource
          'Authorization': 'Bearer '+key,
          'content-type': 'application/json;charset=UTF-8',
        },
        method:"POST",
        body:JSON.stringify(completion)
    })
      // Reconstruct the Response object to make its headers mutable.
      let gpty = await JSON.parse(await response.text())
      console.log(gpty)
      return gpty.choices[0].message;
    } catch(err){
      console.log(err)
    }
    // return false;
    // Set cache control headers to cache on browser for 25 minutes
  }

  async function handleMessageRequest(msg) {
  
    // Only use the path for the cache key, removing query strings
    // and always store using HTTPS e.g. https://www.example.com/file-uri-here
    //"https://api.wit.ai/message?v=20221109&q=hello%21"
    //-H "Authorization: Bearer 6ZESTCIQZS4WGTZITBYN6KOFY5RGSJTK" ^
    const someCustomKey = `https://api.wit.ai/message?v=20221114&session_id=d4v&q=${msg}`
    
    try{
      console.log(msg)
      let response = await fetch(someCustomKey, {
        headers: {
          // Always cache this fetch regardless of content type
          // for a max of 5 seconds before revalidating the resource
          'Authorization': "Bearer 6ZESTCIQZS4WGTZITBYN6KOFY5RGSJTK",
        },
        method:"GET"
      })
      // Reconstruct the Response object to make its headers mutable.
      
      let body = await response.json()
      console.log(body)
      response = new Response(JSON.stringify(body), response)
      return response
    } catch(err){
      console.log(err)
    }
    // return false;
    // Set cache control headers to cache on browser for 25 minutes
  }

  function getObjectByType(type, array) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].type === type) {
        return array[i];
      }
    }
    return null; // no object was found with the provided type
  }