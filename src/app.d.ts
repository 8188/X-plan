// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				ADMIN_SECRET: string;
				SITE_URL: string;
			};
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

declare module '$env/static/private' {
	const ADMIN_SECRET: string;
}

declare module '$env/static/public' {
	const PUBLIC_SITE_NAME: string;
}

export {};
