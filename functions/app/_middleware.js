async function handleOAuthCheck(request) {
    // Check for the access token in the request
    let accessToken = request.headers.get("Authorization")?.split("Bearer ")[1];

    if (!accessToken) {
        //check search params
        const { searchParams } = new URL(request.url)
        accessToken = searchParams.get("token") || null;
        if(!accessToken)
            return false;
    }

    const response = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        console.log(response)
        return false;
    }

    return true;
}
export async function onRequest(context) {
    const {
        request, // same as existing Worker API
        env, // same as existing Worker API
        params, // if filename includes [id] or [[path]]
        waitUntil, // same as ctx.waitUntil in existing Worker API
        next, // used for middleware or to fetch assets
        data, // arbitrary space for passing data between middlewares
      } = context;
    //check for token in 
    try {
        if (await handleOAuthCheck(request)) {
            return await context.next();
        }
        console.log(request.headers.get("host"))
        // return new Response("Unauthorized", { status: 401 });
        const destinationURL = `http://${request.headers.get("host")}/`;
        const statusCode = 302;
        return Response.redirect(destinationURL, statusCode);
    } catch (err) {
      return new Response(`${err.message}\n${err.stack}`, { status: 500 });
    }
}