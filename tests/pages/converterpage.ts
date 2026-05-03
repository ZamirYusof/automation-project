// pages/ConverterPage.ts
import { Page, Locator } from '@playwright/test';

export class ConverterPage {
    readonly page: Page;
    readonly cryptoMenu: Locator;
    readonly converterLink: Locator;
    readonly heading: Locator;
    readonly amountField: Locator;
    readonly coinSelect: Locator;
    readonly selectedCoin: Locator;
    readonly currencySelect: Locator;
    readonly conversionText: Locator;
    readonly lastUpdated: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cryptoMenu = page.getByRole('link', { name: 'Cryptocurrencies' });
        this.converterLink = page.getByRole('link', { name: 'Converter' });
        this.heading = page.locator('h1', { hasText: 'Cryptocurrency Converter Calculator' });
        this.amountField = page.locator('input[data-converter-index-target="amountInput"]');
        this.coinSelect = page.locator('select[data-converter-index-target="coinInput"]');
        this.selectedCoin = this.coinSelect.locator('option[selected]');
        this.currencySelect = page.locator('div[data-value="USD"]').first();
        this.conversionText = page.locator('h2[data-converter-index-target="convertedAmount"]');
        this.lastUpdated = page.locator('div[data-converter-index-target="lastUpdated"]');
    }

    async gotoHome() {
        await this.page.goto('https://www.coingecko.com/');
    }

    async openConverter() {
        await this.cryptoMenu.hover();
        await this.converterLink.click();
    }

    async getConversionResult() {
        return this.conversionText.textContent();
    }
}
