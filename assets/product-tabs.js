import { Component } from '@theme/component';
import { StandardEvents } from '@shopify/events';

/**
 * Descrizione / Specifiche tecniche tabs. Only one panel is visible at a
 * time. The specs table's product-option rows stay in sync with the
 * selected variant by listening for the same productSelect event that
 * <product-price> and <product-quick-specs> use.
 *
 * @extends {Component<{tabButtons: HTMLElement[], panels: HTMLElement[], specsTableContainer: HTMLElement}>}
 */
class ProductTabs extends Component {
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.#handleTabClick);

    const closestSection = this.closest('.shopify-section, dialog');
    if (!closestSection) return;
    closestSection.addEventListener(StandardEvents.productSelect, this.#handleProductSelect);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#handleTabClick);

    const closestSection = this.closest('.shopify-section, dialog');
    if (!closestSection) return;
    closestSection.removeEventListener(StandardEvents.productSelect, this.#handleProductSelect);
  }

  /** @param {MouseEvent} event */
  #handleTabClick = (event) => {
    const button = /** @type {HTMLElement | null} */ (event.target instanceof Element ? event.target.closest('[data-tab]') : null);
    if (!button) return;

    const tab = button.dataset.tab;

    for (const tabButton of this.refs.tabButtons ?? []) {
      tabButton.setAttribute('aria-selected', String(tabButton.dataset.tab === tab));
    }
    for (const panel of this.refs.panels ?? []) {
      panel.toggleAttribute('hidden', panel.dataset.panel !== tab);
    }
  };

  /**
   * @param {import('@shopify/events').ProductSelectEvent} event
   */
  #handleProductSelect = (event) => {
    if (!(event.target instanceof Element) || event.target.closest('product-card')) return;

    event.promise
      .then(({ detail }) => {
        if (!detail?.html) return;

        const { html, newProduct } = detail;

        if (newProduct) {
          this.dataset.productId = newProduct.id;
        } else if (detail.productId && detail.productId !== this.dataset.productId) {
          return;
        }

        const { specsTableContainer } = this.refs;
        const newTabs = html.querySelector(`product-tabs[data-block-id="${this.dataset.blockId}"]`);
        if (!newTabs || !specsTableContainer) return;

        const newTable = newTabs.querySelector('[ref="specsTableContainer"]');
        if (newTable) specsTableContainer.replaceWith(newTable);
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') console.warn('[product-tabs] Event promise rejected:', error);
      });
  };
}

if (!customElements.get('product-tabs')) {
  customElements.define('product-tabs', ProductTabs);
}
