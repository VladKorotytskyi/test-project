const API_KEY = "SVWpAjMhVlMCOTpDYDJUOKw3M4MPDTcM";
const API_URL = "https://app.ticketmaster.com/discovery/v2";

const refs = {
  form: document.querySelector(".hero-form"),
  input: document.querySelector(".hero-input"),
  select: document.getElementById("countrySelect"),
  events: document.getElementById("eventsContainer"),
  pagination: document.getElementById("pagination"),
  modal: document.getElementById("eventModal"),
  modalImg: document.getElementById("modalImage"),
  modalTitle: document.getElementById("modalTitle"),
  modalDate: document.getElementById("modalDate"),
  modalCity: document.getElementById("modalCity"),
  modalVenue: document.getElementById("modalVenue"),
  modalPrice: document.getElementById("modalPrice"),
  modalLink: document.getElementById("modalLink"),
  modalClose: document.querySelector(".modal-close"),
};

let state = { page: 1, country: "", keyword: "", pager: null };

function itemsPerPage() {
  if (window.innerWidth < 480) return 12;
  if (window.innerWidth < 900) return 16;
  return 24;
}

function showMessage(text) {
  refs.events.innerHTML = `<div class="message">${text}</div>`;
}

function fetchEvents(country, keyword, page) {
  const params = new URLSearchParams({
    apikey: API_KEY,
    size: itemsPerPage(),
    page: page - 1,
  });
  if (country) params.append("countryCode", country);
  if (keyword) params.append("keyword", keyword);

  return fetch(`${API_URL}/events.json?${params}`).then((res) => {
    if (!res.ok) {
      return { error: true };
    }
    return res.json();
  });
}

function fetchEventById(id) {
  return fetch(`${API_URL}/events/${id}.json?apikey=${API_KEY}`).then((res) => {
    if (!res.ok) {
      return { error: true };
    }
    return res.json();
  });
}

function makeCard(ev) {
  let img = "src/img/pic.png";
  if (ev.images && ev.images[0] && ev.images[0].url) img = ev.images[0].url;
  let name = ev.name || "Без назви";
  let date = "-";
  if (ev.dates && ev.dates.start && ev.dates.start.localDate)
    date = ev.dates.start.localDate;
  let venue = "-";
  if (
    ev._embedded &&
    ev._embedded.venues &&
    ev._embedded.venues[0] &&
    ev._embedded.venues[0].name
  ) {
    venue = ev._embedded.venues[0].name;
  }
  return `
    <div class="event-card" data-id="${ev.id}">
      <img src="${img}" alt="${name}">
      <h3>${name}</h3>
      <p>${date}</p>
      <p>${venue}</p>
    </div>
  `;
}

function renderEvents(events) {
  let html = "";
  events.forEach((event) => {
    html += makeCard(event);
  });
  refs.events.innerHTML = html;
}

function openModal(ev) {
  let img = "src/img/pic.png";
  if (ev.images && ev.images[0] && ev.images[0].url) img = ev.images[0].url;
  refs.modalImg.src = img;
  refs.modalTitle.textContent = ev.name || "-";
  let date = "-";
  if (ev.dates && ev.dates.start && ev.dates.start.localDate)
    date = ev.dates.start.localDate;
  refs.modalDate.textContent = date;
  let city = "-";
  if (
    ev._embedded &&
    ev._embedded.venues &&
    ev._embedded.venues[0] &&
    ev._embedded.venues[0].city &&
    ev._embedded.venues[0].city.name
  ) {
    city = ev._embedded.venues[0].city.name;
  }
  refs.modalCity.textContent = city;
  let venue = "-";
  if (
    ev._embedded &&
    ev._embedded.venues &&
    ev._embedded.venues[0] &&
    ev._embedded.venues[0].name
  ) {
    venue = ev._embedded.venues[0].name;
  }
  refs.modalVenue.textContent = venue;
  let price = "-";
  if (ev.priceRanges && ev.priceRanges[0]) {
    price =
      ev.priceRanges[0].min +
      " - " +
      ev.priceRanges[0].max +
      " " +
      ev.priceRanges[0].currency;
  }
  refs.modalPrice.textContent = price;
  refs.modalLink.href = ev.url || "#";
  refs.modal.style.display = "flex";
}

function closeModal() {
  refs.modal.style.display = "none";
}

function destroyPager() {
  if (state.pager) {
    state.pager = null;
  }
}

function createPager(totalItemsCount) {
  destroyPager();

  const isMobile = window.innerWidth < 480;
  const visiblePages = isMobile ? 3 : 5;

  state.pager = new tui.Pagination(refs.pagination, {
    totalItems: totalItemsCount,
    itemsPerPage: itemsPerPage(),
    visiblePages: visiblePages,
    centerAlign: true,
  });

  state.pager.on("afterMove", (event) => {
    state.page = event.page;
    loadEvents();
  });
}

function loadEvents() {
  showMessage("Завантаження подій...");
  fetchEvents(state.country, state.keyword, state.page)
    .then((data) => {
      if (!data || data.error) {
        showMessage("Помилка завантаження");
        destroyPager();
        return;
      }
      let events = [];
      if (data._embedded && data._embedded.events)
        events = data._embedded.events;
      let total = 0;
      if (data.page && data.page.totalElements) total = data.page.totalElements;
      if (events.length === 0) {
        showMessage("Немає подій");
        destroyPager();
        return;
      }
      renderEvents(events);
      if (!state.pager) createPager(total);
    })
    .catch(() => {
      showMessage("Помилка завантаження");
      destroyPager();
    });
}

refs.form.addEventListener("submit", (e) => {
  e.preventDefault();
  state.page = 1;
  state.keyword = refs.input.value.trim();
  state.country = refs.select.value;
  if (!state.keyword && !state.country) {
    showMessage("Введіть запит або оберіть країну");
    destroyPager();
    return;
  }
  loadEvents();
});

refs.select.addEventListener("change", () => {
  state.page = 1;
  state.country = refs.select.value;
  state.keyword = refs.input.value.trim();
  if (!state.keyword && !state.country) {
    showMessage("Оберіть країну або введіть запит");
    destroyPager();
    return;
  }
  loadEvents();
});

refs.events.addEventListener("click", (event) => {
  const card = event.target.closest(".event-card");
  if (!card) return;

  const eventId = card.dataset.id;

  fetchEventById(eventId)
    .then((data) => {
      if (!data || data.error) {
        alert("Не вдалося завантажити деталі");
        return;
      }

      const ev = data.id ? data : data._embedded?.events?.[0];
      if (ev) openModal(ev);
    })
    .catch(() => alert("Помилка завантаження деталей"));
});

refs.modalClose?.addEventListener("click", closeModal);

refs.modal.addEventListener("click", (event) => {
  if (event.target === refs.modal) closeModal();
});

window.addEventListener("resize", () => {
  clearTimeout(window._resizeTimer);
  window._resizeTimer = setTimeout(() => {
    if (!state.pager) return;
    state.page = 1;
    destroyPager();
    loadEvents();
  }, 250);
});


loadEvents();
