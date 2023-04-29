const aikey = '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'
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
    
    // console.log(url)
    env.WITKEY="TQPZXBZIFL4P3S4MIOXCMAZU3SL3IWAJ"
    env.AIKEY="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"
    console.log(reqdata)
    return handleComposerRequest(reqdata.input.currentMessage,env.WITKEY,env.AIKEY);
    
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

  async function handleComposerRequest(msg,witkey,aikey) {
  
    // Only use the path for the cache key, removing query strings
    // and always store using HTTPS e.g. https://www.example.com/file-uri-here
    //"https://api.wit.ai/message?v=20221109&q=hello%21"
    //-H "Authorization: Bearer 6ZESTCIQZS4WGTZITBYN6KOFY5RGSJTK" ^
    const someCustomKey = `https://api.wit.ai/event?v=20230215&session_id=t6v&context_map=%7B%7D`
    
    try{
      console.log(msg)
      let response = await fetch(someCustomKey, {
        headers: {
          // Always cache this fetch regardless of content type
          // for a max of 5 seconds before revalidating the resource
          'Authorization': `Bearer ${witkey}`,
        },
        method:"POST",
        body: JSON.stringify({
          "type":"message",
          "message": msg
        })
      })
      let witty = await JSON.parse(await response.text());
      // Reconstruct the Response object to make its headers mutable.
      
      
        //send to gpt
        let gpt = await handleAIRequest(msg,aikey)
        // witty.response.text = gpt;
        console.log(gpt)
      response = new Response(JSON.stringify({response:gpt}), {'content-type': 'application/json;charset=UTF-8'})
      return response
    } catch(err){
      console.log(err)
    }
    // return false;
    // Set cache control headers to cache on browser for 25 minutes
  }

  async function handleAIRequest(msg,key) {
  
    // Only use the path for the cache key, removing query strings
    // and always store using HTTPS e.g. https://www.example.com/file-uri-here
    //"https://api.wit.ai/message?v=20221109&q=hello%21"
    //-H "Authorization: Bearer 6ZESTCIQZS4WGTZITBYN6KOFY5RGSJTK" ^
    const someCustomKey = "https://api.openai.com/v1/chat/completions"
    const messages = [
      {role: 'system', 'content': 'You are to give a response in the voice of a young early 20s young woman from miami. Your name is Mia, and you respond to that name. You do not need to describe yourself. your responses are witty, and brief. Respond with a message about how you are busy training to give better responses to eco and climate related questions only. You will be ready to answer questions properly tomorrow'},
      {role: 'user', content:msg}
    ]
    let completion = {
      model: "gpt-4",
      messages: messages,
      temperature: 0.9,
      max_tokens: 400,
      top_p:1,
      frequency_penalty:0,
      presence_penalty:0.6,
      stop:[" Human:", " AI:"]
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