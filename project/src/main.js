const API_KEY = "SVWpAjMhVlMCOTpDYDJUOKw3M4MPDTcM";

// Елементи сторінки
const select = document.getElementById("countrySelect");
const container = document.getElementById("eventsContainer");
const modal = document.getElementById("eventModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalVenue = document.getElementById("modalVenue");
const modalCity = document.getElementById("modalCity");
const modalPrice = document.getElementById("modalPrice");
const modalLink = document.getElementById("modalLink");
const modalClose = document.querySelector(".modal-close");

const searchInput = document.querySelector(".hero-input");
const searchForm = document.querySelector(".hero-form");

// Відкрити модальне вікно
function openModal(event) {
  modalImage.src = event.images?.[0]?.url || "src/img/pic.png";
  modalTitle.textContent = event.name || "Подія";
  modalDate.textContent = event.dates?.start?.localDate || "—";
  modalVenue.textContent = event._embedded?.venues?.[0]?.name || "—";
  modalCity.textContent = event._embedded?.venues?.[0]?.city?.name || "—";
  modalPrice.textContent = event.priceRanges
    ? `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}`
    : "—";
  modalLink.href = event.url || "#";

  modal.style.display = "flex";
}

// Закриття модалки
modalClose.addEventListener("click", () => (modal.style.display = "none"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Відображення карток подій
function renderEvents(events) {
  container.innerHTML = "";
  events.forEach((event) => {
    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <img src="${event.images?.[0]?.url || "src/img/pic.png"}" alt="${
      event.name
    }">
      <h3>${event.name}</h3>
      <p>${event.dates?.start?.localDate || "—"}</p>
      <p>${event._embedded?.venues?.[0]?.name || "—"}</p>
    `;

    card.addEventListener("click", () => openModal(event));
    container.appendChild(card);
  });
}

function loadEvents(countryCode = "", keyword = "") {
  container.innerHTML = "<div class='message'>Завантаження подій...</div>";
  let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&size=12`;
  if (countryCode) url += `&countryCode=${countryCode}`;
  if (keyword) url += `&keyword=${keyword}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const events = data._embedded?.events || [];
      if (!events.length) {
        container.innerHTML =
          "<div class='message'>Немає подій за цим запитом</div>";
        return;
      }
      renderEvents(events);
    })
    .catch(() => {
      container.innerHTML =
        "<div class='message'>Помилка завантаження подій</div>";
    });
}

// Зміна країни
select.addEventListener("change", () => {
  const countryCode = select.value;
  if (!countryCode) {
    container.innerHTML = "<div class='message'>Оберіть країну зі списку</div>";
    return;
  }
  loadEvents(countryCode, searchInput.value.trim());
});
// Пошук за ключовим словом
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const keyword = searchInput.value.trim();
  const countryCode = select.value;

  if (!keyword && !countryCode) {
    container.innerHTML =
      "<div class='message'>Введіть назву або оберіть країну</div>";
    return;
  }
  loadEvents(countryCode, keyword);
});
