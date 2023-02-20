const puppeteer = require('puppeteer');

require('dotenv').config()

const url_de_connexion = process.env.URL_DE_CONNEXION;
const url_de_reservation = process.env.URL_DE_RESERVATION;

const identifiant = process.env.IDENTIFIANT;
const mot_de_passe = process.env.MOT_DE_PASSE;

const dates_a_verifier = [
    '#cJOURNEE20230222',
    '#cJOURNEE20230301'
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run () {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    // 1. Se connecter
    await page.goto(url_de_connexion);
    await page.type('#username', identifiant);
    await page.type('#password', mot_de_passe);
    await page.keyboard.press('Enter');

    // 2. Démarrer la réservation
    await page.waitForNavigation();
    await page.goto(url_de_reservation);

    // 3. Aller sur la page des dates
    await page.waitForSelector('#lnkCommencerDemarche');
    await page.click('#lnkCommencerDemarche');
    await sleep(2000);

    // 4. Vérifier les dates
    for (let date_a_verifier of dates_a_verifier) {
        await page.waitForSelector(date_a_verifier);
        if (await page.$eval(date_a_verifier, el => el.disabled)) {
            await console.log(date_a_verifier + ' Rien de dispo !');
        } else {
            await console.log(date_a_verifier + ' LIBRE !');
        }
    }

    await browser.close();
}

run();