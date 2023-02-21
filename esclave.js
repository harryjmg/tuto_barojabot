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

function envoyer_sms(contenu_sms) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: contenu_sms,
            from: process.env.TWILIO_FROM_PHONE,
            to: process.env.TWILIO_TO_PHONE
        })
        .then(message => console.log("Sms envoyé ! SID: " + message.sid));
}

async function run () {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    // 0. Donner date et heure de la vérification
    await console.log("Vérification le " + new Date().toLocaleString());

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
    let dates_libres = [];
    for (let date_a_verifier of dates_a_verifier) {
        await page.waitForSelector(date_a_verifier);
        if (await page.$eval(date_a_verifier, el => el.disabled === false)) {
            await dates_libres.push(date_a_verifier);
        }
    }

    // 5. Envoyer un sms si des dates sont libres
    if (dates_libres.length > 0) {
        await console.log("\x1b[32m%s\x1b[0m", "Dates libres : " + dates_libres);
        await envoyer_sms("Dates libres : " + dates_libres);
        await process.exit(0);
    } else {
        await console.log("\x1b[31m%s\x1b[0m", "Aucune date libre");
    }

    await browser.close();
}

run();
setInterval(run, 600000);
