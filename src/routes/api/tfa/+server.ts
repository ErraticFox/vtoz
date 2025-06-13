import { getBrowser } from '$lib/puppeteer';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const tfa_code = formData.get('tfa');

	const browser = await getBrowser();
	const page = (await browser.pages())[0];

	await page.type('#code', tfa_code as string);
	await page.click('#buttonVerifyIdentity');

	await page.waitForSelector('#codeError', { visible: true });

	const errorPage = await page.$('#codeError');

	if (errorPage) {
		console.log('2FA error detected');
		return new Response(JSON.stringify({ success: false, status: '2FA_error' }), {
			status: 400, // Bad Request
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return new Response();
};
