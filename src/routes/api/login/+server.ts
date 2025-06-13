import { getBrowser } from '$lib/puppeteer';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const username = formData.get('username');
	const password = formData.get('password');

	console.log({ username, password });

	const browser = await getBrowser();
	const page = (await browser.pages())[0];

	await page.goto('https://idp.amazon.work/idp/profile/SAML2/Unsolicited/SSO', {
		waitUntil: 'networkidle0' // 'networkidle0' might be needed for stricter waiting, so far this works.
	});

	await page.waitForSelector('#login');
	await page.type('#login', username as string);
	await page.type('#password', password as string);
	await page.click('#buttonLogin');

	await page.waitForSelector('.error_page, #buttonContinue');

	const errorPage = await page.$('.error_page');
	if (errorPage) {
		console.log('Error page detected');
		// Handle error page
	} else {
		console.log('Continue button detected');
		await page.click('#buttonContinue');
		await page.waitForSelector('#code', { visible: true });
		
        return new Response(JSON.stringify({ success: true, status: '2FA_required' }), {
			status: 200, // OK, but with a specific status indicating next step
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return new Response();
};
