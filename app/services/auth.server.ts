import type { AppLoadContext } from '@remix-run/cloudflare';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { getWorkersKVSessionStorage } from './session.server';

type User = {
	id: string;
	name: string;
};

function login(username: string, password: string): Promise<User> {
	return Promise.resolve({
		id: '2',
		name: 'Mike',
	});
}

export function getAuthenticator(context: AppLoadContext) {
	const authenticator = new Authenticator<User>(
		getWorkersKVSessionStorage(context.env.cache, context.env.SESSION_SECRET),
	);

	// Tell the Authenticator to use the form strategy
	authenticator.use(
		new FormStrategy(async ({ form }) => {
			let username = form.get('username') as string;
			let password = form.get('password') as string;
			let user = await login(username, password);
			// the type of this user must match the type you pass to the Authenticator
			// the strategy will automatically inherit the type if you instantiate
			// directly inside the `use` method
			return user;
		}),
		// each strategy has a name and can be changed to use another one
		// same strategy multiple times, especially useful for the OAuth2 strategy.
		'user-pass',
	);

	return authenticator;
}

export function getUser(context: AppLoadContext, request: Request) {
	const authenticator = getAuthenticator(context);

	return authenticator.isAuthenticated(request);
}

export function requireUser(context: AppLoadContext, request: Request) {
	const url = new URL(request.url);
	const authenticator = getAuthenticator(context);

	return authenticator.isAuthenticated(request, {
		failureRedirect: `/login?${new URLSearchParams({
			redirectTo: `${url.pathname}${url.search}`,
		}).toString()}`,
	});
}
