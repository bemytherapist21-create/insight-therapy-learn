export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    // Only allow POST
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        // Get the request body
        const body = await req.json();

        // Get headers from original request
        const apikey = req.headers.get('apikey');
        const authorization = req.headers.get('authorization');

        // Forward to Supabase
        const response = await fetch(
            'https://sudlkozsotxdzvjpxubu.supabase.co/functions/v1/transcribe-audio',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apikey || '',
                    ...(authorization ? { 'Authorization': authorization } : {}),
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Proxy error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
