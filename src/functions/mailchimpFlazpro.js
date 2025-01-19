const { app } = require('@azure/functions');

app.http('mailchimpFlazpro', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            if (body) {
                const response = await fetch(
                    `https://us8.api.mailchimp.com/3.0/lists/${process.env.MC_LIST_ID}/members`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${process.env.MC_API_KEY}`,
                        },
                        body: JSON.stringify(body),
                    }
                );
                const responseData = await response.json();
                if (!response.ok) {
                    context.log("Error:", "Failed to fetch data from API");
                    return {
                        status: response.status,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ error: "Failed to fetch data from API --- " + JSON.stringify(responseData) })
                    };
                } else {
                    return {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(responseData)
                    };
                }
            } else {
                context.log("Error:", "Please provide data in the request body");
                return {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ error: "Please provide data in the request body" })
                };
            }
        } catch (error) {
            context.log("Error:", error);
            return {
                status: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Internal server error --- " + JSON.stringify(error) })
            };
        }
    }
});
