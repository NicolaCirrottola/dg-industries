import { Component } from '@theme/component';
import { StandardEvents } from '@shopify/events';

/**
 * A custom element that displays the product's option values (e.g. Diametro,
 * Materiale, Azionamento) in a quick-facts grid. Listens for variant update
 * events from the variant-picker and refreshes its own subtree, mirroring
 * how <product-price> stays in sync (see product-price.js).
 *
 * @extends {Component<{specsContainer: HTMLElement}>}
 */
class ProductQuickSpecs extends Component {
  connectedCallback() {
    super.connectedCallback();
    const closestSection = this.closest('.shopify-section, dialog');
    if (!closestSection) return;
    closestSection.addEventListener(StandardEvents.productSelect, this.#handleProductSelect);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const closestSection = this.closest('.shopify-section, dialog');
    if (!closestSection) return;
    closestSection.removeEventListener(StandardEvents.productSelect, this.#handleProductSelect);
  }

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

        const { specsContainer } = this.refs;
        const newSpecs = html.querySelector(`product-quick-specs[data-block-id="${this.dataset.blockId}"]`);
        if (!newSpecs || !specsContainer) return;

        const newContainer = newSpecs.querySelector('[ref="specsContainer"]');
        if (newContainer) specsContainer.replaceWith(newContainer);
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') console.warn('[product-quick-specs] Event promise rejected:', error);
      });
  };
}

if (!customElements.get('product-quick-specs')) {
  customElements.define('product-quick-specs', ProductQuickSpecs);
}
