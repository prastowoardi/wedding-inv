(() => {
  "use strict";

  const C = window.WEDDING;
  const $ = (sel, ctx = document) =>
    ctx && ctx.querySelector ? ctx.querySelector(sel) : null;
  const $$ = (sel, ctx = document) =>
    ctx && ctx.querySelectorAll ? Array.from(ctx.querySelectorAll(sel)) : [];
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const body = document.body;
  const page = $("#page");
  const topbar = $("#topbar");
  const cover = $("#cover");
  const menu = $("#menu");
  const lightbox = $("#lightbox");
  const toastEl = $("#toast");

  const STORAGE_THEME = "wedding-theme";
  const STORAGE_RSVP = "wedding-rsvp-wishes";

  /* =====================================================
     Helpers
     ===================================================== */
  let toastTimer;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      area.remove();
      return ok;
    }
  }

  function shareInvitation() {
    const coupleName = `${C.couple.bride.name} & ${C.couple.groom.name}`;
    const title = C.share?.title || `${coupleName} — The Wedding`;
    const text =
      C.share?.text ||
      `Kami menantikan kehadiran dan doa Anda di hari bahagia kami. ${C.wedding.dateLabel}, ${C.wedding.city}.`;
    const url = window.location.origin + window.location.pathname;
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
      return;
    }
    copyText(url).then((ok) =>
      toast(ok ? "Tautan undangan disalin." : "Salin tautan: " + url),
    );
  }

  function lockScroll() {
    body.classList.add("is-locked");
  }
  function unlockScroll() {
    body.classList.remove("is-locked");
  }

  function trapFocus(container, event) {
    if (event.key !== "Tab") return;
    const focusable = $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container,
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* =====================================================
     Theme
     ===================================================== */
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  function applyTheme(theme, persist = true) {
    document.documentElement.dataset.theme = "light";
    if (metaTheme) metaTheme.setAttribute("content", "#f7f3ee");
    if (persist) {
      try {
        localStorage.setItem(STORAGE_THEME, "light");
      } catch (e) {}
    }
    const toggle = $("#themeToggle");
    if (toggle) {
      toggle.setAttribute("aria-label", "Tema ceria");
      toggle.disabled = true;
    }
  }

  function initTheme() {
    applyTheme("light", false);
    $("#themeToggle")?.remove();
  }

  /* =====================================================
     Personalisasi tamu
     ===================================================== */
  function getGuestName() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("to") || params.get("nama") || params.get("kepada");
    if (!raw) return "";
    return raw.replace(/[<>]/g, "").trim().slice(0, 60);
  }

  function initGuest() {
    const guest = getGuestName();
    if (!guest) return;
    const guestEl = $("#guestName");
    if (guestEl) guestEl.textContent = guest;
    const menuGuest = $("#menuGuest");
    if (menuGuest) menuGuest.textContent = guest;
    const rsvpName = $("#rsvpName");
    if (rsvpName) rsvpName.value = guest;
    document.title = `Undangan untuk ${guest} — ${C.couple.bride.name} & ${C.couple.groom.name}`;
  }

  /* =====================================================
     Render konten dari konfigurasi
     ===================================================== */
  function getInitials() {
    const b = (C.couple?.bride?.name || "A").trim().charAt(0).toUpperCase();
    const g = (C.couple?.groom?.name || "F").trim().charAt(0).toUpperCase();
    return { b, g, text: `${b}&${g}`, html: `${b}<span>&amp;</span>${g}` };
  }

  function updateFavicon() {
    const { b, g } = getInitials();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="64" y2="64"><stop stop-color="#b9caa6"/><stop offset="1" stop-color="#46614a"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="#0f1813"/><circle cx="32" cy="32" r="18" stroke="url(#g)" stroke-width="1.2" fill="none"/><text x="32" y="36" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="16" fill="#f4f2ea">${b}&amp;${g}</text></svg>`;
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }
  }

  function renderCouple() {
    const wrap = $("#couplePeople");
    if (!wrap) return;
    const bride = C.couple.bride;
    const groom = C.couple.groom;
    const formatParents = (parents) =>
      (parents || "")
        .split("&")
        .map((part) => part.trim())
        .filter(Boolean)
        .join("<br />&amp; ");

    const brideIg = bride.instagram
      ? `<a class="person__ig" href="${bride.instagram}" target="_blank" rel="noopener">
           <svg class="icon" aria-hidden="true"><use href="#i-instagram"></use></svg>${bride.instagramLabel || bride.name}
         </a>`
      : "";

    const groomIg = groom.instagram
      ? `<a class="person__ig" href="${groom.instagram}" target="_blank" rel="noopener">
           <svg class="icon" aria-hidden="true"><use href="#i-instagram"></use></svg>${groom.instagramLabel || groom.name}
         </a>`
      : "";

    wrap.innerHTML = `
      <article class="person reveal" data-delay="1">
        <p class="person__role">The Bride</p>
        <h3 class="person__name">${bride.name}<br /><span>${bride.fullName || ""}</span></h3>
        <p class="person__line">${bride.order || "Putri dari"}</p>
        <p class="person__parents">${formatParents(bride.parents)}</p>
        ${brideIg}
      </article>

      <div class="couple__divider" aria-hidden="true"><span></span><b>&amp;</b><span></span></div>

      <article class="person person--right reveal" data-delay="2">
        <p class="person__role">The Groom</p>
        <h3 class="person__name">${groom.name}<br /><span>${groom.fullName || ""}</span></h3>
        <p class="person__line">${groom.order || "Putra dari"}</p>
        <p class="person__parents">${formatParents(groom.parents)}</p>
        ${groomIg}
      </article>
    `;

    const photoCap = $("#coupleCaption");
    if (photoCap) {
      const year = new Date(C.wedding.dateISO).getFullYear() || "2026";
      photoCap.textContent = `Prewedding · ${C.wedding.city}, ${year}`;
    }
  }

  function renderContent() {
    const bride = C.couple.bride;
    const groom = C.couple.groom;
    const coupleName = `${bride.name} & ${groom.name}`;
    const initials = getInitials();
    const hashtag = C.couple.hashtag || `#${bride.name}${groom.name}Forever`;

    updateFavicon();

    // Global names & meta
    document.title = `${coupleName} — The Wedding`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        `Undangan pernikahan ${coupleName}. ${C.wedding.dateLabel}, ${C.wedding.city}. Kami menantikan kehadiran dan doa Anda.`,
      );
    }
    const ogt = document.querySelector('meta[property="og:title"]');
    if (ogt) ogt.setAttribute("content", `${coupleName} — The Wedding`);
    const ogd = document.querySelector('meta[property="og:description"]');
    if (ogd)
      ogd.setAttribute(
        "content",
        `${C.wedding.dateLabel} · ${C.wedding.city}. Sebuah undangan, sepotong kebahagiaan.`,
      );

    $("#cover")?.setAttribute(
      "aria-label",
      `Undangan pernikahan ${bride.name} dan ${groom.name}`,
    );
    $(".topbar__brand")?.setAttribute(
      "aria-label",
      `${bride.name} dan ${groom.name}, kembali ke awal`,
    );

    // Monograms & Seal
    $$(".monogram").forEach((el) => {
      el.innerHTML = initials.html;
    });
    const sealMono = $(".seal__mono");
    if (sealMono) {
      sealMono.textContent = initials.text;
    }

    // Cover
    const coverNames = $(".cover__names");
    if (coverNames) {
      coverNames.innerHTML = `<span>${bride.name}</span><em>&amp;</em><span>${groom.name}</span>`;
    }
    $$(".cover__date").forEach((el) => (el.textContent = C.wedding.dateLabel));
    $$(".cover__hashtag, .menu__hashtag").forEach(
      (el) => (el.textContent = hashtag),
    );
    const cap = $(".cover__photo-caption");
    if (cap) cap.textContent = `${C.wedding.city}, Indonesia`;

    // Opening
    const salamEl = $("#openingSalam") || $(".opening__salam");
    if (salamEl && C.opening?.salam) salamEl.textContent = C.opening.salam;
    if ($("#verseText")) $("#verseText").innerHTML = C.opening.verse;
    if ($("#verseSource"))
      $("#verseSource").textContent = C.opening.verseSource;
    if ($("#openingText")) $("#openingText").textContent = C.opening.text;
    const openingSign = $("#openingSign") || $(".opening__sign");
    if (openingSign) openingSign.textContent = coupleName;

    // Couple cards
    renderCouple();

    // Countdown section date & city
    const countdownDate = $("#countdownDate") || $(".countdown__date");
    if (countdownDate)
      countdownDate.textContent = `${C.wedding.dateLabel} · ${C.wedding.city}`;

    // Dynamic sections
    renderEvents();
    renderStory();
    renderGallery();
    renderGifts();
    renderWishes();
    renderContact();
    initCountdown();

    // Closing
    const closingNames = $("#closingNames") || $(".closing__names");
    if (closingNames) closingNames.textContent = coupleName;
    const closingDate = $("#closingDate") || $(".closing__date");
    if (closingDate) closingDate.textContent = C.wedding.dateShort;
    const closingSalam = $("#closingSalam") || $(".closing__salam");
    if (closingSalam)
      closingSalam.textContent =
        C.opening?.closingSalam ||
        "Wassalamu'alaikum Warahmatullahi Wabarakatuh";

    // Footer
    const footerBrand = $("#footerBrandText") || $(".footer__brand p");
    if (footerBrand) {
      footerBrand.innerHTML = `The Wedding of ${coupleName}<br /><span>${C.wedding.dateLabel}</span>`;
    }
  }

  function renderEvents() {
    const list = $("#eventsList");
    if (list && Array.isArray(C.events)) {
      list.innerHTML = C.events
        .map((ev, i) => {
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.mapQuery)}`;
          const isAkad = i === 0 || /akad|pemberkatan/i.test(ev.name);
          const badgeIcon = isAkad ? "#i-heart" : "#i-calendar";
          return `
            <li class="events__card reveal" data-delay="${i + 1}">
              <div class="events__card-top">
                <span class="events__badge">
                  <svg class="icon" aria-hidden="true"><use href="${badgeIcon}"></use></svg>
                  ${ev.name}
                </span>
                <span class="events__step">0${i + 1}</span>
              </div>
              <h3 class="events__venue">${ev.venue}</h3>
              <p class="events__address">
                <svg class="icon icon--pin" aria-hidden="true"><use href="#i-pin"></use></svg>
                <span>${ev.address}</span>
              </p>
              <div class="events__chips">
                <div class="events__chip">
                  <svg class="icon" aria-hidden="true"><use href="#i-calendar"></use></svg>
                  <span>${ev.date}</span>
                </div>
                <div class="events__chip">
                  <svg class="icon" aria-hidden="true"><use href="#i-clock"></use></svg>
                  <span>${ev.time}</span>
                </div>
              </div>
              <div class="events__card-action">
                <a class="btn btn--solid btn--sm events__map-btn" href="${mapUrl}" target="_blank" rel="noopener">
                  <svg class="icon" aria-hidden="true"><use href="#i-pin"></use></svg>
                  Buka di Google Maps
                  <svg class="icon" aria-hidden="true"><use href="#i-arrow-up"></use></svg>
                </a>
              </div>
            </li>`;
        })
        .join("");
    }

    if (C.map?.query) {
      const query = encodeURIComponent(C.map.query);
      const mapEmbed = $("#mapEmbed");
      if (mapEmbed)
        mapEmbed.src = `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
      const mapLink = $("#mapLink");
      if (mapLink)
        mapLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
  }

  function renderStory() {
    const list = $("#storyList");
    if (list && Array.isArray(C.story)) {
      list.innerHTML = C.story
        .map(
          (item, i) => `
            <li class="story__item reveal" data-delay="${i + 1}">
              <div class="story__node" aria-hidden="true"></div>
              <div class="story__card">
                <div class="story__card-head">
                  <span class="story__date-badge">
                    <svg class="icon" aria-hidden="true"><use href="#i-heart"></use></svg>
                    ${item.date}
                  </span>
                  <span class="story__step">0${i + 1}</span>
                </div>
                <h3 class="story__title">${item.title}</h3>
                <p class="story__text">${item.text}</p>
              </div>
            </li>`,
        )
        .join("");
    }
  }

  let galleryAutoPlayTimer = null;
  let currentGalleryIndex = 0;
  let galleryCleanup = null;

  function renderGallery() {
    if (typeof galleryCleanup === "function") {
      galleryCleanup();
      galleryCleanup = null;
    }

    const track = $("#galleryTrack") || $("#galleryGrid");
    const slider = $("#gallerySlider");
    const dotsContainer = $("#galleryDots");
    const prevBtn = $("#galleryPrev");
    const nextBtn = $("#galleryNext");

    if (!track || !Array.isArray(C.gallery) || !C.gallery.length) return;

    // Render slides
    track.innerHTML = C.gallery
      .map(
        (item, i) => `
          <button class="gallery__item${i === 0 ? " is-active" : ""}" type="button" data-index="${i}" aria-label="Perbesar foto: ${item.caption}">
            <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
            <span class="gallery__cap">
              <span>${item.caption}</span>
              <span class="gallery__num">0${i + 1}</span>
            </span>
          </button>`,
      )
      .join("");

    // Render dots
    if (dotsContainer) {
      dotsContainer.innerHTML = C.gallery
        .map(
          (item, i) => `
            <button class="gallery-dot${i === 0 ? " is-active" : ""}" type="button" role="tab" data-index="${i}" aria-label="Lihat foto ke-${i + 1} (${item.caption})" aria-selected="${i === 0 ? "true" : "false"}"></button>`,
        )
        .join("");
    }

    if (!slider) {
      $$(".gallery__item", track).forEach((btn) => {
        btn.addEventListener("click", () =>
          openLightbox(Number(btn.dataset.index)),
        );
      });
      return;
    }

    currentGalleryIndex = 0;
    let isPointerDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasDragged = false;
    let touchStartX = 0;
    let isTouching = false;
    let isGalleryVisible = true;
    let scrollRaf = null;

    function setActiveSlideState(index) {
      currentGalleryIndex = index;
      const items = $$(".gallery__item", track);
      const dots = $$(".gallery-dot", dotsContainer);

      items.forEach((it, i) => {
        it.classList.toggle("is-active", i === index);
      });

      dots.forEach((dot, i) => {
        const isActive = i === index;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    function goToSlide(index, smooth = true) {
      const items = $$(".gallery__item", track);
      if (!items.length) return;
      const total = items.length;
      const targetIndex = ((index % total) + total) % total;
      const item = items[targetIndex];
      if (!item) return;

      const targetLeft =
        item.offsetLeft - (slider.clientWidth - item.clientWidth) / 2;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const clampedScroll = Math.max(0, Math.min(targetLeft, maxScroll));

      slider.scrollTo({
        left: clampedScroll,
        behavior: smooth ? "smooth" : "auto",
      });

      setActiveSlideState(targetIndex);
    }

    function getClosestIndex() {
      const items = $$(".gallery__item", track);
      if (!items.length) return 0;
      const sliderCenter = slider.scrollLeft + slider.clientWidth / 2;
      let closestIndex = 0;
      let minDiff = Infinity;
      items.forEach((item, idx) => {
        const itemCenter = item.offsetLeft + item.clientWidth / 2;
        const diff = Math.abs(sliderCenter - itemCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = idx;
        }
      });
      return closestIndex;
    }

    function pauseAutoPlay() {
      if (galleryAutoPlayTimer) {
        clearInterval(galleryAutoPlayTimer);
        galleryAutoPlayTimer = null;
      }
    }

    function startAutoPlay() {
      pauseAutoPlay();
      if (reduceMotion) return;
      if (!isGalleryVisible) return;
      if (C.gallery.length <= 1) return;

      galleryAutoPlayTimer = setInterval(() => {
        goToSlide(currentGalleryIndex + 1, true);
      }, 3500);
    }

    // Scroll listener for manual swipe & sync
    const onScroll = () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        const closest = getClosestIndex();
        if (closest !== currentGalleryIndex) {
          setActiveSlideState(closest);
        }
      });
    };
    slider.addEventListener("scroll", onScroll, { passive: true });

    // Prev / Next navigation
    const onPrev = () => {
      pauseAutoPlay();
      goToSlide(currentGalleryIndex - 1, true);
      startAutoPlay();
    };
    const onNext = () => {
      pauseAutoPlay();
      goToSlide(currentGalleryIndex + 1, true);
      startAutoPlay();
    };
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    // Dots navigation
    const onDotsClick = (e) => {
      const dot = e.target.closest(".gallery-dot");
      if (!dot) return;
      pauseAutoPlay();
      goToSlide(Number(dot.dataset.index), true);
      startAutoPlay();
    };
    dotsContainer?.addEventListener("click", onDotsClick);

    // Mouse drag-to-scroll
    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      isPointerDown = true;
      hasDragged = false;
      startX = e.pageX;
      scrollStart = slider.scrollLeft;
      slider.classList.add("is-dragging");
      pauseAutoPlay();
    };
    const onMouseMove = (e) => {
      if (!isPointerDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 6) {
        hasDragged = true;
      }
      slider.scrollLeft = scrollStart - dx;
    };
    const onMouseUp = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      slider.classList.remove("is-dragging");
      if (hasDragged) {
        goToSlide(getClosestIndex(), true);
      }
      startAutoPlay();
    };

    slider.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch events
    const onTouchStart = (e) => {
      isTouching = true;
      hasDragged = false;
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].pageX;
      }
      pauseAutoPlay();
    };
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const dx = Math.abs(e.touches[0].pageX - touchStartX);
        if (dx > 8) hasDragged = true;
      }
    };
    let touchEndTimeout = null;
    const onTouchEnd = () => {
      isTouching = false;
      if (touchEndTimeout) clearTimeout(touchEndTimeout);
      touchEndTimeout = setTimeout(startAutoPlay, 2500);
    };

    slider.addEventListener("touchstart", onTouchStart, { passive: true });
    slider.addEventListener("touchmove", onTouchMove, { passive: true });
    slider.addEventListener("touchend", onTouchEnd, { passive: true });

    // Item click -> Lightbox (only if not dragged)
    $$(".gallery__item", track).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        openLightbox(Number(btn.dataset.index));
      });
    });

    // Keyboard support
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    };
    slider.addEventListener("keydown", onKeyDown);

    // Hover pause
    const onMouseEnter = () => pauseAutoPlay();
    const onMouseLeave = () => {
      if (!isPointerDown && !isTouching) startAutoPlay();
    };
    slider.addEventListener("mouseenter", onMouseEnter);
    slider.addEventListener("mouseleave", onMouseLeave);

    // Visibility change
    const onVisibilityChange = () => {
      if (document.hidden) {
        pauseAutoPlay();
      } else {
        startAutoPlay();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Intersection Observer (play only when in view)
    let observer = null;
    const gallerySection = $("#gallery");
    if ("IntersectionObserver" in window && gallerySection) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isGalleryVisible = entry.isIntersecting;
            if (isGalleryVisible) {
              startAutoPlay();
            } else {
              pauseAutoPlay();
            }
          });
        },
        { threshold: 0.15 },
      );
      observer.observe(gallerySection);
    } else {
      startAutoPlay();
    }

    // Cleanup reference
    galleryCleanup = () => {
      pauseAutoPlay();
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      if (touchEndTimeout) clearTimeout(touchEndTimeout);
      if (observer) observer.disconnect();
      slider.removeEventListener("scroll", onScroll);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      dotsContainer?.removeEventListener("click", onDotsClick);
      slider.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      slider.removeEventListener("touchstart", onTouchStart);
      slider.removeEventListener("touchmove", onTouchMove);
      slider.removeEventListener("touchend", onTouchEnd);
      slider.removeEventListener("keydown", onKeyDown);
      slider.removeEventListener("mouseenter", onMouseEnter);
      slider.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }

  function renderGifts() {
    const wrap = $("#giftAccounts");
    if (wrap && Array.isArray(C.gifts)) {
      const initials = getInitials();
      wrap.innerHTML = C.gifts
        .map((gift, i) => {
          const formattedNumber = String(gift.number)
            .replace(/(\d{4})/g, "$1 ")
            .trim();
          const isDark = i % 2 === 0;
          const themeClass = isDark ? "gift-card--dark" : "gift-card--gold";
          return `
              <article class="gift-card ${themeClass} reveal" data-delay="${i + 1}">
                <div class="gift-card__bg-watermark" aria-hidden="true">${initials}</div>
                <div class="gift-card__header">
                  <div class="gift-card__chip-wrap">
                    <svg class="icon gift-card__chip" aria-hidden="true"><use href="#i-chip"></use></svg>
                    <span class="gift-card__contactless" aria-hidden="true">)))</span>
                  </div>
                  <div class="gift-card__bank-badge">
                    <span class="gift-card__bank-name">${gift.bank}</span>
                    <span class="gift-card__type">${gift.label || "Transfer Bank"}</span>
                  </div>
                </div>

                <div class="gift-card__number-wrap">
                  <span class="gift-card__num-label">Nomor Rekening</span>
                  <p class="gift-card__number" aria-label="${gift.number}">${formattedNumber}</p>
                </div>

                <div class="gift-card__footer">
                  <div class="gift-card__holder-wrap">
                    <span class="gift-card__holder-label">Atas Nama</span>
                    <p class="gift-card__holder">${gift.holder}</p>
                  </div>
                  <button class="gift-card__copy-btn btn btn--sm" type="button" data-copy="${gift.number}" data-copy-label="Nomor rekening ${gift.bank}">
                    <svg class="icon" aria-hidden="true"><use href="#i-copy"></use></svg>
                    <span>Salin No Rek</span>
                  </button>
                </div>
              </article>`;
        })
        .join("");
    }

    const addrWrap = $("#giftAddress");
    if (addrWrap && C.giftAddress) {
      const recipient =
        C.giftAddress.recipient ||
        `${C.couple.bride.name} & ${C.couple.groom.name}`;
      addrWrap.innerHTML = `
        <div class="gift-address-card reveal">
          <div class="gift-address-card__icon">
            <svg class="icon" aria-hidden="true"><use href="#i-pin"></use></svg>
          </div>
          <div class="gift-address-card__body">
            <span class="gift-address-card__tag">Kado Pernikahan</span>
            <h3 class="gift-address-card__title">Kirim Hadiah Fisik</h3>
            <p class="gift-address-card__desc">${C.giftAddress.address}</p>
            <p class="gift-address-card__recipient">Penerima: <strong>${recipient}</strong></p>
          </div>
          <div class="gift-address-card__action">
            <button class="btn btn--solid btn--sm" type="button" data-copy="${C.giftAddress.address}" data-copy-label="Alamat pengiriman hadiah">
              <svg class="icon" aria-hidden="true"><use href="#i-copy"></use></svg>
              Salin Alamat
            </button>
          </div>
        </div>`;
    }

    $$("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const ok = await copyText(btn.dataset.copy);
        if (ok) {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg>Tersalin!`;
          btn.classList.add("is-copied");
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove("is-copied");
          }, 2000);
        }
        toast(
          ok
            ? `${btn.dataset.copyLabel || "Teks"} disalin.`
            : "Gagal menyalin. Silakan salin manual.",
        );
      });
    });
  }

  function renderContact() {
    const link = $("#menuWhatsapp") || $(".menu__contact a");
    if (link && C.contact) {
      const cleanNumber = (C.contact.whatsapp || "").replace(/\D/g, "");
      link.href = `https://wa.me/${cleanNumber}`;
      const label = $("#menuWhatsappLabel");
      if (label) {
        label.textContent = C.contact.whatsappLabel || C.contact.whatsapp;
      } else {
        link.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-whatsapp"></use></svg>${C.contact.whatsappLabel || C.contact.whatsapp}`;
      }
    }
    const hashtag =
      C.couple.hashtag ||
      `#${C.couple.bride.name}${C.couple.groom.name}Forever`;
    $$(".menu__contact span, .menu__hashtag").forEach(
      (el) => (el.textContent = hashtag),
    );
  }

  /* =====================================================
     Hitung mundur
     ===================================================== */
  function initCountdown() {
    const target = new Date(C.wedding.dateISO).getTime();
    const nodes = {
      days: $('[data-unit="days"]'),
      hours: $('[data-unit="hours"]'),
      minutes: $('[data-unit="minutes"]'),
      seconds: $('[data-unit="seconds"]'),
    };
    if (!nodes.days) return;
    const pad = (n, len = 2) => String(n).padStart(len, "0");

    function tick() {
      const diff = target - Date.now();
      const safe = Math.max(diff, 0);
      const days = Math.floor(safe / 86400000);
      const hours = Math.floor((safe % 86400000) / 3600000);
      const minutes = Math.floor((safe % 3600000) / 60000);
      const seconds = Math.floor((safe % 60000) / 1000);
      if (nodes.days) nodes.days.textContent = pad(days, days > 99 ? 3 : 2);
      if (nodes.hours) nodes.hours.textContent = pad(hours);
      if (nodes.minutes) nodes.minutes.textContent = pad(minutes);
      if (nodes.seconds) nodes.seconds.textContent = pad(seconds);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* =====================================================
     Simpan tanggal (.ics)
     ===================================================== */
  function addToCalendar() {
    const start = new Date(C.wedding.dateISO);
    const end = new Date(start.getTime() + 6 * 3600000);
    const fmt = (d) =>
      d
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");
    const location = C.events
      .map((ev) => `${ev.venue}, ${ev.address}`)
      .join(" | ");
    const coupleName = `${C.couple.bride.name} & ${C.couple.groom.name}`;
    const coupleSlug = `${C.couple.bride.name}-${C.couple.groom.name}`.replace(
      /\s+/g,
      "-",
    );
    const calTitle = C.wedding.calendarTitle || `Pernikahan ${coupleName}`;
    const calDesc =
      C.wedding.calendarDescription ||
      `Akad nikah dan resepsi pernikahan ${coupleName}.`;
    const description =
      `${calDesc} ${location} ${C.couple.hashtag || ""}`.trim();
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      `PRODID:-//${coupleName}//Wedding Invitation//ID`,
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@${coupleSlug}-wedding`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${calTitle}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:Pernikahan ${coupleName} besok`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const datePart = (C.wedding.dateShort || "wedding").replace(
      /\s*[·.]\s*/g,
      "-",
    );
    link.download = `${coupleSlug}-${datePart}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast("Undangan kalender diunduh.");
  }

  /* =====================================================
     RSVP & ucapan
     ===================================================== */
  let remoteWishes = [];
  let isFetchingRemote = false;
  let pollingInterval = null;

  function loadWishes() {
    let stored = [];
    try {
      const raw = localStorage.getItem(STORAGE_RSVP);
      if (raw) stored = JSON.parse(raw);
      if (!Array.isArray(stored)) stored = [];
    } catch (e) {
      stored = [];
    }

    const seeds = (C.rsvp?.seedWishes || []).map((wish, i) => ({
      ...wish,
      createdAt:
        wish.createdAt ||
        Date.now() -
          Number((wish.timeLabel || "").match(/\d+/)?.[0] || 1) * 86400000 -
          (i + 1) * 60000,
    }));

    // Gabungkan: ucapan lokal (localStorage) + online (Google Sheets) + seed bawaan
    const combined = [...stored, ...remoteWishes, ...seeds];
    const seen = new Set();
    const unique = [];

    for (const w of combined) {
      const key = `${(w.name || "").trim().toLowerCase()}_${(w.message || "").trim().toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(w);
      }
    }

    return unique.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  async function fetchRemoteWishes({ silent = false } = {}) {
    if (!C.rsvp?.endpoint || isFetchingRemote) return;
    isFetchingRemote = true;
    try {
      const res = await fetch(C.rsvp.endpoint, { method: "GET" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const prevCount = remoteWishes.length;
        remoteWishes = data.map((item) => ({
          name: item.name || "Tamu",
          attendance: item.attendance || "Hadir",
          guests: item.guests || "1",
          message: item.message || "",
          createdAt:
            typeof item.createdAt === "number"
              ? item.createdAt
              : new Date(item.createdAt).getTime() || Date.now(),
        }));
        if (remoteWishes.length !== prevCount || !silent) {
          renderWishes({ preserveScroll: silent });
        }
      }
    } catch (err) {
      if (!silent) console.info("Mode ucapan offline / lokal aktif.");
    } finally {
      isFetchingRemote = false;
    }
  }

  function startWishesRealtime() {
    // 1. Sinkronisasi multi-tab secara instan
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_RSVP) {
        renderWishes({ preserveScroll: true });
      }
    });

    // 2. Realtime polling berkala dari online database (setiap 10 detik saat tab aktif)
    if (!C.rsvp?.endpoint) return;

    function poll() {
      if (document.visibilityState === "visible") {
        fetchRemoteWishes({ silent: true });
      }
    }

    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(poll, 10000);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        fetchRemoteWishes({ silent: true });
        if (!pollingInterval) pollingInterval = setInterval(poll, 10000);
      } else {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
      }
    });
  }

  function saveWish(wish) {
    let stored = [];
    try {
      const raw = localStorage.getItem(STORAGE_RSVP);
      if (raw) stored = JSON.parse(raw);
      if (!Array.isArray(stored)) stored = [];
    } catch (e) {
      stored = [];
    }
    stored.unshift(wish);
    try {
      localStorage.setItem(STORAGE_RSVP, JSON.stringify(stored));
    } catch (e) {}
  }

  function timeAgo(ts) {
    if (!ts) return "";
    const diff = Math.max(Date.now() - ts, 0);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari lalu`;
    return new Date(ts).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  }

  function renderWishes({ preserveScroll = false } = {}) {
    const list = $("#wishesList");
    if (!list) return;
    const previousScrollTop = list.scrollTop;
    const empty = $("#wishesEmpty");
    const wishes = loadWishes();
    list.innerHTML = "";

    wishes.forEach((wish) => {
      const li = document.createElement("li");
      const isRecent = Date.now() - (wish.createdAt || 0) < 20000;
      li.className = isRecent ? "wish wish--recent" : "wish";

      const top = document.createElement("div");
      top.className = "wish__top";

      const name = document.createElement("span");
      name.className = "wish__name";
      name.textContent = wish.name;

      top.appendChild(name);

      if (wish.attendance) {
        const badge = document.createElement("span");
        badge.className = "wish__badge";
        badge.textContent = wish.attendance;
        top.appendChild(badge);
      }

      const time = document.createElement("span");
      time.className = "wish__time";
      time.textContent = wish.timeLabel || timeAgo(wish.createdAt);
      top.appendChild(time);

      const message = document.createElement("p");
      message.className = "wish__message";
      message.textContent = wish.message;

      li.append(top, message);
      list.appendChild(li);
    });

    const countEl = $("#wishesCount");
    if (countEl) countEl.textContent = `${wishes.length} ucapan`;
    if (empty) empty.hidden = wishes.length > 0;

    if (preserveScroll && previousScrollTop > 30) {
      list.scrollTop = previousScrollTop;
    }
  }

  function initRsvp() {
    renderWishes();
    fetchRemoteWishes();
    startWishesRealtime();

    const form = $("#rsvpForm");
    if (!form) return;
    const guests = $("#rsvpGuests");
    const success = $("#rsvpSuccess");
    const nameInput = $("#rsvpName");
    const messageInput = $("#rsvpMessage");

    function setError(input, message) {
      const field = input.closest(".field");
      const error = field?.querySelector(".field__error");
      field?.classList.toggle("has-error", Boolean(message));
      if (error) error.textContent = message || "";
    }

    function clearErrors() {
      $$(".field", form).forEach((field) =>
        field.classList.remove("has-error"),
      );
      $$(".field__error", form).forEach((el) => (el.textContent = ""));
    }

    $$('input[name="attendance"]', form).forEach((radio) => {
      radio.addEventListener("change", () => {
        const attending =
          form.querySelector('input[name="attendance"]:checked')?.value ===
          "Hadir";
        if (guests) {
          guests.disabled = !attending;
          if (!attending) guests.value = "1";
        }
        const field = radio.closest(".field");
        field?.classList.remove("has-error");
        field?.querySelector(".field__error")?.replaceChildren();
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors();
      success.textContent = "";

      const attendance =
        form.querySelector('input[name="attendance"]:checked')?.value || "";
      const name = nameInput.value.trim();
      const message = messageInput.value.trim();
      let valid = true;

      if (name.length < 2) {
        setError(nameInput, "Mohon isi nama Anda.");
        valid = false;
      }
      if (!attendance) {
        const field = form
          .querySelector('input[name="attendance"]')
          .closest(".field");
        field?.classList.add("has-error");
        const error = field?.querySelector(".field__error");
        if (error) error.textContent = "Mohon pilih konfirmasi kehadiran.";
        valid = false;
      }
      if (message.length < 3) {
        setError(messageInput, "Mohon tuliskan ucapan atau doa Anda.");
        valid = false;
      }
      if (!valid) {
        form
          .querySelector(
            '.has-error input, .has-error textarea, .has-error [type="radio"]',
          )
          ?.focus();
        return;
      }

      const wish = {
        name,
        attendance,
        guests: attendance === "Hadir" && guests ? guests.value : "0",
        message,
        createdAt: Date.now(),
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      const original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Mengirim...";

      try {
        if (C.rsvp.endpoint) {
          try {
            await fetch(C.rsvp.endpoint, {
              method: "POST",
              mode: "no-cors",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify(wish),
            });
          } catch (e) {
            console.warn("Endpoint error, saving locally:", e);
          }
        }
        // Simpan selalu ke JSON lokal agar langsung update di bawahnya
        saveWish(wish);
        renderWishes();

        const wishesList = $("#wishesList");
        if (wishesList) {
          wishesList.scrollTo({
            top: 0,
            behavior: reduceMotion ? "auto" : "smooth",
          });
        }

        form.reset();
        if (guests) guests.disabled = false;
        const guest = getGuestName();
        if (guest && nameInput) nameInput.value = guest;
        success.textContent =
          attendance === "Hadir"
            ? `Terima kasih, ${name}. Kami menantikan kehadiran Anda.`
            : `Terima kasih, ${name}. Doa Anda sangat berarti bagi kami.`;
        toast("Ucapan berhasil dikirim.");
        success.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "nearest",
        });
      } catch (err) {
        toast("Maaf, ucapan gagal dikirim. Silakan coba lagi.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
      }
    });
  }

  /* =====================================================
     Lightbox
     ===================================================== */
  let lightboxIndex = 0;
  let lightboxTrigger = null;

  function showLightboxImage(index) {
    const total = C.gallery.length;
    lightboxIndex = (index + total) % total;
    const item = C.gallery[lightboxIndex];
    $("#lightboxImg").src = item.src;
    $("#lightboxImg").alt = item.alt;
    $("#lightboxCap").textContent =
      `${item.caption} · ${lightboxIndex + 1} / ${total}`;
  }

  function openLightbox(index) {
    lightboxTrigger = document.activeElement;
    lightbox.hidden = false;
    showLightboxImage(index);
    lockScroll();
    requestAnimationFrame(() => {
      lightbox.classList.add("is-open");
      $("#lightboxClose").focus();
    });
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    unlockScroll();
    setTimeout(
      () => {
        lightbox.hidden = true;
        if (lightboxTrigger) lightboxTrigger.focus();
      },
      reduceMotion ? 0 : 380,
    );
  }

  function initLightbox() {
    $("#lightboxClose")?.addEventListener("click", closeLightbox);
    $("#lightboxPrev")?.addEventListener("click", () =>
      showLightboxImage(lightboxIndex - 1),
    );
    $("#lightboxNext")?.addEventListener("click", () =>
      showLightboxImage(lightboxIndex + 1),
    );
    lightbox?.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (event) => {
      if (!lightbox || lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showLightboxImage(lightboxIndex - 1);
      if (event.key === "ArrowRight") showLightboxImage(lightboxIndex + 1);
      trapFocus(lightbox, event);
    });
  }

  /* =====================================================
     Menu
     ===================================================== */
  let menuTrigger = null;

  function openMenu() {
    menuTrigger = document.activeElement;
    menu.hidden = false;
    lockScroll();
    if (page) page.inert = true;
    requestAnimationFrame(() => {
      menu.classList.add("is-open");
      $("#menuOpen")?.setAttribute("aria-expanded", "true");
      $(".menu__nav a")?.focus();
    });
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (menu.hidden) return;
    menu.classList.remove("is-open");
    if (page) page.inert = false;
    unlockScroll();
    $("#menuOpen")?.setAttribute("aria-expanded", "false");
    setTimeout(
      () => {
        menu.hidden = true;
        if (restoreFocus && menuTrigger) menuTrigger.focus();
      },
      reduceMotion ? 0 : 480,
    );
  }

  function initMenu() {
    $("#menuOpen")?.addEventListener("click", openMenu);
    $("#menuClose")?.addEventListener("click", () => closeMenu());
    $("#menuShare")?.addEventListener("click", shareInvitation);

    $$(".menu__nav a").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        closeMenu({ restoreFocus: false });
        if (target) {
          setTimeout(() => {
            target.scrollIntoView({
              behavior: reduceMotion ? "auto" : "smooth",
            });
          }, 30);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (menu.hidden) return;
      if (event.key === "Escape") closeMenu();
      trapFocus(menu, event);
    });
  }

  /* =====================================================
     Musik (menggunakan file mp3)
     ===================================================== */
  const Music = (() => {
    let audio = null;
    let started = false;
    let playing = false;

    function createAudio() {
      if (audio) return audio;
      audio = new Audio("assets/music/wedding.mp3");
      audio.loop = true;
      audio.preload = "auto";
      audio.volume =
        typeof C.music?.volume === "number" ? C.music.volume : 0.25;
      return audio;
    }

    return {
      start() {
        if (C.music?.enabled === false) return;
        try {
          createAudio();
          if (!started) {
            started = true;
          }
          if (!playing) {
            playing = true;
            const p = audio.play();
            if (p && typeof p.catch === "function") {
              p.catch(() => {});
            }
          }
          $("#musicToggle")?.classList.add("is-on");
          $("#musicToggle")?.setAttribute("aria-pressed", "true");
          $("#musicToggle")?.setAttribute("aria-label", "Matikan musik");
        } catch (e) {
          // ignore
        }
      },
      toggle() {
        if (C.music?.enabled === false) return;
        try {
          createAudio();
          if (!started) {
            this.start();
            return;
          }
          playing = !playing;
          if (playing) {
            const p = audio.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
          } else {
            audio.pause();
          }
          const btn = $("#musicToggle");
          btn?.classList.toggle("is-on", playing);
          btn?.setAttribute("aria-pressed", String(playing));
          btn?.setAttribute(
            "aria-label",
            playing ? "Matikan musik" : "Nyalakan musik",
          );
          if (!playing) toast("Musik dimatikan.");
        } catch (e) {
          // ignore
        }
      },
      get playing() {
        return playing;
      },
    };
  })();

  function initMusic() {
    if (C.music?.enabled === false) {
      $("#musicToggle")?.remove();
      return;
    }
    $("#musicToggle")?.addEventListener("click", () => Music.toggle());
  }

  /* =====================================================
     Reveal on scroll
     ===================================================== */
  let revealObserver = null;
  function initReveal() {
    if (revealObserver) {
      $$(".reveal").forEach((el) => revealObserver.observe(el));
      return;
    }
    if (!("IntersectionObserver" in window) || reduceMotion) {
      $$(".reveal").forEach((el) => el.classList.add("is-in"));
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    $$(".reveal").forEach((el) => revealObserver.observe(el));
  }

  /* =====================================================
     Buka undangan (Luxury Envelope Unfolding)
     ===================================================== */
  function openInvitation() {
    if (
      !cover ||
      cover.classList.contains("is-open") ||
      cover.classList.contains("is-opening")
    )
      return;

    cover.classList.add("is-opening");
    const envelope = $("#envelope");
    if (envelope) {
      envelope.classList.add("is-unfolding");
    }

    try {
      Music.start();
    } catch (e) {}

    const triggerOpen = () => {
      cover.classList.add("is-open");
      body.classList.add("is-open");
      if (page) page.inert = false;

      const finish = () => {
        cover.hidden = true;
        unlockScroll();
        initReveal();
        const opening = $("#opening");
        if (opening) {
          opening.tabIndex = -1;
          try {
            opening.focus({ preventScroll: true });
          } catch (e) {}
        }
      };

      if (reduceMotion) {
        finish();
      } else {
        setTimeout(finish, 850);
      }
    };

    if (reduceMotion) {
      triggerOpen();
    } else {
      setTimeout(triggerOpen, 380);
    }
  }

  /* =====================================================
     Topbar state & misc
     ===================================================== */
  function initTopbar() {
    if (!("IntersectionObserver" in window)) return;
    const opening = $("#opening");
    if (!opening) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        topbar.classList.toggle("is-scrolled", !entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(opening);
  }

  function initAnchors() {
    $$('a[href^="#"]').forEach((link) => {
      if (link.closest(".menu")) return;
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  /* =====================================================
     Init
     ===================================================== */
  function init() {
    try {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    } catch (e) {}

    body.classList.add("is-ready");
    initTheme();
    initGuest();
    renderContent();
    initRsvp();
    initLightbox();
    initMenu();
    initMusic();
    initTopbar();
    initAnchors();

    // Hanya segel lilin (Wax Seal) yang dapat membuka undangan
    const openTrigger = $("#openInvite");
    if (openTrigger) {
      openTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        openInvitation();
      });
    }

    // Kunci scroll / swipe di halaman awal (cover) agar tidak bisa discroll
    if (cover) {
      const preventCoverScroll = (e) => {
        if (!cover.classList.contains("is-open")) {
          e.preventDefault();
        }
      };
      cover.addEventListener("wheel", preventCoverScroll, { passive: false });
      cover.addEventListener("touchmove", preventCoverScroll, { passive: false });
    }
    $("#addCalendar")?.addEventListener("click", addToCalendar);
    $("#shareInvite")?.addEventListener("click", shareInvitation);
    $("#footerShare")?.addEventListener("click", shareInvitation);

    window.WEDDING_RENDER = renderContent;
    window.exportWishesJSON = () => {
      const wishes = loadWishes();
      const blob = new Blob([JSON.stringify(wishes, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ucapan-pernikahan.json";
      a.click();
      URL.revokeObjectURL(url);
    };
    window.clearWishes = () => {
      localStorage.removeItem(STORAGE_RSVP);
      renderWishes();
    };

    // Label tanggal footer sudah diset dari config.

    // Tema dikunci ke warna ceria.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
