const listingsElement = document.getElementById("listings");
const searchInput = document.getElementById("search");
const countElement = document.getElementById("listing-count");
const formPanel = document.getElementById("form-panel");
const listingForm = document.getElementById("listing-form");
const formMessage = document.getElementById("form-message");

let allListings = [];

async function loadListings() {
  listingsElement.innerHTML = '<p class="empty">Loading listings...</p>';
  try {
    const response = await fetch("/api/listings");
    if (!response.ok) throw new Error("Could not load listings");
    allListings = await response.json();
    renderListings();
  } catch (error) {
    listingsElement.innerHTML = '<p class="empty">Could not connect to the server. Please refresh the page.</p>';
  }
}

function renderListings() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = allListings.filter(item =>
    [item.title, item.category, item.description, item.location]
      .join(" ").toLowerCase().includes(term)
  );

  countElement.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;
  if (!filtered.length) {
    listingsElement.innerHTML = '<p class="empty">No items found. Try another search or add the first listing.</p>';
    return;
  }

  listingsElement.innerHTML = filtered.map(item => `
    <article class="card">
      <div class="card-top">
        <span class="tag">${escapeHTML(item.category || "Other")}</span>
        <span class="price">€${Number(item.price).toFixed(2)}</span>
      </div>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.description || "No description provided.")}</p>
      <div class="card-top">
        <span class="tag">${escapeHTML(item.condition || "Used")}</span>
        <span class="location">${escapeHTML(item.location || "Location not provided")}</span>
      </div>
    </article>
  `).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

document.getElementById("show-form").addEventListener("click", () => {
  formPanel.classList.remove("hidden");
  formPanel.scrollIntoView({ behavior: "smooth" });
});
document.getElementById("cancel-form").addEventListener("click", () => {
  formPanel.classList.add("hidden");
  listingForm.reset();
  formMessage.textContent = "";
});
searchInput.addEventListener("input", renderListings);

listingForm.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(listingForm).entries());
  data.price = Number(data.price);
  formMessage.textContent = "Publishing...";

  try {
    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not publish listing");
    listingForm.reset();
    formMessage.textContent = "Your listing has been added.";
    await loadListings();
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

loadListings();
