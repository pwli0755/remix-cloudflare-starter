import {
	createCookie,
	createWorkersKVSessionStorage,
} from '@remix-run/cloudflare';

export function getWorkersKVSessionStorage(
	ns: KVNamespace,
	sessionSecret: string,
) {
	const sessionCookie = createCookie('__auth', {
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secrets: [sessionSecret],
		secure: import.meta.env.PROD,
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
	});

	return createWorkersKVSessionStorage({
		// The KV Namespace where you want to store sessions
		kv: ns,
		cookie: sessionCookie,
	});
}
