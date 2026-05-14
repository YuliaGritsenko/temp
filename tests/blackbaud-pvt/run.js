// Blackbaud (Raiser's Edge NXT) PVT

const { By, until } = require("selenium-webdriver");

/* ------------------- Logging ------------------- */
function log(msg) {
    process.stdout.write(`${msg}\n`);
}

/* ------------------- Helpers ------------------- */
async function waitForAny(driver, locators, timeoutMs = 20000) {
    const end = Date.now() + timeoutMs;
    let lastErr;

    for (const locator of locators) {
        const remaining = end - Date.now();
        if (remaining <= 0) break;

        try {
            return await driver.wait(until.elementLocated(locator), remaining);
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr ?? new Error("Expected element not found");
}

async function waitFor(driver, locator, timeout = 20000) {
    return driver.wait(until.elementLocated(locator), timeout);
}

/* Set browser viewport to desktop size */
async function setLargeViewport(driver) {
    try {
        await driver.manage().window().setRect({ width: 1920, height: 1080 });
    } catch {
        await driver.manage().window().maximize();
    }
}

/* ------------------- Step wrapper ------------------- */
function makeStep(zephyrLog) {
    let stepIndex = 1;

    return async function step(name, fn) {
        const label = `Step ${String(stepIndex).padStart(2, "0")} – ${name}`;
        stepIndex++;

        const start = Date.now();
        try {
            await fn();
            const timeSec = ((Date.now() - start) / 1000).toFixed(2);
            const msg = `PASS: ${label} (${timeSec}s)`;
            log(`✅ ${msg}`);
            zephyrLog(msg, "Pass");
        } catch (err) {
            const msg = `FAIL: ${label} — ${err.message}`;
            log(`❌ ${msg}`);
            zephyrLog(msg, "Fail");
            throw err;
        }
    };
}

/* ------------------- Main ------------------- */
module.exports = async function (driver, parameters = {}, zephyrLog) {
    if (typeof zephyrLog !== "function") zephyrLog = () => { };

    const step = makeStep(zephyrLog);

    const email = parameters.EMAIL ?? "";
    const password = parameters.EMAILPASS ?? "";

    /* STEP 01 – Blackbaud – Login via SSO */
    await step("Blackbaud – Login via SSO", async () => {

        await setLargeViewport(driver);
        await driver.get("https://app.blackbaud.com/signin/");

        const continueWithSsoBtn = await waitForAny(driver, [
            By.id("sso-continue-button"),
            By.css("button[data-bbauto-field='email-continue-button']")
        ], 30000);

        await continueWithSsoBtn.click();

        const bbEmailInput = await waitForAny(driver, [
            By.css("input[data-bbauto-field='sign-in-email']"),
            By.css("input[formcontrolname='email']")
        ], 30000);

        if (!(await bbEmailInput.getAttribute("value"))) {
            await bbEmailInput.sendKeys(email);
        }

        const bbContinueBtn = await waitForAny(driver, [
            By.css("button[data-bbauto-field='primary-button']"),
            By.xpath("//button[normalize-space(.)='Continue']")
        ]);

        await bbContinueBtn.click();

        await driver.wait(until.urlContains("login.uts.edu.au"), 30000);

        const utsEmailInput = await waitForAny(driver, [
            By.css("input[name='identifier']"),
            By.css("input[autocomplete='identifier']")
        ], 30000);

        if (!(await utsEmailInput.getAttribute("value"))) {
            await utsEmailInput.sendKeys(email);
        }

        try {
            const utsNextBtn = await waitForAny(driver, [
                By.xpath("//input[@value='Next']"),
                By.css("input.button-primary[type='submit']")
            ], 5000);
            await utsNextBtn.click();
        } catch {
            await driver.executeScript(
                "arguments[0].form.submit();",
                utsEmailInput
            );
        }

        const utsPasswordInput = await waitForAny(driver, [
            By.css("input[name='credentials.passcode']"),
            By.css("input[type='password']")
        ], 30000);

        await utsPasswordInput.sendKeys(password);

        const utsSignInBtn = await waitForAny(driver, [
            By.xpath("//input[@value='Sign In']"),
            By.css("input.button-primary[type='submit']")
        ]);

        await utsSignInBtn.click();

        await driver.wait(until.urlContains("app.blackbaud.com"), 60000);

        await waitForAny(driver, [
            By.xpath("//h1[contains(.,'Welcome')]"),
            By.xpath("//div[contains(.,'Welcome')]")
        ], 30000);
    });

    /* STEP 02 – Blackbaud – Open Raiser's Edge NXT */
    await step("Blackbaud – Open Raiser's Edge NXT", async () => {

        const reNxtLink = await waitForAny(driver, [
            By.xpath("//a[contains(.,\"Raiser's Edge NXT\")]"),
            By.css("a[href*='host.nxt.blackbaud.com/renxt-homepage']")
        ], 30000);

        await reNxtLink.click();

        await driver.wait(
            until.urlContains("host.nxt.blackbaud.com/renxt-homepage"),
            60000
        );

        await waitForAny(driver, [
            By.xpath("//h1[normalize-space()='Home']"),
            By.xpath("//span[normalize-space()='Home']")
        ], 30000);
    });

    /* STEP 03 – Gifts – Overview */
    await step("Blackbaud – Gifts – Overview", async () => {
        await driver.get("https://host.nxt.blackbaud.com/gift-management/?svcid=renxt");

        await waitFor(driver, By.xpath(
            "//span[contains(@class,'sky-page-header-page-title') and normalize-space()='Gift management']"
        ));
    });

    /* STEP 04 – Gifts – Gift batch entry */
    await step("Blackbaud – Gifts – Gift batch entry", async () => {
        await driver.get("https://host.nxt.blackbaud.com/gift-batch/gift-management");

        await waitFor(driver, By.xpath(
            "//sky-dropdown-button[.//text()[normalize-space()='Add']]"
        ));
    });

    /* STEP 05 – Communications – Overview */
    await step("Blackbaud – Communications – Overview", async () => {

        await driver.get(
            "https://host.nxt.blackbaud.com/communication/overview"
        );

        await waitFor(driver, By.xpath(
            "//span[normalize-space()='Appeal tracker']"
        ));
    });
 

    /* STEP 06 – Analysis – Standard reports */
    await step("Blackbaud – Analysis – Standard reports", async () => {
        await driver.get("https://host.nxt.blackbaud.com/renxt-reports");

        await waitFor(driver, By.xpath(
            "//span[contains(@class,'sky-page-header-page-title') and normalize-space()='Standard reports']"
        ));
    });

    /* STEP 07 – Settings */
    await step("Blackbaud – Settings", async () => {
        await driver.get("https://host.nxt.blackbaud.com/renxt-settings/");

        await waitFor(driver, By.xpath(
            "//h1[normalize-space()='Settings']"
        ));
    });

    log("✅ Blackbaud PVT completed");
};