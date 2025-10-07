const API_KEY = "SVWpAjMhVlMCOTpDYDJUOKw3M4MPDTcM";
const select = document.getElementById("countrySelect");
const container = document.getElementById("eventsContainer");
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
          <p><strong>Дата:</strong> ${event.dates.start.localDate}</p>
          <p><strong>Місто:</strong> ${event._embedded.venues[0].name}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch((error) => {
      console.error(error);
      container.innerHTML =
        "<div class='message'>Помилка завантаження подій</div>";
    });
});
