import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json, useLoaderData } from '@remix-run/react';
import { Markdown } from '~/components';
import { requireUser } from '~/services/auth.server';
import { getFileContentWithCache } from '~/services/github.server';
import { parse } from '~/services/markdoc.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
	// get the user data or redirect to /login if it failed
	let user = await requireUser(context, request);
	const content = await getFileContentWithCache(context, 'README.md');

	return json(
		{
			content: parse(content),
			user,
		},
		{
			headers: {
				'Cache-Control': 'public, max-age=3600',
			},
		},
	);
}

export default function Index() {
	const { content } = useLoaderData<typeof loader>();

	return <Markdown content={content} />;
}
