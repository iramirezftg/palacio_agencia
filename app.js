/**
 * PALACIO IMAGEN & PUBLICIDAD - CORE LOGIC & INTERACTIVE FEATURES
 * Durango, México
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initCalculator();
  initGallery();
  initFaqAccordion();
  initContactForm();
  initFloatingWa();
  initPrintModal();
  updateCurrentYear();
});

/* ===================================================================
   1. HEADER SCROLL & MOBILE MENU
   =================================================================== */
function initHeader() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function initMobileNav() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileDrawer');
  const closeBtn = document.getElementById('closeMobileDrawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!drawer) return;

  const closeMenu = () => {
    if (toggleBtn) toggleBtn.classList.remove('active');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active');
      drawer.classList.toggle('open');
      document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ===================================================================
   2. INTERACTIVE PACKAGE CALCULATOR
   =================================================================== */
const BASE_RATES = {
  edecanPerHour: 450,       // Tarifa unitaria por edecán por hora
  hostessPerHour: 400,      // Tarifa unitaria por hostess por hora
  animadorPerHour: 600,     // Tarifa unitaria animador por hora
  zanqueroPerUnit: 1200,    // Tarifa por zanquero por bloque/show
  fotoFlatRate: 1400,       // Cobertura fotográfica básica
  uniformesFlatRate: 350    // Cargo de coordinación de uniformes exclusivos
};

let calcState = {
  eventType: 'Inauguración o Apertura',
  hours: 4,
  edecanes: 2,
  hostess: 1,
  zanqueros: 0,
  animador: 1,
  hasFoto: true,
  hasUniformes: true,
  withInvoice: false
};

function initCalculator() {
  // Event Type Chips
  const chipButtons = document.querySelectorAll('#eventTypeContainer .chip-btn');
  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      chipButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      calcState.eventType = btn.getAttribute('data-type');
      updateCalculator();
    });
  });

  // Hours Slider
  const hoursRange = document.getElementById('hoursRange');
  const hoursDisplay = document.getElementById('hoursDisplay');
  if (hoursRange && hoursDisplay) {
    hoursRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      calcState.hours = val;
      hoursDisplay.textContent = `${val} Hora${val > 1 ? 's' : ''}`;
      updateCalculator();
    });
  }

  // Counter Buttons
  const counterButtons = document.querySelectorAll('.counter-btn');
  counterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      let currentVal = parseInt(targetEl.textContent, 10) || 0;
      if (action === 'inc') {
        currentVal = Math.min(currentVal + 1, 10);
      } else if (action === 'dec') {
        currentVal = Math.max(currentVal - 1, 0);
      }

      targetEl.textContent = currentVal;

      if (targetId === 'edecanesCount') calcState.edecanes = currentVal;
      if (targetId === 'hostessCount') calcState.hostess = currentVal;
      if (targetId === 'zanquerosCount') calcState.zanqueros = currentVal;
      if (targetId === 'animadorCount') calcState.animador = currentVal;

      updateCalculator();
    });
  });

  // Checkboxes
  const addonFoto = document.getElementById('addonFoto');
  if (addonFoto) {
    addonFoto.addEventListener('change', (e) => {
      calcState.hasFoto = e.target.checked;
      updateCalculator();
    });
  }

  const addonUniformes = document.getElementById('addonUniformes');
  if (addonUniformes) {
    addonUniformes.addEventListener('change', (e) => {
      calcState.hasUniformes = e.target.checked;
      updateCalculator();
    });
  }

  // Billing Radios
  const radioSinFactura = document.getElementById('radioSinFactura');
  const radioConFactura = document.getElementById('radioConFactura');

  if (radioSinFactura && radioConFactura) {
    radioSinFactura.addEventListener('click', () => {
      radioSinFactura.classList.add('active');
      radioConFactura.classList.remove('active');
      radioSinFactura.querySelector('input').checked = true;
      calcState.withInvoice = false;
      updateCalculator();
    });

    radioConFactura.addEventListener('click', () => {
      radioConFactura.classList.add('active');
      radioSinFactura.classList.remove('active');
      radioConFactura.querySelector('input').checked = true;
      calcState.withInvoice = true;
      updateCalculator();
    });
  }

  // Send WhatsApp Button
  const btnSendWhatsApp = document.getElementById('btnSendWhatsApp');
  if (btnSendWhatsApp) {
    btnSendWhatsApp.addEventListener('click', sendQuoteToWhatsApp);
  }

  // Initial Calculation
  updateCalculator();
}

function updateCalculator() {
  const summaryTitle = document.getElementById('summaryEventTitle');
  const breakdownList = document.getElementById('breakdownList');
  const totalAmountEl = document.getElementById('totalAmount');
  const taxNote = document.getElementById('taxNote');
  const bundleDiscountEl = document.getElementById('bundleDiscount');

  if (summaryTitle) summaryTitle.textContent = calcState.eventType;

  // Compute breakdown costs
  let rawSubtotal = 0;
  let breakdownRows = [];

  // Edecanes
  if (calcState.edecanes > 0) {
    const cost = calcState.edecanes * BASE_RATES.edecanPerHour * calcState.hours;
    rawSubtotal += cost;
    breakdownRows.push({
      label: `${calcState.edecanes} Edecán${calcState.edecanes > 1 ? 'es' : ''} (${calcState.hours} hrs)`,
      amount: cost
    });
  }

  // Hostess
  if (calcState.hostess > 0) {
    const cost = calcState.hostess * BASE_RATES.hostessPerHour * calcState.hours;
    rawSubtotal += cost;
    breakdownRows.push({
      label: `${calcState.hostess} Hostess (${calcState.hours} hrs)`,
      amount: cost
    });
  }

  // Zanqueros
  if (calcState.zanqueros > 0) {
    const cost = calcState.zanqueros * BASE_RATES.zanqueroPerUnit;
    rawSubtotal += cost;
    breakdownRows.push({
      label: `${calcState.zanqueros} Zanquero${calcState.zanqueros > 1 ? 's' : ''} Show / LED`,
      amount: cost
    });
  }

  // Animador
  if (calcState.animador > 0) {
    const cost = calcState.animador * BASE_RATES.animadorPerHour * calcState.hours;
    rawSubtotal += cost;
    breakdownRows.push({
      label: `${calcState.animador} Animador / MC (${calcState.hours} hrs)`,
      amount: cost
    });
  }

  // Cobertura Fotográfica
  if (calcState.hasFoto) {
    rawSubtotal += BASE_RATES.fotoFlatRate;
    breakdownRows.push({
      label: `Fotografía & Cobertura Digital`,
      amount: BASE_RATES.fotoFlatRate
    });
  }

  // Uniformes de alta costura
  if (calcState.hasUniformes) {
    rawSubtotal += BASE_RATES.uniformesFlatRate;
    breakdownRows.push({
      label: `Uniformes de Alta Gama Coordinados`,
      amount: BASE_RATES.uniformesFlatRate
    });
  }

  // Multi-element Discount (Si contratan 3 o más servicios principales)
  let activeServicesCount = (calcState.edecanes > 0 ? 1 : 0) +
                            (calcState.hostess > 0 ? 1 : 0) +
                            (calcState.zanqueros > 0 ? 1 : 0) +
                            (calcState.animador > 0 ? 1 : 0) +
                            (calcState.hasFoto ? 1 : 0);

  let discount = 0;
  if (activeServicesCount >= 3) {
    discount = Math.round(rawSubtotal * 0.10); // 10% descuento por paquete
    if (bundleDiscountEl) bundleDiscountEl.style.display = 'block';
  } else {
    if (bundleDiscountEl) bundleDiscountEl.style.display = 'none';
  }

  let netSubtotal = rawSubtotal - discount;

  // IVA if applicable
  let totalFinal = netSubtotal;
  if (calcState.withInvoice) {
    totalFinal = Math.round(netSubtotal * 1.16);
    if (taxNote) taxNote.textContent = 'Incluye 16% IVA para Factura CFDI deducible';
  } else {
    if (taxNote) taxNote.textContent = 'Precio neto garantizado (Sin factura)';
  }

  // Render Breakdown Rows
  if (breakdownList) {
    breakdownList.innerHTML = '';
    breakdownRows.forEach(row => {
      const div = document.createElement('div');
      div.className = 'breakdown-row';
      div.innerHTML = `
        <span>${row.label}</span>
        <span class="breakdown-val">$${row.amount.toLocaleString('es-MX')}</span>
      `;
      breakdownList.appendChild(div);
    });

    if (discount > 0) {
      const discDiv = document.createElement('div');
      discDiv.className = 'breakdown-row accent-row';
      discDiv.innerHTML = `
        <span>Ahorro Paquete Multidisciplinario (10%)</span>
        <span class="breakdown-val">-$${discount.toLocaleString('es-MX')}</span>
      `;
      breakdownList.appendChild(discDiv);
    }
  }

  // Render Total
  if (totalAmountEl) {
    totalAmountEl.textContent = `$${totalFinal.toLocaleString('es-MX')}`;
  }

  calcState.calculatedTotal = totalFinal;
  calcState.discount = discount;
  calcState.breakdownRows = breakdownRows;
}

function sendQuoteToWhatsApp() {
  const phone = '526181234567';
  let message = `¡Hola *Palacio Imagen & Publicidad*! 👋\n\n`;
  message += `Acabo de armar mi cotización en su sitio web para un evento en *Durango*:\n\n`;
  message += `📌 *Tipo de Evento:* ${calcState.eventType}\n`;
  message += `⏱️ *Duración:* ${calcState.hours} Horas\n\n`;
  message += `📋 *Servicios Seleccionados:*\n`;

  if (calcState.edecanes > 0) message += `• ${calcState.edecanes} Edecán(es) AA/AAA\n`;
  if (calcState.hostess > 0) message += `• ${calcState.hostess} Hostess de Recepción\n`;
  if (calcState.zanqueros > 0) message += `• ${calcState.zanqueros} Zanquero(s) Show/LED\n`;
  if (calcState.animador > 0) message += `• ${calcState.animador} Animador / MC Profesional\n`;
  if (calcState.hasFoto) message += `• Cobertura Fotográfica y Digital\n`;
  if (calcState.hasUniformes) message += `• Uniformes Profesionales de Alta Calidad\n`;

  message += `\n🧾 *Modalidad Fiscal:* ${calcState.withInvoice ? 'Con Factura CFDI (+IVA)' : 'Sin Factura (Precio Neto)'}\n`;
  message += `💰 *Presupuesto Estimado:* $${calcState.calculatedTotal ? calcState.calculatedTotal.toLocaleString('es-MX') : '0'} MXN\n\n`;
  message += `¿Tienen disponibilidad de fecha y personal para afinar los detalles? ¡Gracias!`;

  const encodedUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(encodedUrl, '_blank');
}

/* ===================================================================
   3. GALLERY CATEGORY FILTER & LIGHTBOX
   =================================================================== */
function initGallery() {
  const filterTabs = document.querySelectorAll('#galleryFilters .filter-tab');
  const galleryItems = document.querySelectorAll('#galleryGrid .gallery-item');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (filter === 'all' || itemCat === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // Lightbox keyboard escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('lightboxModal');
      if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    }
  });
}

function openLightbox(imgSrc, caption) {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');

  if (modal && modalImg && modalCaption) {
    modalImg.src = imgSrc;
    modalImg.alt = caption;
    modalCaption.textContent = caption;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox(e) {
  if (e.target.id === 'lightboxModal' || e.target.classList.contains('lightbox-close')) {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

// Make globally accessible for onclick in HTML
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;

/* ===================================================================
   4. FAQ ACCORDION
   =================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Optional accordion behavior: close other items
        faqItems.forEach(i => i.classList.remove('active'));
        
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* ===================================================================
   5. CONTACT FORM & WHATSAPP REDIRECT
   =================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccessMessage');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const phone = document.getElementById('formPhone').value.trim();
    const date = document.getElementById('formDate').value || 'Por definir';
    const service = document.getElementById('formServices').value;
    const invoice = document.getElementById('formInvoice').value;
    const message = document.getElementById('formMessage').value.trim() || 'Sin comentarios adicionales';

    if (!name || !phone) {
      alert('Por favor ingresa tu nombre y número telefónico.');
      return;
    }

    let waText = `¡Hola *Palacio Imagen & Publicidad*!\n\n`;
    waText += `Deseo informes y cotización para un evento en *Durango*:\n\n`;
    waText += `👤 *Nombre / Empresa:* ${name}\n`;
    waText += `📞 *Teléfono:* ${phone}\n`;
    waText += `📅 *Fecha Tentativa:* ${date}\n`;
    waText += `✨ *Servicio de Interés:* ${service}\n`;
    waText += `🧾 *Facturación:* ${invoice}\n`;
    waText += `💬 *Mensaje:* ${message}\n\n`;
    waText += `¿Me podrían brindar información y costos? Muchas gracias.`;

    if (successMsg) {
      successMsg.style.display = 'block';
    }

    setTimeout(() => {
      const waUrl = `https://wa.me/526181234567?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
      form.reset();
    }, 800);
  });
}

/* ===================================================================
   6. FLOATING WHATSAPP WIDGET & PRESETS
   =================================================================== */
function initFloatingWa() {
  const toggleBtn = document.getElementById('toggleWaPopover');
  const closeBtn = document.getElementById('closeWaPopover');
  const popover = document.getElementById('waPopover');
  const presetButtons = document.querySelectorAll('.wa-preset-btn');

  if (!toggleBtn || !popover) return;

  toggleBtn.addEventListener('click', () => {
    popover.classList.toggle('show');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      popover.classList.remove('show');
    });
  }

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.getAttribute('data-msg');
      const waUrl = `https://wa.me/526181234567?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
      popover.classList.remove('show');
    });
  });
}

/* ===================================================================
   7. PRINT / DOWNLOAD PROPOSAL MODAL
   =================================================================== */
function initPrintModal() {
  const printBtn = document.getElementById('btnPrintQuote');
  const printModal = document.getElementById('printModal');
  const closeBtn = document.getElementById('closePrintModal');
  const closeFooterBtn = document.getElementById('closePrintModalBtn');
  const printBody = document.getElementById('printBodyContent');

  if (!printBtn || !printModal || !printBody) return;

  printBtn.addEventListener('click', () => {
    const today = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let html = `
      <p style="margin-bottom: 0.5rem;"><strong>Fecha de Cotización:</strong> ${today}</p>
      <p style="margin-bottom: 0.5rem;"><strong>Tipo de Evento:</strong> ${calcState.eventType}</p>
      <p style="margin-bottom: 1.25rem;"><strong>Duración de Cobertura:</strong> ${calcState.hours} Horas de Servicio en Durango, Dgo.</p>
      
      <table class="print-summary-table">
        <thead>
          <tr>
            <th>Concepto / Personal Contratado</th>
            <th style="text-align: right;">Monto Estimado</th>
          </tr>
        </thead>
        <tbody>
    `;

    (calcState.breakdownRows || []).forEach(row => {
      html += `
        <tr>
          <td>${row.label}</td>
          <td class="amount-cell">$${row.amount.toLocaleString('es-MX')} MXN</td>
        </tr>
      `;
    });

    if (calcState.discount > 0) {
      html += `
        <tr style="color: #059669;">
          <td>Descuento Promocional por Paquete (10%)</td>
          <td class="amount-cell">-$${calcState.discount.toLocaleString('es-MX')} MXN</td>
        </tr>
      `;
    }

    if (calcState.withInvoice) {
      html += `
        <tr>
          <td>IVA Trasladado (16% CFDI Fiscal)</td>
          <td class="amount-cell">Incluido</td>
        </tr>
      `;
    }

    html += `
        </tbody>
      </table>

      <div class="print-total-box">
        <div style="font-size: 0.85rem; color: #64748b; text-transform: uppercase;">Total Presupuestado (${calcState.withInvoice ? 'Con Factura Fiscal' : 'Precio Neto Directo'}):</div>
        <div class="print-total-amount">$${calcState.calculatedTotal ? calcState.calculatedTotal.toLocaleString('es-MX') : '0'} MXN</div>
      </div>

      <div style="margin-top: 1.5rem; font-size: 0.8rem; color: #64748b; line-height: 1.5;">
        <strong>Términos del Servicio:</strong><br>
        • Incluye personal uniformado con estándares ejecutivos de alta costura.<br>
        • Incluye coordinador de campo 30 minutos antes para inicio puntual del evento.<br>
        • Para apartar fecha se requiere 50% de anticipo y 50% al iniciar el evento.<br>
        • Cotización válida por 15 días naturales en Durango y zona metropolitana.
      </div>
    `;

    printBody.innerHTML = html;
    printModal.classList.add('show');
  });

  const closeModal = () => printModal.classList.remove('show');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeModal);
}

/* ===================================================================
   8. CURRENT YEAR
   =================================================================== */
function updateCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ===================================================================
   9. HERO IMAGE SWITCHER
   =================================================================== */
function switchHeroImg(imgSrc, tag, title, sub) {
  const mainImg = document.getElementById('heroMainImg');
  const tagEl = document.getElementById('heroTag');
  const titleEl = document.getElementById('heroCardTitle');
  const subEl = document.getElementById('heroCardSub');
  const buttons = document.querySelectorAll('.hero-thumb-btn');

  if (mainImg) {
    mainImg.style.opacity = '0.4';
    setTimeout(() => {
      mainImg.src = imgSrc;
      mainImg.style.opacity = '1';
    }, 150);
  }
  if (tagEl) tagEl.textContent = tag;
  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = sub;

  buttons.forEach(btn => {
    const clickAttr = btn.getAttribute('onclick') || '';
    if (clickAttr.includes(imgSrc)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}
window.switchHeroImg = switchHeroImg;
