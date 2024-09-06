import {
	createCookie,
	createWorkersKVSessionStorage,
} from '@remix-run/cloudflare';

export function getWorkersKVSessionStorage(
	ns: KVNamespace,
	sessionSecret: string,
) {
	const sessionCookie = createCookie('__session', {
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secrets: [sessionSecret],
		secure: import.meta.env.PROD,
	});

	return;
	createWorkersKVSessionStorage({
		// The KV Namespace where you want to store sessions
		kv: ns,
		cookie: sessionCookie,
	});
}
