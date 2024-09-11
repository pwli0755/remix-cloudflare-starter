import type {
	ActionFunctionArgs,
	LinksFunction,
	LoaderFunctionArgs,
} from '@remix-run/cloudflare';
import { getAuthenticator } from '~/services/auth.server';

import { useEffect, useState } from 'react';
import ePub from 'epubjs';
import { Link, useActionData, useFetcher } from '@remix-run/react';
// Base styles for media player and provider (~400B).
import themeCss from '@vidstack/react/player/styles/default/theme.css?url';
import audioCss from '@vidstack/react/player/styles/default/layouts/audio.css?url';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import {
	DefaultAudioLayout,
	defaultLayoutIcons,
} from '@vidstack/react/player/layouts/default';
import { Button } from '~/components/ui/button';
import { PlayIcon } from 'lucide-react';
import { EdgeTTS } from '~/lib/edge-tts';

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: themeCss,
		},
		{
			rel: 'stylesheet',
			href: audioCss,
		},
	];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	// If the user is already authenticated redirect to /dashboard directly
	return await getAuthenticator(context).isAuthenticated(request, {
		failureRedirect: '/login?redirect=/epub',
	});
}
export const action = async ({ request, context }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const text = formData.get('text');
	const tts = new EdgeTTS();
	return await tts.ttsResponse(text as string);
};

function EpubReader() {
	const [data, setData] = useState<string[]>();
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		async function getChaptersFromEpub(): Promise<string[]> {
			const response = await fetch(
				'The_Life_and_Adventures_of_Robinson_Crusoe.epub',
			);
			const arrayBuffer = await response.arrayBuffer();
			const book = ePub(arrayBuffer);
			await book.ready;

			// 获取目录信息
			const navigation = book.navigation;
			const chapterTitles: string[] = [];

			// 遍历目录中的每个条目
			navigation.forEach(item => {
				if (item.label) {
					chapterTitles.push(item.label);
				}
				return {};
			});
			setIsLoading(false);
			return chapterTitles;
		}
		getChaptersFromEpub().then(chapters => {
			setData(chapters); // 将章节标题显示在页面上
		});
	}, []);

	return (
		<div>
			<h1>Epub Reader</h1>
			<MediaPlayer
				title="Sprite Fight"
				src="https://files.vidstack.io/sprite-fight/audio.mp3"
			>
				<MediaProvider />
				<DefaultAudioLayout icons={defaultLayoutIcons} />
			</MediaPlayer>
			<p>This is a simple epub reader.</p>
			{isLoading ? (
				<div className="flex flex-col gap-2">
					<p className="animate-bounce text-pink-500">Loading...</p>
					{Array.from([1, 3, 5, 2, 4, 2, 1]).map((v, i) => (
						<p key={i} className="animate-bounce text-pink-500">
							{'-'.repeat(v)}
						</p>
					))}
				</div>
			) : (
				<div className="flex flex-col text-blue-400">
					{data?.map(c => {
						return (
							<div key={c}>
								<Link
									to={`/epub-tts?text=${c}`}
									reloadDocument
									className="flex gap-2"
								>
									<h1>{c}</h1>
									<Button
										name="text"
										type="submit"
										value={c}
										size="sm"
										variant="outline"
									>
										<PlayIcon></PlayIcon>
									</Button>
								</Link>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default EpubReader;
