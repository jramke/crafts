import fs from 'fs/promises';
import satori from 'satori';
import { html as toReactNode } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';

const width = 1200;
const height = 630;

export const GET: APIRoute = async function get({ params, request }) {
	const Inter = await fs.readFile(
		'./public/fonts/inter/Inter_Regular.ttf'
	);
    const ReenieBeanie = await fs.readFile(
        './public/fonts/reenie-beanie/ReenieBeanie-Regular.ttf'
    );

    const markup = toReactNode`
        <div style="display: flex; align-items: center; justify-content: center; gap: 60px; flex-direction: column; height: 100%; background-color: #fafafa;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 30px;">
                <div style="font-family: 'Inter'; font-size: 90px; color: #0c0a09;">Crafts</div>
                <div style="font-family: 'Reenie Beanie'; font-size: 120px; color: #6e6e6e; margin-top: 15px;">by Joost.</div>
            </div>
        </div>
    `;

	const svg = await satori(
		markup,
		{
			width: width,
			height: height,
			fonts: [
				{
					name: 'Inter',
					data: Inter,
					style: 'normal',
				},
                {
                    name: 'Reenie Beanie',
                    data: ReenieBeanie,
                    style: 'normal'
                },
			],
		}
	);

    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: width
        }
    });

    const image = resvg.render();

	return new Response(image.asPng(), {
        headers: {
            'content-type': 'image/png'
        }
    });
};
