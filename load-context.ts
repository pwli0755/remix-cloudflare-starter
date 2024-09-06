import { drizzle } from 'drizzle-orm/d1';
import type { PlatformProxy } from 'wrangler';
import schema, { type DB } from './app/db.server/schema';

// You can generate the ENV type based on `wrangler.toml` and `.dev.vars`
// by running `npm run typegen`
type Cloudflare = Omit<PlatformProxy<Env>, 'dispose'>;
type LoadContext = {
	cloudflare: Cloudflare;
};

type EnvWithDrizzle = Omit<Env, 'DB'> & {
	DB: DB;
};

declare module '@remix-run/cloudflare' {
	interface AppLoadContext {
		env: EnvWithDrizzle;
		cf: Cloudflare['cf'];
		ctx: Cloudflare['ctx'];
		cache: Cloudflare['caches'];
	}
}

export function getLoadContext({
	context,
}: {
	request: Request;
	context: LoadContext;
}) {
	return {
		env: {
			...context.cloudflare.env,
			DB: drizzle(context.cloudflare.env.DB, { schema }),
		},
		cf: context.cloudflare.cf,
		ctx: context.cloudflare.ctx,
		cache: context.cloudflare.caches,
	};
}
