
/* Riskconnect PVT (Test Environment)
 -----------------------------------------------------------------
Purpose:
• Verify successful access to RiskConnect via Okta authentication
• Confirm Registers Review loads and key registers can be opened
• Confirm Audit Planning Memo is accessible
• Verify Attestations and Libraries pages are accessible
• Confirm Audit Actions dashboard loads and export can be initiated
 -----------------------------------------------------------------*/


const { Builder, By, until } = require("selenium-webdriver");


/* ----------------------- Helpers --------------------- */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setWideViewport(driver) {
    await driver.manage().window().setRect({ width: 2600, height: 1200 });
}

async function reactSafeClick(driver, locator, timeout = 30000) {
    await driver.wait(async () => {
        try {
            const el = await driver.findElement(locator);
            await el.click();
            return true;
        } catch (err) {
            const name = err.name || "";
            if (
                name.includes("StaleElementReference") ||
                name.includes("ElementNotInteractable") ||
                name.includes("NoSuchElement")
            ) {
                return false;
            }
            throw err;
        }
    }, timeout);
}

/* ------------------- Step wrapper ------------------- */
function makeStep(zephyrLog) {
    let stepIndex = 1;
    return async function step(name, fn, opts = {}) {
        const label = `Step ${String(stepIndex).padStart(2, "0")} – ${name}`;
        stepIndex++;
        const start = Date.now();
        try {
            await fn();
            const sec = ((Date.now() - start) / 1000).toFixed(2);
            const msg = `PASS: ${label} (${sec}s)`;
            console.log(`✅ ${msg}`);
            zephyrLog(msg, "Pass");
        } catch (err) {
            const msg = `FAIL: ${label} — ${err.message}`;
            console.log(`❌ ${msg}`);
            zephyrLog(msg, "Fail");
            if (opts.rethrowOnFail) throw err;
        }
    };
}

/* ----------------------- Test ----------------------- */

module.exports = async function (driver, parameters = {}, zephyrLog) {
    if (typeof zephyrLog !== "function") zephyrLog = () => { };
    const step = makeStep(zephyrLog);

    //const email = parameters.EMAIL ?? "";
    //const password = parameters.EMAILPASS ?? "";

    try {
        await setWideViewport(driver);

        /* STEP 01
           • Open Protecht Test
           • Login via Okta
           • Confirm login by main menu presence
        */
        await step(
            "Login to RiskConnect",
            async () => {
                await driver.get(
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=Home"
                );

                await driver.wait(
                until.elementLocated(By.css('[data-testid="app-menu-main"]')),
                30000
                );
            },
            { rethrowOnFail: true }
        );

        /* STEP 02
           • Open Registers Review directly (bypass menu)
        */
        await step(
            "Open Registers Review",
            async () => {
                await driver.get(
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?appId=2&widget=IncidentReview"
                );
            }
        );

        /* STEP 03
           • Confirm Registers grid loaded
        */
        await step(
            "Confirm Registers grid loaded",
            async () => {
                await driver.wait(
                    until.elementLocated(
                        By.xpath("//span[normalize-space()='Activity Risk Assessment']")
                    ),
                    30000
                );
            }
        );

        /* STEP 04
           • Open registers:
             Activity Risk Assessment
             Business Process List
             Governance Risk Assessment
             Project Risk
             RACM
             Disclosure of Interest
             Fraud & Corruption Prevention
             Management Process Risk Assessment
        */
        await step(
            "Open registers",
            async () => {
                const registers = [
                    "Activity Risk Assessment",
                    "Business Process List",
                    "Governance Risk Assessment",
                    "Project Risk",
                    "RACM",
                    "Disclosure of Interest",
                    "Fraud & Corruption Prevention",
                    "Management Process Risk Assessment"
                ];

                for (const name of registers) {
                    await reactSafeClick(
                        driver,
                        By.xpath(`//span[normalize-space()='${name}']`)
                    );
                    await sleep(2000);
                    await driver.navigate().back();
                    await driver.wait(
                        until.elementLocated(
                            By.xpath("//span[normalize-space()='Activity Risk Assessment']")
                        ),
                        30000
                    );
                }
            }
        );

        /* STEP 05
           • Open Audit Planning Memo
        */
        await step(
            "Open Audit Planning Memo",
            async () => {
                await reactSafeClick(
                    driver,
                    By.xpath("//span[normalize-space()='Audit Planning Memo']")
                );
                await sleep(3000);
            }
        );

        /* STEP 06
           • Open Attestations pages:
             Response Lists
             Question Library
             Question Assignment
             All Compliance Entry
        */
        await step(
            "Open Attestations pages",
            async () => {
                const pages = [
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=Responses",
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=QuestionLibrary",
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=QuestionAssignment",
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=AllComplianceEntry"
                ];

                for (const url of pages) {
                    await driver.get(url);
                    await driver.wait(until.elementLocated(By.css("body")), 30000);
                    await sleep(2000);
                }
            }
        );

        /* STEP 07
           • Open Libraries pages
        */
        await step(
            "Open Libraries pages",
            async () => {
                const pages = [
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=TagManagement",
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=BusinessUnit",
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=UserManagement",
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=RiskEvents",
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=Controls",
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=RiskCauses",
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=SelfAssessmentScales",
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?widget=AttachmentLibrary",
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/react/RolesAndPermissions/rolesAndPermissions"
                ];

                for (const url of pages) {
                    await driver.get(url);
                    await driver.wait(until.elementLocated(By.css("body")), 30000);
                    await sleep(2000);
                }
            }
        );

        /* STEP 08
           • Open Audit Actions dashboard
        */
        await step(
            "Open Audit Actions dashboard",
            async () => {
                await driver.get(
                    "https://erm2.protecht.com.au/uts-test/worms/client/app/widget.html?path=Applications%2FActions%2FAudit+Actions&widget=Dashboard"
                );
                await sleep(5000);
            }
        );

        /* STEP 09
           • Export Audit Actions report
        */
        await step(
            "Export Audit Actions report",
            async () => {
                const iframe = await driver.findElement(By.id("center-container-widget"));
                await driver.switchTo().frame(iframe);

                const exportButton = By.xpath("//button[@title='Export']");
                await driver.wait(until.elementLocated(exportButton), 30000);
                await driver.executeScript(
                    "arguments[0].click();",
                    await driver.findElement(exportButton)
                );

                const okButton = By.xpath("//button[normalize-space()='OK']");
                await driver.wait(until.elementLocated(okButton), 30000);
                await driver.executeScript(
                    "arguments[0].click();",
                    await driver.findElement(okButton)
                );

                await sleep(2000);
                const okButtons = await driver.findElements(okButton);
                if (okButtons.length > 0) {
                    await driver.executeScript("arguments[0].click();", okButtons[0]);
                }

                await driver.switchTo().defaultContent();
            }
        );

    } catch (err) {
        zephyrLog("Fatal test error: " + err.message, "Fail");
        throw err;
    }
};