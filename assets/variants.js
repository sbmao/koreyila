class VariantSelects extends HTMLElement {
  constructor() {
    super(),
      (this.item = $(this).closest(".productView")),
      (this.isFullWidth = this.item.is(".layout-4")),
      (this.isInitialized = !1),
      this.onVariantInit(),
      this.addEventListener("change", this.onVariantChange.bind(this)),
      this.switchBtns.length &&
        this.switchBtns.forEach((button) => {
          button.addEventListener("click", this.switchToggle.bind(this));
        });
  }
  onVariantInit() {
    (this.status = Object.create({})),
      (this.status.variantName = "Size"),
      (this.status.customSize = "Custom Size"),
      (this.status.unit = "inch"),
      (this.status.plusSizes = [
        "US18",
        "US20",
        "US22",
        "US24",
        "US26",
        "US28",
        "US30",
        "Custom Size",
      ]),
      (this.switchBtns = this.querySelectorAll(".unit-switch")),
      this.formValidate(),
      this.buyBefor(),
      this.mobileVariantPicker(),
      this.updateOptions(),
      this.updateSizeChart(),
      !this.options.includes(this.status.customSize) &&
        this.querySelector('input[value="Custom Size"]') &&
        this.emptyCustomOpts(),
      this.updateMasterId(),
      (this.preOptions = this.currentVariant?.options),
      this.renderProductAjaxInfo(),
      this.renderProductInfo(),
      this.currentVariant
        ? this.updateAttribute(!1, !this.currentVariant.available)
        : this.updateAttribute(!0),
      this.updateVariantStatuses(),
      (this.isInitialized = !0);
  }
  onVariantChange(event) {
    if (!event.target.closest("fieldset")) return;
    (this.preOptions = this.currentVariant?.options), this.updateOptions();
    let curIndex = this.options.findIndex((option) =>
        this.status.plusSizes.includes(option)
      ),
      index = this.currentVariant?.options
        ? this.currentVariant.options.findIndex((option) =>
            this.status.plusSizes.includes(option)
          )
        : "undefined";
    if (
      event.target.name !== this.status.variantName ||
      (index !== "undefined" &&
        !(
          !this.currentVariant.options ||
          (index > -1 && curIndex > -1) ||
          (index === -1 && curIndex === -1)
        ))
    ) {
      let variantImg = this.currentVariant?.featured_image,
        variantMedia = document.querySelector("[data-variant-media]");
      variantMedia &&
        variantImg &&
        (variantMedia.firstElementChild.classList.add("loading"),
        variantMedia
          .querySelector("[data-loading-spinner]")
          .classList.remove("hidden"));
    }
    this.updteMobileVariant(),
      this.updateSizeChart(),
      !this.options.includes(this.status.customSize) &&
        this.querySelector('input[value="Custom Size"]') &&
        this.emptyCustomOpts(),
      this.options.includes(this.status.customSize) && this.customOptionToTop(),
      this.updateMasterId(),
      this.updatePickupAvailability(),
      this.updateVariantStatuses(),
      this.currentVariant
        ? (this.updateVariantInput(),
          this.updateMedia(event),
          this.updateURL(),
          this.renderProductAjaxInfo(),
          this.renderProductInfo(),
          this.updateAttribute(!1, !this.currentVariant.available),
          this.updateStickyAddToCart(!1, !this.currentVariant.available),
          this.checkQuantityWhenVariantChange())
        : (event.target.name === "Color" &&
            (this.updatePickerPopMedia(event), this.updateMediaGallery(event)),
          this.updateAttribute(!0),
          this.updateStickyAddToCart(!0));
  }
  updateOptions() {
    this.options = Array.from(
      this.querySelectorAll("select"),
      (select) => select.value
    );
  }
  decodeOptions() {
    this.options = this.options.map((option) => this.decodeOption(option));
  }
  decodeOption(option) {
    return option
      ? option
          .split("Special_Double_Quote")
          .join('"')
          .split("Special_Slash")
          .join("/")
      : null;
  }
  encodeOption(option) {
    return option
      ? option
          .split('"')
          .join("Special_Double_Quote")
          .split("/")
          .join("Special_Slash")
      : null;
  }
  updateMasterId() {
    this.decodeOptions(),
      (this.currentVariant = this.getVariantData().find(
        (variant) =>
          !variant.options
            .map((option, index) => this.options[index] === option)
            .includes(!1)
      ));
  }
  formValidate() {
    const options = document.querySelector(".dress_ul");
    if (!options) return;
    const checkbox = this.querySelector('[name="return_support_checkbox"]'),
      noticeBox = document.querySelector("[data-error-message]"),
      addToCart = document.querySelectorAll(
        "[data-btn-addtocart], [data-dynamic-checkout-wrapper], [data-variant-picker-submit]"
      );
    options.addEventListener("change", (event) => {
      this.checkValidate(event.target);
    }),
      checkbox.addEventListener("change", (event) => {
        addToCart.forEach((button) => {
          button.removeAttribute("disabled");
        }),
          noticeBox && (noticeBox.innerHTML = "");
      });
    const inputs = options.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("focus", (event) => {
        (this.querySelector(
          "[data-customize-option-desc]"
        ).innerHTML = `<span>${event.currentTarget.parentElement.previousElementSibling.innerHTML} </span>${event.currentTarget.parentElement.dataset.description}`),
          (event.currentTarget.closest(".label").nextElementSibling.innerHTML =
            ""),
          addToCart.forEach((button) => {
            button.removeAttribute("disabled");
          }),
          noticeBox && (noticeBox.innerHTML = "");
      });
    }),
      options.querySelectorAll("select").forEach((select) => {
        select.addEventListener("change", (event) => {
          this.querySelector(
            "[data-customize-option-desc]"
          ).innerHTML = `<span>${event.currentTarget.parentElement.previousElementSibling.innerHTML} </span>${event.currentTarget.parentElement.dataset.description}`;
        });
      }),
      inputs.forEach((input) => {
        input.addEventListener("blur", (event) => {
          (event.currentTarget.closest(".label").nextElementSibling.innerHTML =
            ""),
            event.currentTarget.value &&
              this.checkValidate(event.currentTarget);
        });
      });
  }
  buyBefor() {
    const purchaseBtns = document.querySelectorAll(
      "[data-btn-addtocart], [data-dynamic-checkout-wrapper], [data-variant-picker-submit]"
    );
    console.dir(purchaseBtns),
      purchaseBtns.forEach((button) => {
        button.addEventListener("mousedown", this.checkCustomOption.bind(this));
      }),
      purchaseBtns.forEach((button) => {
        button.addEventListener(
          "touchstart",
          this.checkCustomOption.bind(this)
        );
      });
  }
  checkCustomOption(event) {
    if (
      (event.preventDefault,
      event.stopPropagation(),
      !this.options.includes(this.status.customSize))
    )
      return;
    const noticeBox = document.querySelector("[data-error-message]"),
      forms = document.querySelectorAll('form[action="/cart/add"]'),
      customOpts = this.querySelectorAll(".dress_ul select"),
      checkbox = this.querySelector('[name="return_support_checkbox"]');
    this.generatorOption(this.switchBtns[0], this.status.unit, forms);
    let message = "";
    customOpts.forEach((option) => {
      option.value
        ? this.generatorOption(option, option.value, forms)
        : ((message += option.dataset.option + ", "),
          (event.currentTarget.disabled = !0));
    }),
      message &&
        (noticeBox.innerHTML =
          '<span class="error">Please Provide: ' +
          message.replace(/,\s*$/, "") +
          " </span>"),
      checkbox.checked ||
        (noticeBox.append(
          document.createTextNode(", Please accept our terms and conditions")
        ),
        (event.currentTarget.disabled = !0));
  }
  updteMobileVariant() {
    const mobileVariant = document.querySelector(
        "[data-mobile-variant-picker]"
      ),
      selectedColor = this.querySelector('input[name="Color"]:checked');
    if (!mobileVariant || !selectedColor) return;
    const swatches = mobileVariant.querySelectorAll(
        ".product-form__label .pattern"
      ),
      inputs = Array.from(this.querySelectorAll('input[name="Color"]'));
    let index = inputs.findIndex((input) => input.value == selectedColor.value);
    inputs.length > 8
      ? swatches.forEach((swatch) => {
          (swatch.style.cssText =
            inputs[index].nextElementSibling.firstElementChild.getAttribute(
              "style"
            )),
            index == inputs.length - 1 ? (index = 0) : (index += 1);
        })
      : (swatches.forEach((swatch) =>
          swatch.parentElement.classList.remove("selected")
        ),
        mobileVariant
          .querySelector(
            `[class="${selectedColor.nextElementSibling.firstElementChild.className}"]`
          )
          .parentElement.classList.add("selected"));
  }
  updateSizeChart() {
    const customTable = this.querySelector("[data-custom-size-box]"),
      sizeDetails = this.querySelector("#size_detail_show");
    !customTable ||
      !sizeDetails ||
      (this.options.includes(this.status.customSize)
        ? ((customTable.style.display = "block"),
          (sizeDetails.style.display = "none"))
        : ((customTable.style.display = "none"),
          (sizeDetails.style.display = "block"),
          sizeDetails.querySelectorAll("table").forEach((table) => {
            table.getAttribute("unit") == this.status.unit
              ? (table.style.display = "table")
              : (table.style.display = "none");
            const rows = Array.from(table.querySelectorAll("tbody tr"));
            let start = 0;
            rows.forEach((row, index) => {
              this.options.includes(row.getAttribute("size"))
                ? (index == 0
                    ? (start = 0)
                    : index == rows.length - 1
                    ? (start = index - 2)
                    : (start = index - 1),
                  row.classList.add("selected"))
                : ((row.style.display = "none"),
                  row.classList.remove("selected"));
            }),
              (rows[start].style.display = "table-row"),
              (rows[++start].style.display = "table-row"),
              (rows[++start].style.display = "table-row");
          })));
  }
  switchToggle() {
    const inchInputs = document.querySelectorAll(".dress_ul option.inch-option");
    const cmInputs = document.querySelectorAll(".dress_ul option.cm-option");
    const optionSelects = document.querySelectorAll(".dress_ul select");

    optionSelects.forEach((select) => {
          select.selectedIndex = 0;
    });

    this.switchBtns[0].classList.contains("left")
      ? (this.switchBtns.forEach((button) => {
          button.classList.remove("left"), button.classList.add("right");
        }),
        inchInputs.forEach((input) => {
          input.style.display = 'none'
        }),
        cmInputs.forEach((input) => {
          input.style.display = 'block'
        }),
        (this.status.unit = "cm"),
        this.querySelectorAll("[data-custom-size-box] .unit_item").forEach(
          (item) => (item.firstChild.nodeValue = "(cm)")
        ))
      : (this.switchBtns.forEach((button) => {
          button.classList.remove("right"), button.classList.add("left");
        }),
        inchInputs.forEach((input) => {
          input.style.display = 'block'
        }),
        cmInputs.forEach((input) => {
          input.style.display = 'none'
        }),
        (this.status.unit = "inch"),
        this.querySelectorAll("[data-custom-size-box] .unit_item").forEach(
          (item) => (item.firstChild.nodeValue = "(in)")
        )),
      this.updateSizeChart();
  }
  emptyCustomOpts() {
    const addToCart = document.querySelectorAll(
        "[data-btn-addtocart], [data-dynamic-checkout-wrapper], [data-variant-picker-submit]"
      ),
      noticeBox = document.querySelector("[data-error-message]"),
      forms = document.querySelectorAll('form[action="/cart/add"]'),
      customOpts = this.querySelectorAll(".dress_ul input, .dress_ul select");
    addToCart.forEach((button) => {
      button.removeAttribute("disabled");
    }),
      (noticeBox.innerHTML = ""),
      customOpts.forEach((option) => {
        option.value = "";
      }),
      forms.forEach((form) => {
        const unitInput = form.querySelector(
          `[name="${this.switchBtns[0].dataset.name}"]`
        );
        unitInput && unitInput.remove(),
          customOpts.forEach((option) => {
            const input = form.querySelector(`[name="${option.dataset.name}"]`);
            input && input.remove();
          });
      });
  }
  generatorOption(elem, value, forms) {
    forms.forEach((form) => {
      const input = form.querySelector(`[name="${elem.dataset.name}"]`);
      if (input) input.value = value;
      else {
        const input2 = document.createElement("input");
        (input2.type = "hidden"),
          (input2.name = elem.dataset.name),
          (input2.value = value),
          form.append(input2);
      }
    });
  }
  checkValidate(elem) {
    if (elem.tagName == "INPUT") {
      let range = elem
        .getAttribute("placeholder")
        .split(" - ")
        .map((str) => parseFloat(str));
      this.status.unit == "inch"
        ? range[0] > elem.value
          ? (elem.closest(
              ".label"
            ).nextElementSibling.innerHTML = `The minimum ${
              elem.dataset.option
            } measurement for all ${this.dataset.member} styles is ${
              range[0]
            } inches (${Math.round(range[0] * 2.54 * 100) / 100} cm).`)
          : range[1] < elem.value &&
            (elem.closest(
              ".label"
            ).nextElementSibling.innerHTML = `The maximum ${
              elem.dataset.option
            } measurement for all ${this.dataset.member} styles is ${
              range[1]
            } inches (${Math.round(range[1] * 2.54 * 100) / 100} cm).`)
        : range[0] > elem.value
        ? (elem.closest(".label").nextElementSibling.innerHTML = `The minimum ${
            elem.dataset.option
          } measurement for all ${this.dataset.member} styles is ${
            range[0]
          } cm (${Math.round((range[0] * 100) / 2.54) / 100} inches).`)
        : range[1] < elem.value &&
          (elem.closest(".label").nextElementSibling.innerHTML = `The maximum ${
            elem.dataset.option
          } measurement for all ${this.dataset.member} styles is ${
            range[1]
          } cm (${Math.round((range[1] * 100) / 2.54) / 100} inches).`);
    }
  }
  mobileVariantPicker() {
    const mbVarBtn = document.querySelector("[data-mobile-variant-picker]");
    if (!mbVarBtn) return;
    mbVarBtn.addEventListener("click", (event) => {
      event.preventDefault(),
        (window.customAction = "ADDTOCART"),
        (document.querySelector("[data-variant-picker-submit]").innerHTML =
          "ADD TO CART"),
        this.openVariantModal();
    }),
      window.addEventListener("resize", () => {
        if (window.matchMedia("(min-width: 768px)").matches) {
          const parent = document.querySelector(".productView-variants");
          parent &&
            !parent.querySelector("[data-product-variants-box]") &&
            parent.prepend(
              document.querySelector("[data-product-variants-box]")
            );
        }
      }),
      document
        .querySelector("[data-variant-media]")
        .firstElementChild.addEventListener("click", () => {
          document
            .querySelector('[data-image-gallery] [data-fancybox="images"]')
            .click();
        });
  }
  openVariantModal() {
    const pop = document.querySelector("#halo-product-variant-picker"),
      source = document.querySelector("[data-product-variants-box]"),
      estimate = document.querySelector(".estimate-time");
    pop.querySelector(".estimate-time") ||
      pop.querySelector(".halo-popup-content").prepend(estimate.cloneNode(!0)),
      pop.querySelector("[data-product-variants-box]") ||
        pop.querySelector(".halo-popup-content").prepend(source),
      document.body.classList.add("variant_picker_show");
  }
  updateMedia(event) {
    if (!(!this.currentVariant || !this.currentVariant?.featured_media))
      if (event.target.name === this.status.variantName) {
        let curIndex = this.options.findIndex((option) =>
            this.status.plusSizes.includes(option)
          ),
          index = this.preOptions
            ? this.preOptions.findIndex((option) =>
                this.status.plusSizes.includes(option)
              )
            : "undefined";
        index !== "undefined" &&
          !(
            (index > -1 && curIndex > -1) ||
            (index === -1 && curIndex === -1)
          ) &&
          (this.updatePickerPopMedia(event), this.updateMediaGallery(event));
      } else this.updatePickerPopMedia(event), this.updateMediaGallery(event);
  }
  updatePickerPopMedia(event) {
    if (!this.currentVariant && !this.getAvailableVariant()) return;
    let currentVar = this.currentVariant
        ? this.currentVariant
        : this.getAvailableVariant(),
      variantMedia = document.querySelector("[data-variant-media]");
    if (variantMedia) {
      let image = currentVar?.featured_image;
      if (image) {
        let variantImage = variantMedia.querySelector("img");
        variantImage.setAttribute("src", image.src + "&width=240"),
          variantImage.setAttribute("alt", image.alt),
          (variantImage.onload = () => {
            variantMedia.firstElementChild.classList.remove("loading"),
              variantMedia
                .querySelector("[data-loading-spinner]")
                .classList.add("hidden");
          });
      }
    }
  }
  updateMediaGallery(event) {
    let id =
      !this.currentVariant && event.target.name === "Color"
        ? this.getAvailableVariant().id
        : this.currentVariant.id;
    fetch(`${this.dataset.url}?variant=${id}&view=ajax_product_media`)
      .then((response) => response.text())
      .then((responseText) => {
        const source = new DOMParser()
            .parseFromString(responseText, "text/html")
            .querySelector("[data-ajax-content]"),
          destination = document.querySelector("[data-image-gallery]");
        source &&
          destination &&
          (destination.replaceWith(
            source.querySelector("[data-image-gallery]")
          ),
          window.galleryReinit($(".halo-productView")));
      });
  }
  getAvailableVariant() {
    let id;
    return (
      (id = this.variantData.find(
        (variant) => variant.options[0] == this.options[0] && variant.available
      )),
      id
    );
  }
  customOptionToTop() {
    let parent = this.parentElement,
      label = this.querySelector('input[value="Custom Size"] + label'),
      toTop = label.offsetTop + label.closest("fieldset").offsetTop;
    parent.scrollTo({ top: toTop, behavior: "smooth" });
  }
  updateURL() {
    this.currentVariant &&
      window.history.replaceState(
        {},
        "",
        `${this.dataset.url}?variant=${this.currentVariant.id}`
      );
  }
  updateVariantInput() {
    document
      .querySelectorAll(
        `#product-form-${this.dataset.product}, #product-form-installment-${this.dataset.product}`
      )
      .forEach((productForm) => {
        const input = productForm.querySelector('input[name="id"]');
        (input.value = this.currentVariant.id),
          input.dispatchEvent(new Event("change", { bubbles: !0 }));
      });
  }
  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector("pickup-availability");
    pickUpAvailability &&
      (this.currentVariant?.available
        ? pickUpAvailability.fetchAvailability(this.currentVariant.id)
        : (pickUpAvailability.removeAttribute("available"),
          (pickUpAvailability.innerHTML = "")));
  }
  renderProductAjaxInfo() {
    fetch(
      `${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`
    )
      .then((response) => response.text())
      .then((responseText) => {
        const id = `product-price-${this.dataset.product}`,
          html = new DOMParser().parseFromString(responseText, "text/html"),
          destination = document.getElementById(id),
          sourceId = html.querySelector("[data-product]").dataset.product,
          source = html.getElementById(`product-price-${sourceId}`),
          property = `product-property-${this.dataset.product}`,
          destinationProperty = document.getElementById(property),
          sourceProperty = html.getElementById( `product-property-${sourceId}`);
        source && destination && (destination.innerHTML = source.innerHTML);
        const virantPrice = document.querySelector("[data-product-price]"),
          htmlPrice = html.querySelector("[data-product-price]");
        if (
          (virantPrice &&
            htmlPrice &&
            (virantPrice.innerHTML = htmlPrice.innerHTML),
          this.checkNeedToConvertCurrency())
        ) {
          let currencyCode = document
            .getElementById("currencies")
            ?.querySelector(".active")
            ?.getAttribute("data-currency");
          Currency.convertAll(
            window.shop_currency,
            currencyCode,
            "span.money",
            "money_format"
          );
        }
        if (
          (destinationProperty
            ? sourceProperty
              ? ((destinationProperty.innerHTML = sourceProperty.innerHTML),
                (destinationProperty.style.display = "table"))
              : (destinationProperty.style.display = "none")
            : sourceProperty &&
              document
                .querySelector(".productView-product")
                .insertBefore(
                  sourceProperty,
                  document.querySelector(".productView-options")
                ),
          document
            .getElementById(`product-price-${this.dataset.product}`)
            ?.classList.remove("visibility-hidden"),
          !this.isInitialized)
        )
          return;
        const description = `[data-product-description-${this.dataset.product}]`,
          destinationDesc = document.querySelector(description),
          sourceDesc = html.querySelector(description);
        sourceDesc &&
          destinationDesc &&
          ((destinationDesc.innerHTML = sourceDesc.innerHTML),
          destinationDesc.closest(".toggle-content--height") &&
            (destinationDesc.style.maxHeight = null));
      });
  }
  renderProductInfo() {
    this.item.find("[data-sku]").length > 0 &&
      this.item
        .find("[data-sku] .productView-info-value")
        .text(this.currentVariant.sku);
    var inventory = this.currentVariant?.inventory_management;
    if (inventory != null) {
      var arrayInVarName = `product_inven_array_${this.dataset.product}`,
        inven_array = window[arrayInVarName];
      if (inven_array != null) {
        var inven_num = inven_array[this.currentVariant.id],
          inventoryQuantity = parseInt(inven_num);
        this.item
          .find('input[name="quantity"]')
          .attr("data-inventory-quantity", inventoryQuantity),
          this.item.find("[data-inventory]").length > 0 &&
            (inventoryQuantity > 0
              ? this.item.find("[data-inventory]").data("stock-level") == "show"
                ? this.item
                    .find("[data-inventory] .productView-info-value")
                    .text(
                      inventoryQuantity + " " + window.inventory_text.inStock
                    )
                : this.item
                    .find("[data-inventory] .productView-info-value")
                    .text(window.inventory_text.inStock)
              : this.item
                  .find("[data-inventory] .productView-info-value")
                  .text(window.inventory_text.outOfStock)),
          hotStock(inventoryQuantity);
      }
    }
    this.item.find(".productView-stickyCart").length > 0 &&
      this.item
        .find(".productView-stickyCart")
        .find(".select__select")
        .val(this.currentVariant.id);
  }
  updateAttribute(unavailable = !0, disable = !0) {
    const addButton = document
      .getElementById(`product-form-${this.dataset.product}`)
      ?.querySelector('[name="add"]');
    var quantityInput = this.item.find('input[name="quantity"]'),
      notifyMe = this.item.find(".productView-notifyMe"),
      hotStock2 = this.item.find(".productView-hotStock"),
      buttonAddtocart = this.item.find(".product-form__submit"),
      maxValue = parseInt(quantityInput.attr("data-inventory-quantity"));
    if (
      (isNaN(maxValue)
        ? (maxValue = maxValue =
            parseInt(buttonAddtocart.attr("data-inventory-quantity")))
        : (maxValue = parseInt(quantityInput.attr("data-inventory-quantity"))),
      unavailable)
    ) {
      var text = window.variantStrings.unavailable;
      quantityInput.attr("disabled", !0),
        notifyMe.slideUp("slow"),
        addButton.setAttribute("disabled", !0),
        (addButton.textContent = text),
        quantityInput.closest("quantity-input").addClass("disabled"),
        hotStock2.length > 0 && hotStock2.addClass("is-hiden");
    } else if (disable) {
      var text = window.variantStrings.soldOut,
        subTotal = 0,
        price = this.currentVariant?.price;
      const stickyPrice = $("[data-sticky-add-to-cart] .money-subtotal .money"),
        stickyComparePrice = $(
          "[data-sticky-add-to-cart] .money-compare-price .money"
        );
      if (window.subtotal.show) {
        (subTotal = quantityInput.val() * price),
          (subTotal = Shopify.formatMoney(subTotal, window.money_format)),
          (subTotal = extractContent(subTotal));
        const moneySpan = document.createElement("span");
        if (
          (moneySpan.classList.add(
            window.currencyFormatted ? "money" : "money-subtotal"
          ),
          (moneySpan.innerText = subTotal),
          document.body.appendChild(moneySpan),
          this.checkNeedToConvertCurrency())
        ) {
          let currencyCode = document
            .getElementById("currencies")
            ?.querySelector(".active")
            ?.getAttribute("data-currency");
          Currency.convertAll(
            window.shop_currency,
            currencyCode,
            "span.money",
            "money_format"
          );
        }
        if (
          ((subTotal = moneySpan.innerText),
          $(moneySpan).remove(),
          window.subtotal.style == "1")
        ) {
          const pdView_subTotal =
            document.querySelector(".productView-subtotal .money") ||
            document.querySelector(".productView-subtotal .money-subtotal");
          pdView_subTotal != null && (pdView_subTotal.textContent = subTotal);
        } else
          window.subtotal.style == "2" &&
            (text = window.subtotal.text.replace("[value]", subTotal));
      } else
        (subTotal = Shopify.formatMoney(price, window.money_format)),
          (subTotal = extractContent(subTotal));
      quantityInput.attr("data-price", this.currentVariant?.price),
        quantityInput.attr("disabled", !0),
        addButton.setAttribute("disabled", !0),
        (addButton.textContent = text),
        quantityInput.closest("quantity-input").addClass("disabled"),
        subTotal != 0 && stickyPrice.length && stickyPrice.text(subTotal);
      const thisStickyPrice = $("[data-sticky-add-to-cart] .sticky-price"),
        thisComparePrice = $("[data-sticky-add-to-cart] .money-compare-price"),
        compare_at_price = this.currentVariant?.compare_at_price;
      if (
        (compare_at_price
          ? (thisStickyPrice.addClass("has-compare-price"),
            thisComparePrice.length
              ? thisComparePrice.attr("data-compare-price", compare_at_price)
              : thisStickyPrice.prepend(
                  `<s class="money-compare-price" data-compare-price="${compare_at_price}"><span class="money"></span></s>`
                ))
          : (thisStickyPrice.removeClass("has-compare-price"),
            thisComparePrice.remove()),
        subTotal != 0 && stickyComparePrice.length && window.subtotal.show)
      ) {
        let comparePrice = $(
          "[data-sticky-add-to-cart] .money-compare-price"
        ).data("compare-price");
        (comparePrice = quantityInput.val() * comparePrice),
          (comparePrice = Shopify.formatMoney(
            comparePrice,
            window.money_format
          )),
          (comparePrice = extractContent(comparePrice)),
          stickyComparePrice.text(comparePrice);
      }
      notifyMe.length > 0 &&
        (notifyMe
          .find(".halo-notify-product-variant")
          .val(this.currentVariant.title),
        notifyMe.find(".notifyMe-text").empty(),
        notifyMe.slideDown("slow"));
    } else {
      var text,
        subTotal = 0,
        price = this.currentVariant?.price;
      const stickyPrice = $("[data-sticky-add-to-cart] .money-subtotal .money");
      if (window.subtotal.show) {
        (subTotal = quantityInput.val() * price),
          (subTotal = Shopify.formatMoney(subTotal, window.money_format)),
          (subTotal = extractContent(subTotal));
        const moneySpan = document.createElement("span");
        if (
          (moneySpan.classList.add(
            window.currencyFormatted ? "money" : "money-subtotal"
          ),
          (moneySpan.innerText = subTotal),
          document.body.appendChild(moneySpan),
          this.checkNeedToConvertCurrency())
        ) {
          let currencyCode = document
            .getElementById("currencies")
            ?.querySelector(".active")
            ?.getAttribute("data-currency");
          Currency.convertAll(
            window.shop_currency,
            currencyCode,
            "span.money",
            "money_format"
          );
        }
        if (
          ((subTotal = moneySpan.innerText),
          $(moneySpan).remove(),
          window.subtotal.style == "1")
        ) {
          const pdView_subTotal =
            document.querySelector(".productView-subtotal .money") ||
            document.querySelector(".productView-subtotal .money-subtotal");
          pdView_subTotal != null && (pdView_subTotal.textContent = subTotal),
            this.currentVariant.available &&
            maxValue <= 0 &&
            this.currentVariant.inventory_management == "shopify"
              ? (text = window.variantStrings.preOrder)
              : (text = window.variantStrings.addToCart);
        } else
          window.subtotal.style == "2" &&
            (text = window.subtotal.text.replace("[value]", subTotal));
      } else
        (subTotal = Shopify.formatMoney(price, window.money_format)),
          (subTotal = extractContent(subTotal)),
          this.currentVariant.available &&
          maxValue <= 0 &&
          this.currentVariant.inventory_management == "shopify"
            ? (text = window.variantStrings.preOrder)
            : (text = window.variantStrings.addToCart);
      quantityInput.attr("data-price", this.currentVariant?.price),
        quantityInput.attr("disabled", !1),
        addButton.removeAttribute("disabled"),
        (addButton.textContent = text),
        quantityInput.closest("quantity-input").removeClass("disabled"),
        subTotal != 0 && stickyPrice.length && stickyPrice.text(subTotal);
      const thisStickyPrice = $("[data-sticky-add-to-cart] .sticky-price"),
        thisComparePrice = $("[data-sticky-add-to-cart] .money-compare-price"),
        compare_at_price = this.currentVariant?.compare_at_price;
      compare_at_price
        ? (thisStickyPrice.addClass("has-compare-price"),
          thisComparePrice.length
            ? thisComparePrice.attr("data-compare-price", compare_at_price)
            : thisStickyPrice.prepend(
                `<s class="money-compare-price" data-compare-price="${compare_at_price}"><span class="money"></span></s>`
              ))
        : (thisStickyPrice.removeClass("has-compare-price"),
          thisComparePrice.remove());
      const stickyComparePrice = $(
        "[data-sticky-add-to-cart] .money-compare-price .money"
      );
      if (subTotal != 0 && stickyComparePrice.length && window.subtotal.show) {
        let comparePrice = $(
          "[data-sticky-add-to-cart] .money-compare-price"
        ).data("compare-price");
        (comparePrice = quantityInput.val() * comparePrice),
          (comparePrice = Shopify.formatMoney(
            comparePrice,
            window.money_format
          )),
          (comparePrice = extractContent(comparePrice)),
          stickyComparePrice.text(comparePrice);
      }
      notifyMe.length > 0 && notifyMe.slideUp("slow");
    }
  }
  updateStickyAddToCart(unavailable = !0, disable = !0) {
    if (this.item.find(".productView-stickyCart").length > 0) {
      const sticky = this.item.find(".productView-stickyCart"),
        itemImage = sticky.find(".sticky-image"),
        option = sticky.find(".select__select"),
        input = document
          .getElementById(`product-form-sticky-${this.dataset.product}`)
          ?.querySelector('input[name="id"]'),
        button = document
          .getElementById(`product-form-sticky-${this.dataset.product}`)
          ?.querySelector('[name="add"]');
      var quantityInput = this.item.find('input[name="quantity"]'),
        maxValue = parseInt(quantityInput.attr("data-inventory-quantity"));
      if (unavailable) {
        var text = window.variantStrings.unavailable;
        button.setAttribute("disabled", !0), (button.textContent = text);
      } else {
        if (!this.currentVariant) return;
        const image = this.currentVariant?.featured_image;
        if (
          (image != null &&
            itemImage
              .find("img")
              .attr({ src: image.src, srcset: image.src, alt: image.alt }),
          option.val(this.currentVariant.id),
          disable)
        ) {
          var text = window.variantStrings.soldOut;
          button.setAttribute("disabled", !0), (button.textContent = text);
        } else
          this.currentVariant.available &&
          maxValue <= 0 &&
          this.currentVariant.inventory_management == "shopify"
            ? (text = window.variantStrings.preOrder)
            : (text = window.variantStrings.addToCart),
            button.removeAttribute("disabled"),
            (button.textContent = text);
        (input.value = this.currentVariant.id),
          input.dispatchEvent(new Event("change", { bubbles: !0 }));
      }
    }
  }
  getVariantData() {
    return (
      (this.variantData =
        this.variantData ||
        JSON.parse(
          this.querySelector('[type="application/json"]').textContent
        )),
      this.variantData
    );
  }
  checkNeedToConvertCurrency() {
    var currencyItem = $(".dropdown-item[data-currency]");
    if (currencyItem.length)
      return (
        (window.show_multiple_currencies &&
          Currency.currentCurrency != shopCurrency) ||
        window.show_auto_currency
      );
  }
  checkQuantityWhenVariantChange() {
    var quantityInput = document
        .querySelector(".productView-details")
        .querySelector("input.quantity__input"),
      maxValue = parseInt(quantityInput?.dataset.inventoryQuantity),
      inputValue = parseInt(quantityInput?.value);
    let value = inputValue;
    inputValue > maxValue && maxValue > 0
      ? (value = maxValue)
      : (value = inputValue),
      (value < 1 || isNaN(value)) && (value = 1),
      quantityInput && (quantityInput.value = value),
      (document.getElementById("product-add-to-cart").dataset.available =
        this.currentVariant.available && maxValue <= 0);
  }
  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
        (variant) => this.querySelector(":checked").value === variant.option1
      ),
      inputWrappers = [...this.querySelectorAll(".product-form__input")],
      inputLength = inputWrappers.length;
    inputWrappers.forEach((option, index) => {
      if (
        (option
          .querySelectorAll("[data-header-option]")
          .forEach(
            (selected) =>
              (selected.innerText = option.querySelector(":checked").value)
          ),
        index === 0 && inputLength > 1)
      )
        return;
      const optionInputs = [
          ...option.querySelectorAll('input[type="radio"], option'),
        ],
        previousOptionSelected =
          inputLength > 1
            ? inputWrappers[index - 1].querySelector(":checked").value
            : inputWrappers[index].querySelector(":checked").value,
        optionInputsValue =
          inputLength > 1
            ? selectedOptionOneVariants
                .filter(
                  (variant) =>
                    variant[`option${index}`] === previousOptionSelected
                )
                .map((variantOption) => variantOption[`option${index + 1}`])
            : this.variantData.map(
                (variantOption) => variantOption[`option${index + 1}`]
              ),
        availableOptionInputsValue =
          inputLength > 1
            ? selectedOptionOneVariants
                .filter(
                  (variant) =>
                    variant.available &&
                    variant[`option${index}`] === previousOptionSelected
                )
                .map((variantOption) => variantOption[`option${index + 1}`])
            : this.variantData
                .filter((variant) => variant.available)
                .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(
        optionInputs,
        optionInputsValue,
        availableOptionInputsValue
      );
    });
  }
  setInputAvailability(
    optionInputs,
    optionInputsValue,
    availableOptionInputsValue
  ) {
    optionInputs.forEach((input) => {
      availableOptionInputsValue.includes(input.getAttribute("value"))
        ? (input.classList.remove("soldout"),
          (input.innerText = input.getAttribute("value")))
        : (input.classList.add("soldout"),
          optionInputsValue.includes(input.getAttribute("value"))
            ? (input.innerText = input.getAttribute("value") + " (Sold out)")
            : (input.innerText =
                window.variantStrings.unavailable_with_option.replace(
                  "[value]",
                  input.getAttribute("value")
                )));
    });
  }
}
customElements.define("variant-selects", VariantSelects);
class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }
  mobileVariantPicker() {
    super.mobileVariantPicker();
    const mbVarBtn = document.querySelector("[data-mobile-variant-picker]");
    if (!mbVarBtn) return;
      this.querySelector("[data-show-all-colors-btn]").addEventListener(
        "click",
        (event) => {
          event.preventDefault(),
            event.currentTarget.previousElementSibling.classList.toggle(
              "show-more"
            );
        }
      );
  }
  setInputAvailability(
    optionInputs,
    optionInputsValue,
    availableOptionInputsValue
  ) {
    optionInputs.forEach((input) => {
      if (availableOptionInputsValue.includes(input.getAttribute("value")))
        input.nextElementSibling.classList.remove("soldout", "unavailable"),
          input.nextElementSibling.classList.add("available");
      else if (
        (input.nextElementSibling.classList.remove("available", "unavailable"),
        input.nextElementSibling.classList.add("soldout"),
        window.variantStrings.hide_variants_unavailable &&
          !optionInputsValue.includes(input.getAttribute("value")))
      ) {
        if (
          (input.nextElementSibling.classList.add("unavailable"),
          !input.checked)
        )
          return;
        let inputsValue;
        availableOptionInputsValue.length > 0
          ? (inputsValue = availableOptionInputsValue)
          : (inputsValue = optionInputsValue),
          (input
            .closest(".product-form__input")
            .querySelector(`input[value="${inputsValue[0]}"]`).checked = !0),
          this.dispatchEvent(new Event("change"));
      }
    });
  }
  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll("fieldset"));
    this.options = fieldsets.map(
      (fieldset) =>
        Array.from(fieldset.querySelectorAll("input")).find(
          (radio) => radio.checked
        ).value
    );
  }
}
customElements.define("variant-radios", VariantRadios);
class CombieVariants extends VariantRadios {
  constructor() {
    super();
  }
  async onVariantInit() {
    (this.status = Object.create({})),
      (this.status.variantName = "Size"),
      (this.status.customSize = "Custom Size"),
      (this.status.unit = "inch"),
      (this.status.plusSizes = [
        "US18",
        "US20",
        "US22",
        "US24",
        "US26",
        "US28",
        "US30",
        "Custom Size",
      ]),
      (this.switchBtns = this.querySelectorAll(".unit-switch")),
      this.formValidate(),
      this.buyBefor(),
      this.mobileVariantPicker(),
      this.updateOptions(),
      this.updateSizeChart(),
      !this.options.includes(this.status.customSize) &&
        this.querySelector('input[value="Custom Size"]') &&
        this.emptyCustomOpts(),
      await this.updateMasterId(),
      this.renderProductAjaxInfo(),
      this.renderProductInfo(),
      this.currentVariant
        ? this.updateAttribute(!1, !this.currentVariant.available)
        : this.updateAttribute(!0),
      this.updateVariantStatuses();
  }
  async onVariantChange(event) {
    if (!event.target.closest("fieldset")) return;
    (this.preOptions = this.currentVariant?.options), this.updateOptions();
    let curIndex = this.options.findIndex((option) =>
        this.status.plusSizes.includes(option)
      ),
      index = this.currentVariant?.options
        ? this.currentVariant.options.findIndex((option) =>
            this.status.plusSizes.includes(option)
          )
        : "undefined";
    if (
      event.target.name !== this.status.variantName ||
      (index !== "undefined" &&
        !(
          !this.currentVariant.options ||
          (index > -1 && curIndex > -1) ||
          (index === -1 && curIndex === -1)
        ))
    ) {
      let variantImg = this.currentVariant?.featured_image,
        variantMedia = document.querySelector("[data-variant-media]");
      variantMedia &&
        variantImg &&
        (variantMedia.firstElementChild.classList.add("loading"),
        variantMedia
          .querySelector("[data-loading-spinner]")
          .classList.remove("hidden"));
    }
    this.updteMobileVariant(),
      this.updateSizeChart(),
      !this.options.includes(this.status.customSize) &&
        this.querySelector('input[value="Custom Size"]') &&
        this.emptyCustomOpts(),
      this.options.includes(this.status.customSize) && this.customOptionToTop(),
      await this.updateMasterId(),
      this.updatePickupAvailability(),
      this.updateVariantStatuses(),
      this.currentVariant
        ? (this.updateVariantInput(),
          this.updateMedia(event),
          this.updateURL(),
          this.renderProductAjaxInfo(),
          this.renderProductInfo(),
          this.updateAttribute(!1, !this.currentVariant.available),
          this.updateStickyAddToCart(!1, !this.currentVariant.available),
          this.checkQuantityWhenVariantChange())
        : (this.updateAttribute(!0), this.updateStickyAddToCart(!0));
  }
  setInputAvailability(
    optionInputs,
    optionInputsValue,
    availableOptionInputsValue
  ) {
    let unavailableOptionInputsValue = optionInputsValue.filter(
      (value) => availableOptionInputsValue.indexOf(value) == -1
    );
    optionInputs.forEach((input) => {
      if (unavailableOptionInputsValue.includes(input.getAttribute("value"))) {
        if (
          (input.nextElementSibling.classList.remove(
            "available",
            "unavailable"
          ),
          input.nextElementSibling.classList.add("soldout"),
          window.variantStrings.hide_variants_unavailable &&
            !optionInputsValue.includes(input.getAttribute("value")))
        ) {
          if (
            (input.nextElementSibling.classList.add("unavailable"),
            !input.checked)
          )
            return;
          let inputsValue;
          availableOptionInputsValue.length > 0
            ? (inputsValue = availableOptionInputsValue)
            : (inputsValue = optionInputsValue),
            (input
              .closest(".product-form__input")
              .querySelector(`input[value="${inputsValue[0]}"]`).checked = !0),
            this.dispatchEvent(new Event("change"));
        }
      } else
        input.nextElementSibling.classList.remove("soldout", "unavailable"),
          input.nextElementSibling.classList.add("available");
    });
  }
  updateMedia(event) {
    if (!this.currentVariant || !this.productImages) return;
    if (event.target.name === this.status.variantName) {
      let curIndex = this.options.findIndex((option) =>
          this.status.plusSizes.includes(option)
        ),
        index = this.preOptions
          ? this.preOptions.findIndex((option) =>
              this.status.plusSizes.includes(option)
            )
          : "undefined";
      index !== "undefined" &&
        !((index > -1 && curIndex > -1) || (index === -1 && curIndex === -1)) &&
        (this.updatePickerPopMedia(), this.updateMediaGallery());
    } else this.updatePickerPopMedia(), this.updateMediaGallery();
    const mediaToReplace = document.querySelector(
      '.productView-image[data-index="1"]'
    );
  }
  updatePickerPopMedia() {
    let variantMedia = document.querySelector("[data-variant-media]");
    if (variantMedia) {
      let image = this.currentVariant.featured_image
        ? this.currentVariant.featured_image
        : this.productImages[0];
      if (image) {
        let variantImage = variantMedia.querySelector("img");
        variantImage.setAttribute("src", image.src + "&width=240"),
          variantImage.setAttribute("alt", image.alt),
          (variantImage.onload = () => {
            variantMedia.firstElementChild.classList.remove("loading"),
              variantMedia
                .querySelector("[data-loading-spinner]")
                .classList.add("hidden");
          });
      }
    }
  }
  async updateMediaGallery() {
    let handle;
    this.querySelector('input[name="Size"]')
      ? (handle = this.productData.find(
          (item) =>
            item.options.color == this.options[0] &&
            item.options.size.includes(this.options[1])
        ).handle)
      : (handle = this.productData.find(
          (item) => item.options.color == this.options[0]
        ).handle);
    let responseText = await (
        await fetch(`/products/${handle}?view=ajax_product_media`)
      ).text(),
      element = new DOMParser().parseFromString(responseText, "text/html");
    const source = document.querySelector("[data-image-gallery]");
    source &&
      (source.replaceWith(element.querySelector("[data-image-gallery]")),
      window.haloTool.initProductView($(".halo-productView")));
  }
  async updateMasterId() {
    this.decodeOptions();
    let result = await this.getVariantData();
    result
      ? (this.currentVariant = result.find(
          (variant) =>
            !variant.options
              .map((option, index) => this.options[index] === option)
              .includes(!1)
        ))
      : (this.currentVariant = null);
  }
  async getVariantData() {
    this.productData =
      this.productData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    let handle;
    this.querySelector('input[name="Size"]')
      ? (handle = this.productData.find(
          (item) =>
            item.options.color == this.options[0] &&
            item.options.size.includes(this.options[1])
        ).handle)
      : (handle = this.productData.find(
          (item) => item.options.color == this.options[0]
        ).handle),
      this.setAttribute("data-url", `/products/${handle}`);
    let data = await this.getProductJson(handle);
    return (
      (this.productImages = data.images),
      data ? (this.variantData = data.variants) : (this.variantData = null),
      this.variantData
    );
  }
  async getProductJson(handle) {
    try {
      return await (await fetch(`/products/${handle}.js`)).json();
    } catch (error) {
      console.log(error);
      return;
    }
  }
}
customElements.define("combie-variants", CombieVariants);
class QuantityInput extends HTMLElement {
  constructor() {
    super(),
      (this.input = this.querySelector("input")),
      (this.changeEvent = new Event("change", { bubbles: !0 })),
      this.input.addEventListener("change", this.onInputChange.bind(this)),
      this.querySelectorAll("button").forEach((button) =>
        button.addEventListener("click", this.onButtonClick.bind(this))
      ),
      this.checkHasMultipleVariants() ||
        (this.initProductQuantity(), this.checkVariantInventory());
  }
  onInputChange(event) {
    event.preventDefault();
    var inputValue = this.input.value,
      maxValue = parseInt(this.input.dataset.inventoryQuantity),
      currentId = document
        .getElementById(`product-form-${this.input.dataset.product}`)
        ?.querySelector('[name="id"]')?.value,
      saleOutStock =
        document.getElementById("product-add-to-cart").dataset.available ===
          "true" || !1;
    const addButton = document
      .getElementById(`product-form-${this.input.dataset.product}`)
      ?.querySelector('[name="add"]');
    if (
      (inputValue < 1 && ((inputValue = 1), (this.input.value = inputValue)),
      inputValue > maxValue && !saleOutStock && maxValue > 0)
    ) {
      var arrayInVarName = `selling_array_${this.input.dataset.product}`,
        itemInArray = window[arrayInVarName],
        itemStatus = itemInArray[currentId];
      if (itemStatus == "deny") {
        (inputValue = maxValue), (this.input.value = inputValue);
        const message = getInputMessage(maxValue);
        showWarning(message, 3e3);
      }
    } else
      inputValue > maxValue &&
        saleOutStock &&
        maxValue <= 0 &&
        (this.input.value = inputValue);
    if (window.subtotal.show) {
      var text,
        price = this.input.dataset.price,
        subTotal = 0,
        parser = new DOMParser();
      (subTotal = inputValue * price),
        (subTotal = Shopify.formatMoney(subTotal, window.money_format)),
        (subTotal = extractContent(subTotal));
      const moneySpan = document.createElement("span");
      if (
        (moneySpan.classList.add(
          window.currencyFormatted ? "money" : "money-subtotal"
        ),
        (moneySpan.innerText = subTotal),
        document.body.appendChild(moneySpan),
        this.checkNeedToConvertCurrency())
      ) {
        let currencyCode = document
          .getElementById("currencies")
          ?.querySelector(".active")
          ?.getAttribute("data-currency");
        Currency.convertAll(
          window.shop_currency,
          currencyCode,
          "span.money",
          "money_format"
        );
      }
      if (
        ((subTotal = moneySpan.innerText),
        $(moneySpan).remove(),
        window.subtotal.style == "1")
      ) {
        const pdView_subTotal =
          document.querySelector(".productView-subtotal .money") ||
          document.querySelector(".productView-subtotal .money-subtotal");
        pdView_subTotal.textContent = subTotal;
      } else
        window.subtotal.style == "2" &&
          ((text = window.subtotal.text.replace("[value]", subTotal)),
          (addButton.textContent = text));
      const stickyPrice = $("[data-sticky-add-to-cart] .money-subtotal .money"),
        stickyComparePrice = $(
          "[data-sticky-add-to-cart] .money-compare-price .money"
        );
      if (
        (stickyPrice.length && stickyPrice.text(subTotal),
        stickyComparePrice.length && window.subtotal.show)
      ) {
        let comparePrice = $(
          "[data-sticky-add-to-cart] .money-compare-price"
        ).data("compare-price");
        (comparePrice = inputValue * comparePrice),
          (comparePrice = Shopify.formatMoney(
            comparePrice,
            window.money_format
          )),
          (comparePrice = extractContent(comparePrice)),
          stickyComparePrice.text(comparePrice);
      }
    }
    if (
      this.classList.contains("quantity__group--2") ||
      this.classList.contains("quantity__group--3")
    ) {
      const mainQty = document.querySelector(
        ".quantity__group--1 .quantity__input"
      );
      mainQty.value = inputValue;
      const mainQty2Exists = !!document.querySelector(
          ".quantity__group--2 .quantity__input"
        ),
        mainQty3Exists = !!document.querySelector(
          ".quantity__group--3 .quantity__input"
        );
      if (this.classList.contains("quantity__group--2") && mainQty3Exists) {
        const mainQty3 = document.querySelector(
          ".quantity__group--3 .quantity__input"
        );
        mainQty3.value = inputValue;
      } else if (
        this.classList.contains("quantity__group--3") &&
        mainQty2Exists
      ) {
        const mainQty2 = document.querySelector(
          ".quantity__group--2 .quantity__input"
        );
        mainQty2.value = inputValue;
      }
    }
  }
  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    event.target.name === "plus" ? this.input.stepUp() : this.input.stepDown(),
      previousValue !== this.input.value &&
        this.input.dispatchEvent(this.changeEvent);
  }
  checkNeedToConvertCurrency() {
    return (
      (window.show_multiple_currencies &&
        Currency.currentCurrency != shopCurrency) ||
      window.show_auto_currency
    );
  }
  checkHasMultipleVariants() {
    const arrayInVarName = `product_inven_array_${
      this.querySelector("[data-product]").dataset.product
    }`;
    return (
      (this.inven_array = window[arrayInVarName]),
      Object.keys(this.inven_array).length > 1
    );
  }
  initProductQuantity() {
    if (this.inven_array != null) {
      var inven_num = Object.values(this.inven_array),
        inventoryQuantity = parseInt(inven_num);
      this.querySelector('input[name="quantity"]').setAttribute(
        "data-inventory-quantity",
        inventoryQuantity
      ),
        (this.querySelector(
          'input[name="quantity"]'
        ).dataset.inventoryQuantity = inventoryQuantity);
    }
  }
  checkVariantInventory() {
    const addBtn = document.getElementById("product-add-to-cart");
    (this.input.disabled = addBtn.disabled),
      (this.querySelector(".btn-quantity.minus").disabled = addBtn.disabled),
      (this.querySelector(".btn-quantity.plus").disabled = addBtn.disabled);
  }
  getVariantData() {
    return (
      (this.variantData =
        this.variantData ||
        JSON.parse(
          document.querySelector('.product-option [type="application/json"]')
            .textContent
        )),
      this.variantData
    );
  }
}
customElements.define("quantity-input", QuantityInput);
function hotStock(inventoryQuantity) {
  const hotStock2 = document
    .querySelector(".productView")
    .querySelector(".productView-hotStock");
  if (hotStock2) {
    let hotStockText = hotStock2.querySelector(".hotStock-text"),
      maxStock = parseFloat(hotStock2.dataset.hotStock),
      textStock;
    if (
      (inventoryQuantity > 0 && inventoryQuantity <= maxStock
        ? (hotStock2.matches(".style-2")
            ? (textStock = window.inventory_text.hotStock2.replace(
                "[inventory]",
                inventoryQuantity
              ))
            : (textStock = window.inventory_text.hotStock.replace(
                "[inventory]",
                inventoryQuantity
              )),
          hotStockText && (hotStockText.innerHTML = textStock),
          hotStock2.classList.remove("is-hide"))
        : hotStock2.classList.add("is-hide"),
      hotStock2.matches(".style-2"))
    ) {
      const invenProgress = (inventoryQuantity / maxStock) * 100,
        hotStockProgressItem = hotStock2.querySelector(
          ".hotStock-progress-item"
        );
      hotStockProgressItem &&
        (hotStockProgressItem.style.width = `${invenProgress}%`);
    }
  }
}
const hotStockNoOptions = document.querySelector(
  ".productView .productView-hotStock[data-current-inventory]"
);
if (hotStockNoOptions) {
  const inventoryQuantity = parseFloat(
    hotStockNoOptions.dataset.currentInventory
  );
  hotStock(inventoryQuantity);
}
function showWarning(content, time = null) {
  window.warningTimeout && clearTimeout(window.warningTimeout);
  const warningPopupContent = document
    .getElementById("halo-warning-popup")
    .querySelector("[data-halo-warning-content]");
  (warningPopupContent.textContent = content),
    document.body.classList.add("has-warning"),
    time &&
      (window.warningTimeout = setTimeout(() => {
        document.body.classList.remove("has-warning");
      }, time));
}
function getInputMessage(maxValue) {
  var message = window.cartStrings.addProductOutQuantity.replace(
    "[maxQuantity]",
    maxValue
  );
  return message;
}
//# sourceMappingURL=/cdn/shop/t/43/assets/variants.js.map?v=119128650934413583751712907222
