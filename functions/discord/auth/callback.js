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
    // const code = urlParams.get("code"); // not working locally
    const keys = Object.keys(urlParams);
    const firstKey = keys[0];
    const code = urlParams[firstKey];
    console.log(env.DISCORD_REDIRECT_URI)
    if (!code) {
    // Handle error or redirect to the login page
        return new Response("Unauthorized", { status: 401 });
    }
    const response = await fetch("https://discord.com/api/v10/oauth2/token", {
        method: "POST",
        headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: env.DISCORD_REDIRECT_URI,
        }),
    });

    if (response.ok) {
        const data = await response.json();
        let accessToken = data.access_token;

        const resp = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!resp.ok) {
            console.log(resp.user)
            const user = resp.user;
            return false;
        }

        // Store the access token and use it for subsequent requests
        const task = await context.env.MIAUSERS.put("test",JSON.stringify({'user':user,token:data.access_token}));
        // Handle error or redirect to the login page
        const destinationURL = `http://${request.headers.get("host")}/app/home?token=${accessToken}`;
        const statusCode = 302;
        return Response.redirect(destinationURL, statusCode);
    } else {
        // Handle error or redirect to the login page
        console.log(response);
        const destinationURL = `${request.headers.get("host")}/404`;
        const statusCode = 301;
        return Response.redirect(destinationURL, statusCode);

    }
    
    // const body = JSON.stringify({body:"Hello World"})
    // const headers = { 'Content-type': 'application/json' }
    // return new Response(body, { headers })
    // return new Response();
  }
