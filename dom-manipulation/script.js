let quotes = [
  { text: "Knowledge is power.", category: "Education" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available for this category.</p>`;
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please fill in both the quote and the category.");
    return;
  }

  const newQuote = { text: newText, category: newCategory };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  textInput.value = "";
  categoryInput.value = "";

  showRandomQuote();
}

function populateCategories() {
  const categories = ["all"];
  quotes.forEach(q => {
    if (!categories.includes(q.category)) {
      categories.push(q.category);
    }
  });
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    categoryFilter.value = savedCategory;
  }
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

function getFilteredQuotes() {
  const selected = categoryFilter.value;
  if (selected === "all") return quotes;
  return quotes.filter(q => q.category === selected);
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch {
      quotes = [];
    }
  }
}

function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format!");
      }
    } catch {
      alert("Failed to parse JSON.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data.map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch {
    return [];
  }
}

async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    if (!response.ok) throw new Error("Failed to post");
    return await response.json();
  } catch {
    return null;
  }
}

async function syncQuotes() {
  syncStatus.textContent = "Syncing...";
  const serverQuotes = await fetchQuotesFromServer();
  // Server data overwrites local if conflict
  quotes = serverQuotes.length ? serverQuotes : quotes;
  saveQuotes();
  populateCategories();
  filterQuotes();
  syncStatus.style.color = "green";
  syncStatus.textContent = "Quotes synced with server!";
  setTimeout(() => {
    syncStatus.textContent = "";
  }, 4000);
}

function periodicSync() {
  setInterval(() => {
    syncQuotes();
  }, 60000); // every 60 seconds
}

loadQuotes();
populateCategories();
filterQuotes();
showRandomQuote();
periodicSync();

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
