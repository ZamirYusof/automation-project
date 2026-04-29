import { test, expect } from '@playwright/test';
import { ConverterPage } from '../pages/converterpage';

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

    // 5. Capture conversion value text
    const value = await converter.getConversionResult();
    console.log('Conversion result:', value);
    expect(value).toMatch(/₿1\.000000 = \$[0-9,]+\.\d{2}/);

    // 6. Validate "Last updated at … UTC" text
    await expect(converter.lastUpdated).toHaveText(/Last updated at .* UTC\./);

    //npx playwright test tests/coingeckopom.spec.ts --project=chromium --workers=1 --debug
    //npx playwright test tests/coingeckopom.spec.ts --project=chromium
    //npx playwright show-report
    //test branch
});
