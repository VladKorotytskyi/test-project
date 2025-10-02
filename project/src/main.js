let countriesData = [];

fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
  .then(res => res.json())
  .then(result => {
    countriesData = result;

    const select = document.getElementById('countrySelect');

    const allowed = [
      "United States", "Canada", "United Kingdom",
      "Germany", "France", "Italy", "Spain",
      "Poland", "Ukraine", "China", "Japan",
      "India", "Brazil", "Australia"
    ];

    countriesData
      .filter(c => allowed.includes(c.name.common))
      .sort((a, b) => a.name.common.localeCompare(b.name.common))
      .forEach(country => {
        const option = document.createElement('option');
        option.value = country.cca2;
        option.textContent = country.name.common;
        select.appendChild(option);
      });
  })
  .catch(err => console.error("Помилка:", err));
