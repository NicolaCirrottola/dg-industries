import { ThemeEvents } from '@theme/events';
import { formatMoney } from '@theme/money-formatting';

/**
 * Keeps the "— unit price × quantity" suffix on an add-to-cart button in
 * sync with the quantity selector, without touching product-form.js. Reuses
 * the theme's shared money formatter so the output matches the store's
 * money_format exactly (currency symbol placement, separators, etc).
 */
function initPriceSuffix(container) {
  const unitPrice = Number(container.dataset.unitPrice);
  if (!Number.isFinite(unitPrice)) return;

  const currency = container.dataset.currency || '';
  const formatTemplate = container.querySelector('[ref="moneyFormatTemplate"]');
  const moneyFormat = formatTemplate instanceof HTMLTemplateElement ? formatTemplate.content.textContent ?? '' : '';
  const suffix = container.querySelector('[ref="addToCartPriceSuffix"]');
  if (!suffix) return;

  const form = container.closest('form');
  if (!form) return;

  form.addEventListener(ThemeEvents.quantitySelectorUpdate, (event) => {
    const quantity = /** @type {CustomEvent<{quantity: number}>} */ (event).detail?.quantity;
    if (!Number.isFinite(quantity)) return;
    suffix.textContent = ` — ${formatMoney(unitPrice * quantity, moneyFormat, currency)}`;
  });
}

document.querySelectorAll('add-to-cart-component[data-unit-price]').forEach(initPriceSuffix);
