import { Route, Body, Post, Get, Controller } from "@tsoa/runtime";

interface EmbeddingRequest {
    input?: string
}

interface EmbeddingResponse {
    embedding: number[]
}

/**
 * Get info about the CDN cache of StoryHunt domains and refresh cache
 */
@Route('/example')
export class TsoaController extends Controller {
    @Get('')
    public async rootGet(): Promise<{ message: string }> {
        return { message: "Hello from TSOA Deno Demo Controller" };
    }

    @Get('test')
    public async testGet(): Promise<EmbeddingResponse> {
        const embedding = [9, 9, 9];
        return { embedding };
    }

    @Post('test')
    public async test(@Body() body: EmbeddingRequest): Promise<EmbeddingResponse> {
        const embedding = [1, 2, 3, 4, 5, 10];
        console.log("Input body ", body);
        return { embedding };
    }

    @Post('test2')
    public test2(): EmbeddingResponse {
        const embedding = [3, 4, 5, 6, 2];
        return { embedding };
    }
}

// To invoke (Supabase):
/** curl -i --location --request POST 'http://localhost:54321/functions/v1/example/test' \
     --header 'Authorization: Bearer xxxxxxxxxxxxxxxxxx' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'
**/
