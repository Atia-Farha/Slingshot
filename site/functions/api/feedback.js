// Non-POST methods return 405
export async function onRequest() {
    return new Response("Method not allowed", { status: 405 });
}
