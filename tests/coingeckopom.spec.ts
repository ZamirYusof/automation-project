import { test, expect } from '@playwright/test';
import { ConverterPage } from '../tests/pages/converterpage';

test('CoinGecko Converter flow', async ({ page }) => {
    const converter = new ConverterPage(page);

    // 1. Open CoinGecko homepage
    await converter.gotoHome();

    // 2. Navigate to Converter
    await converter.openConverter();

    // 3. Verify landing on converter page
    await expect(page).toHaveURL(/.*converter/);

    // Heading
    await expect(converter.heading).toHaveText('Cryptocurrency Converter Calculator');

    // 4. Validate default values
    await expect(converter.amountField).toHaveValue('1.00');
    await expect(converter.selectedCoin).toHaveText(/Bitcoin \(BTC\)/);
    await expect(converter.currencySelect).toHaveText(/US Dollar \(USD\)/);

    // 5. Fetch conversion value from CoinGecko API
    const apiResponse = await page.request.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const apiData = await apiResponse.json();
    const apiPrice = apiData.bitcoin.usd;
    console.log('API conversion value:', apiPrice);

    // 6. Capture conversion value text from tested page
    const testedValue = await converter.getConversionResult();
    console.log('CoinGecko conversion result:', testedValue);

    // Gatekeeper: check if value exists
    if (!testedValue) {
        throw new Error('No conversion value returned from page');
    }

    // Gatekeeper: ensure format is correct
    expect(testedValue).toMatch(/₿1\.000000 = \$[0-9,]+\.\d{2}/);
    await page.screenshot({ path: 'covertedprice.png' });

    // 7. Validate "Last updated at … UTC" text
    expect(converter.lastUpdated).toHaveText(/Last updated at .* UTC\./);
    const lastupdate = await converter.lastUpdated.textContent();
    const trimmedTime = lastupdate?.match(/(\d{1,2}:\d{2}[AP]M UTC)/)?.[1];
    console.log('Last updated :', trimmedTime);

    // 8. Extract price from displayed text and compare with API value
    const displayedPrice = parseFloat(
        testedValue?.match(/\$([0-9,]+\.\d{2})/)?.[1]?.replace(/,/g, '') ?? '0'
    );
    console.log('Displayed price:', displayedPrice);
    console.log('API price:', apiPrice);

    const diff = Math.abs(displayedPrice - apiPrice);
    const percentageDiff = (diff / apiPrice) * 100;

    switch (true) {
        case displayedPrice === apiPrice:
            console.log('Exact match: Displayed price equals API price');
            expect(displayedPrice).toBe(apiPrice);
            break;

        case percentageDiff <= 0.1:
            console.log(
                `Prices differ slightly but are within tolerance: ${percentageDiff.toFixed(4)}%`
            );
            expect(percentageDiff).toBeLessThanOrEqual(0.1);
            break;

        default:
            console.error(
                `Mismatch beyond tolerance: ${percentageDiff.toFixed(4)}% difference`
            );
            expect(displayedPrice).toBe(apiPrice); // force fail
            break;
    }

    //npx playwright test tests/coingeckopom.spec.ts --project=chromium --workers=1 --debug
    //npx playwright test tests/coingeckopom.spec.ts --project=chromium
    //npx playwright show-report
    //test branch
});
