import { createAuthClient } from "better-auth/vue";
import { adminClient } from "better-auth/client/plugins";

// base URL from env
const baseURL = process.env.BETTER_AUTH_URL;

export const authClient = createAuthClient({
    plugins: [adminClient()],
    baseURL
})