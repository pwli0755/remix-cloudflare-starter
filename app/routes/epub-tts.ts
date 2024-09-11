import type { LoaderFunctionArgs } from '@remix-run/node';
import { EdgeTTS } from '~/lib/edge-tts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const qs = new URL(request.url).searchParams.get('text');
	const headers = {
		'Content-Disposition': 'attachment; filename="out.mp3"',
		'Content-Type': 'application/octet-stream',
	};
	const tts = new EdgeTTS();
	return await tts.ttsResponse(qs as string, headers);
};
