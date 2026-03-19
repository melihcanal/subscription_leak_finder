const DEFAULT_HEADERS = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

export function corsHeaders(origin?: string): Record<string, string> {
    return {
        "Access-Control-Allow-Origin": origin ?? "*",
        ...DEFAULT_HEADERS
    };
}

export function json(data: unknown, status = 200, origin?: string): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin)
        }
    });
}

export function errorResponse(message: string, status = 400, details?: string, origin?: string): Response {
    return json({error: message, details}, status, origin);
}

export function optionsResponse(origin?: string): Response {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
    });
}
