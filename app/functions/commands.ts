/**
 * Telegraf Commands
 * =====================
 *
 * @contributors: Patryk Rzucidło [@ptkdev] <support@ptkdev.io> (https://ptk.dev)
 *
 * @license: MIT License
 *
 */
import bot from "@app/functions/telegraf";
import * as databases from "@app/functions/databases";
import config from "@configs/config";
import { launchPolling, launchWebhook } from "./launcher";
import puppeteer from "puppeteer";
import fs from "fs";

/**
 * command: /quit
 * =====================
 * If user exit from bot
 *
 */
const quit = async (): Promise<void> => {
	bot.command("quit", (ctx) => {
		ctx.telegram.leaveChat(ctx.message.chat.id);
		ctx.leaveChat();
	});
};

/**
 * command: /photo
 * =====================
 * Send photo from picsum to chat
 *
 */
const sendPhoto = async (): Promise<void> => {
	bot.command("photo", (ctx) => {
		ctx.replyWithPhoto("https://picsum.photos/200/300/");
	});
};
/**
 * command: /start
 * =====================
 * Send welcome message
 *
 */
const start = async (): Promise<void> => {
	bot.start((ctx) => {
		databases.writeUser(ctx.update.message.from);

		ctx.telegram.sendMessage(ctx.message.chat.id, `Welcome! Try send /photo command or write any text`);
	});
};

/**
 * Run bot
 * =====================
 * Send welcome message
 *
 */
const launch = async (): Promise<void> => {
	const mode = config.mode;
	if (mode === "webhook") {
		launchWebhook();
	} else {
		launchPolling();
	}
};

const fetchTourAndNotify = async () => {
	const { price, image } = await fetchTour() as any;
	await bot.telegram.sendMessage("-852280230", `Current cheapest tour price is ${price}`);
	await bot.telegram.sendPhoto("-852280230", { source: Buffer.from(image, "base64") });
};

const jopa = async (): Promise<void> => {
	try {
		await fetchTourAndNotify();
		setTimeout(jopa, 1.8e+6);
	} catch (error) {
		console.log(error);
		jopa();
	}
};

const fetchTour = async () => {
		const browser = await puppeteer.launch({ headless: false });
		const page = await browser.newPage();
	try {
		await page.goto("https://algritravel.kz/vetnam", { waitUntil: "networkidle0" });
		await page.click("div.TVSearchButton");
		await page.waitForNetworkIdle({ idleTime: 3000 });
		const resultsSelector = "div.TVResultItemPriceValue";
		const result = await page.$(".TVHotelResultItem");
		const screenshot = await result?.screenshot();
		const prices = await page.evaluate(resultsSelector => {
			// @ts-ignore
			return [...document.querySelectorAll(resultsSelector)].map(anchor => {
				const title = anchor.textContent;
				return `${title}`;
			});
		}, resultsSelector);

		// Print all the files.
		return { price: prices[0], image: screenshot } ;
	} catch (e) {
		console.log(e);
	} finally {
		await browser.close();
	}
};

export { launch, quit, sendPhoto, start, jopa };
export default launch;
