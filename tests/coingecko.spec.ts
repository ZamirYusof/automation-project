import { test, expect, chromium } from '@playwright/test';

test('CoinGecko Converter flow', async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    // 1. Open CoinGecko homepage
    await page.goto('https://www.coingecko.com/');

    // 2. Hover the "Cryptocurrencies" menu, then select "Converter"
    const cryptoMenu = page.getByRole('link', { name: 'Cryptocurrencies' });
    await cryptoMenu.hover();
    const converterLink = page.getByRole('link', { name: 'Converter' });
    await converterLink.click();

    // 3. Verify landing on converter page
    await expect(page).toHaveURL(/.*converter/);

    // Check the <h1> heading text
    const heading = page.locator('h1', { hasText: 'Cryptocurrency Converter Calculator' });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Cryptocurrency Converter Calculator');


    // 4. Validate default values
    const amountField = page.locator('input[data-converter-index-target="amountInput"]');
    await expect(amountField).toHaveValue('1.00');

    // Locate the "select coin" dropdown
    const coinSelect = page.locator('select[data-converter-index-target="coinInput"]');

    // Get the currently selected option
    const selectedCoin = coinSelect.locator('option[selected]');

    // Assert the text contains Bitcoin (BTC)
    await expect(selectedCoin).toHaveText(/Bitcoin \(BTC\)/);

    // Locate the "currency" element directly
    const currencySelect = page.locator('div[data-value="USD"]').first();

    // Assert the visible text
    await expect(currencySelect).toHaveText(/US Dollar \(USD\)/);


    // 5. Capture conversion value text
    const conversionText = page.locator('h2[data-converter-index-target="convertedAmount"]');
    const value = await conversionText.textContent();
    console.log('Conversion result:', value);

    // Validate format of conversion string (₿1.000000 = $76,681.62)
    expect(value).toMatch(/₿1\.000000 = \$[0-9,]+\.\d{2}/);

    // 6. Validate "Last updated at … UTC" text
    const lastUpdated = page.locator('div[data-converter-index-target="lastUpdated"]');
    await expect(lastUpdated).toBeVisible();
    await expect(lastUpdated).toHaveText(/Last updated at .* UTC\./);

    // 6. Close browser
    await browser.close();


    //npx playwright test tests/coingecko.spec.ts --project=chromium --workers=1 --debug
    //npx playwright test tests/coingecko.spec.ts --project=chromium
    //npx playwright show-report

});
