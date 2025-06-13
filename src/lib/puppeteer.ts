import type { Browser } from 'puppeteer';
import puppeteer from 'puppeteer';

let browserInstance: Browser | null = null;

async function initializeBrowser(): Promise<Browser> {
	if (!browserInstance) {
		browserInstance = await puppeteer.launch({
			headless: false
		});

		console.log('Puppeteer browser launched');

		browserInstance.on('targetdestroyed', async function (target) {
			if (browserInstance && target.type() === 'page') {
				const pages = await browserInstance.pages();

				if (pages.length === 0) {
					console.log('No pages left in the browser, closing it.');
					await closeBrowser();
				}
			}
		});
	}
	return browserInstance;
}

async function watchBrowser() {
	if (browserInstance) {
		const pages = await browserInstance.pages();
		if (pages.length === 0) {
			console.log('No pages found in the browser, closing it.');
			await closeBrowser();
		}
	}
}

export async function getBrowser(): Promise<Browser> {
	return await initializeBrowser();
}

export async function closeBrowser(): Promise<void> {
	if (browserInstance) {
		await browserInstance.close();
		browserInstance = null;
		console.log('Puppeteer browser closed');
	}
}

// Graceful shutdown
process.on('exit', async () => {
	await closeBrowser();
});

process.on('SIGINT', async () => {
	// Catches Ctrl+C
	await closeBrowser();
	process.exit();
});

process.on('SIGTERM', async () => {
	// Catches termination signal
	console.log('Process SIGTERM event');
	await closeBrowser();
	process.exit(0);
});
