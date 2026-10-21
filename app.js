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
  hostessPerHour: 400,      // Tarifa unitaria por hostess por hora
  animadorPerHour: 600,     // Tarifa unitaria animador por hora
  zanqueroPerUnit: 1200,    // Tarifa por zanquero por bloque/show
  fotoFlatRate: 1400,       // Cobertura fotográfica básica
  uniformesFlatRate: 350    // Cargo de coordinación de uniformes exclusivos
};

// Configuración de Zonas de Cobertura y Tarifas de Edecanes
// Regla de Negocio: Las edecanes se manejan en bloque de 1 a 4 horas (mismo costo de 1 a 4 hrs)
const ZONE_CONFIG = {
  'local': {
    id: 'local',
    name: 'Durango Capital (Local)',
    shortName: 'Local Durango',
    edecanBase: 900,         // $900 por edecán en bloque de 1 a 4 horas
    extraHourRate: 225,      // $900 / 4 = $225 por hora extra
    cityLabel: '📍 Durango, Dgo. (Local)',
    viaticos: false,
    viaticosDesc: null
  },
  'foraneo-1h': {
    id: 'foraneo-1h',
    name: 'Foráneo ~1 hr (Canatlán, Nombre de Dios, Poanas)',
    shortName: 'Foráneo 1 hr',
    edecanBase: 1100,        // $1,100 por edecán en bloque de 1 a 4 horas
    extraHourRate: 275,
    cityLabel: '📍 Foráneo Cercano (~1 hr de camino)',
    viaticos: true,
    viaticosDesc: '🚗 Nota de Viáticos: Transporte y alimentos del personal por cuenta del cliente.'
  },
  'foraneo-2h': {
    id: 'foraneo-2h',
    name: 'Foráneo ~2 hrs (Santiago Papasquiaro, Cuencamé, V. Guerrero)',
    shortName: 'Foráneo 2 hrs',
    edecanBase: 1500,        // $1,500 por edecán en bloque de 1 a 4 horas
    extraHourRate: 375,
    cityLabel: '📍 Foráneo Medio (~2 hrs de camino)',
    viaticos: true,
    viaticosDesc: '🚗 Nota de Viáticos: Transporte y alimentos del personal por cuenta del cliente.'
  },
  'foraneo-laguna': {
    id: 'foraneo-laguna',
    name: 'Comarca Lagunera (~3-4 hrs: Torreón, Gómez Palacio, Lerdo)',
    shortName: 'La Laguna / Torreón',
    edecanBase: 2000,        // $2,000 por edecán en bloque de 1 a 4 horas
    extraHourRate: 500,
    cityLabel: '📍 Torreón / Gómez Palacio / Lerdo (~3-4 hrs)',
    viaticos: true,
    viaticosDesc: '🚗 Nota de Viáticos: Transporte, alimentos y hospedaje (de ser necesario) por cuenta del cliente.'
  }
};

let calcState = {
  eventType: 'Inauguración o Apertura',
  zone: 'local',
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

  // Zone Chips
  const zoneButtons = document.querySelectorAll('#zoneContainer .zone-chip-btn');
  zoneButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      zoneButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      calcState.zone = btn.getAttribute('data-zone') || 'local';
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
      if (val <= 4) {
        hoursDisplay.textContent = `${val} Hora${val > 1 ? 's' : ''} (Bloque Base 1-4 hrs)`;
      } else {
        hoursDisplay.textContent = `${val} Horas (4 hrs + ${val - 4}h extra)`;
      }
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
  const summaryCityEl = document.getElementById('summaryCityLabel');
  const viaticosAlertEl = document.getElementById('viaticosAlert');
  const breakdownList = document.getElementById('breakdownList');
  const totalAmountEl = document.getElementById('totalAmount');
  const taxNote = document.getElementById('taxNote');
  const bundleDiscountEl = document.getElementById('bundleDiscount');

  const currentZone = ZONE_CONFIG[calcState.zone] || ZONE_CONFIG['local'];

  if (summaryTitle) summaryTitle.textContent = calcState.eventType;
  if (summaryCityEl) summaryCityEl.textContent = currentZone.cityLabel;

  if (viaticosAlertEl) {
    if (currentZone.viaticos) {
      viaticosAlertEl.style.display = 'block';
      viaticosAlertEl.textContent = currentZone.viaticosDesc;
    } else {
      viaticosAlertEl.style.display = 'none';
    }
  }

  // Compute breakdown costs
  let rawSubtotal = 0;
  let breakdownRows = [];

  // Edecanes: Cobro por bloque de 1 a 4 horas (mismo costo por 1 a 4 hrs)
  if (calcState.edecanes > 0) {
    let unitRate = currentZone.edecanBase;
    let labelDetail = 'Bloque 1 a 4 hrs';

    if (calcState.hours > 4) {
      const extraHours = calcState.hours - 4;
      unitRate += extraHours * currentZone.extraHourRate;
      labelDetail = `4 hrs base + ${extraHours}h extra`;
    }

    const totalEdecanes = calcState.edecanes * unitRate;
    rawSubtotal += totalEdecanes;
    breakdownRows.push({
      label: `${calcState.edecanes} Edecán${calcState.edecanes > 1 ? 'es' : ''} A/AA (${labelDetail} • ${currentZone.shortName})`,
      amount: totalEdecanes
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
  const phone = '526183657151';
  const currentZone = ZONE_CONFIG[calcState.zone] || ZONE_CONFIG['local'];

  let message = `¡Hola *Palacio Imagen & Publicidad*! 👋\n\n`;
  message += `Acabo de armar mi cotización en su sitio web para un evento:\n\n`;
  message += `📌 *Tipo de Evento:* ${calcState.eventType}\n`;
  message += `📍 *Ubicación / Zona:* ${currentZone.name}\n`;
  message += `⏱️ *Duración:* ${calcState.hours} Horas ${calcState.hours <= 4 ? '(Bloque base 1 a 4 hrs)' : ''}\n\n`;
  message += `📋 *Servicios Seleccionados:*\n`;

  if (calcState.edecanes > 0) {
    message += `• ${calcState.edecanes} Edecán(es) A/AA (${calcState.hours <= 4 ? 'Bloque base hasta 4 hrs' : calcState.hours + ' hrs'})\n`;
  }
  if (calcState.hostess > 0) message += `• ${calcState.hostess} Hostess de Recepción\n`;
  if (calcState.zanqueros > 0) message += `• ${calcState.zanqueros} Zanquero(s) Show/LED\n`;
  if (calcState.animador > 0) message += `• ${calcState.animador} Animador / MC Profesional\n`;
  if (calcState.hasFoto) message += `• Cobertura Fotográfica y Digital\n`;
  if (calcState.hasUniformes) message += `• Uniformes Profesionales de Alta Costura\n`;

  if (currentZone.viaticos) {
    message += `\n🚗 *Viáticos Foráneos:* Se contemplan transporte y alimentos por cuenta del cliente.\n`;
  }

  message += `\n🧾 *Modalidad Fiscal:* ${calcState.withInvoice ? 'Con Factura CFDI (+IVA)' : 'Sin Factura (Precio Neto)'}\n`;
  message += `💰 *Presupuesto Estimado:* $${calcState.calculatedTotal ? calcState.calculatedTotal.toLocaleString('es-MX') : '0'} MXN\n`;
  message += `🔒 *Anticipo para asegurar fecha:* $500 MXN (Clientes nuevos)\n\n`;
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
      const waUrl = `https://wa.me/526183657151?text=${encodeURIComponent(waText)}`;
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
      const waUrl = `https://wa.me/526183657151?text=${encodeURIComponent(msg)}`;
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

    const currentZone = ZONE_CONFIG[calcState.zone] || ZONE_CONFIG['local'];

    let html = `
      <p style="margin-bottom: 0.4rem;"><strong>Fecha de Cotización:</strong> ${today}</p>
      <p style="margin-bottom: 0.4rem;"><strong>Tipo de Evento:</strong> ${calcState.eventType}</p>
      <p style="margin-bottom: 0.4rem;"><strong>Ubicación / Cobertura:</strong> ${currentZone.name}</p>
      <p style="margin-bottom: 1.25rem;"><strong>Duración de Cobertura:</strong> ${calcState.hours} Horas de Servicio ${calcState.hours <= 4 ? '(Bloque base de 1 a 4 horas)' : ''}</p>
      
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
        <strong>Términos del Servicio y Políticas de Reserva:</strong><br>
        • <strong>Apartado de Fecha:</strong> Clientes nuevos aseguran formalmente su fecha con un anticipo accesible de <strong>$500 MXN</strong>; el saldo se liquida el día del evento al inicio del servicio.<br>
        • <strong>Edecanes:</strong> Tarifa fija por bloque de 1 a 4 horas (mismo costo por 1, 2, 3 o 4 horas). Horas extras aplican tarifa adicional proporcional.<br>
        • <strong>Eventos Foráneos:</strong> ${currentZone.viaticos ? 'Viáticos de transporte, alimentos y hospedaje (si aplica) son cubiertos por el cliente.' : 'Tarifa base local en área metropolitana de Durango.'}<br>
        • Incluye personal uniformado con estándares ejecutivos y coordinador de campo 30 minutos antes para puntualidad asegurada.<br>
        • Cotización válida por 15 días naturales.
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
