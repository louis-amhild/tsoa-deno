import { Route, Body, Post, Get, Controller } from "@tsoa_runtime";

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
    /**
     * A simple TSOA test route getting an embedding
     */
    // @Post('embeddings')
    // // @Security("user_auth", ["Admin", "SuperAdmin"])
    // public async getEmbeddings(@Body() body: EmbeddingRequest): Promise<EmbeddingResponse> {
    //     console.log("Got input ", body.input);
    //     const embedding: number[] = await getEmbeddings(body.input);
    //     console.log("Hello from hello robot embedding controller")
    //     return { embedding };
    // }

     /**
     * A event more 
     */
     @Post('test')
     // @Security("user_auth", ["Admin", "SuperAdmin"])
     public async test(@Body() body: EmbeddingRequest): Promise<EmbeddingResponse> {
        const embedding = [1, 2, 3, 4, 5, 10]; 
        return { embedding };
     }

     @Get('test')
     // @Security("user_auth", ["Admin", "SuperAdmin"])
     public async testGet(): Promise<EmbeddingResponse> {
        const embedding = [9, 9, 9];
        return { embedding };
     }

     @Post('tesx2')
     // @Security("user_auth", ["Admin", "SuperAdmin"])
     public async tesx2(@Body() body: { input2: string }): Promise<EmbeddingResponse> {
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
