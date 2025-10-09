const API_KEY = "SVWpAjMhVlMCOTpDYDJUOKw3M4MPDTcM";
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

function openModal(event) {
  modalImage.src = event.images[0].url;
  modalTitle.textContent = event.name;
  modalDate.textContent = event.dates.start.localDate;
  modalVenue.textContent = event._embedded.venues[0].name;
  modalCity.textContent = event._embedded.venues[0].city.name;
  modalPrice.textContent = event.priceRanges
    ? `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}`
    : "300-500 UAH";
  modalLink.href = event.url;

  modal.style.display = "flex";
}

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

select.addEventListener("change", () => {
  const countryCode = select.value;
  container.innerHTML = "<div class='message'>Завантаження подій...</div>";

  if (!countryCode) {
    container.innerHTML = "<div class='message'>Оберіть країну зі списку</div>";
    return;
  }

  fetch(
    `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&countryCode=${countryCode}&size=12`
  )
    .then((response) => response.json())
    .then((data) => {
      container.innerHTML = "";

      const events = (data._embedded && data._embedded.events) || [];

      if (events.length === 0) {
        container.innerHTML =
          "<div class='message'>Немає подій для цієї країни</div>";
        return;
      }

      events.forEach((event) => {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
          <img src="${event.images[0].url}" alt="${event.name}">
          <h3>${event.name}</h3>
          <p>${event.dates.start.localDate}</p>
          <p>${event._embedded.venues[0].name}</p>
        `;
        card.addEventListener("click", () => openModal(event));
        container.appendChild(card);
      });
    })
    .catch((error) => {
      console.error(error);
      container.innerHTML =
        "<div class='message'>Помилка завантаження подій</div>";
    });
});
