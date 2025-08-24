let quotes = [];

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "Knowledge is power.", category: "Education" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote(filteredQuotes = quotes) {
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
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
  textInput.value = "";
  categoryInput.value = "";
  filterQuotes();
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem('selectedCategory', selectedCategory);
  if (selectedCategory === "all") {
    showRandomQuote(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selectedCategory);
    showRandomQuote(filtered);
  }
}

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    if (Array.isArray(importedQuotes)) {
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert('Quotes imported successfully!');
      filterQuotes();
    } else {
      alert("Invalid JSON format.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

async function syncWithServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

    const mergedQuotes = resolveConflicts(localQuotes, serverQuotes);

    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();
    notifyUser("Data synced successfully with server.");
    localStorage.setItem('lastSync', new Date().toISOString());

  } catch (error) {
    notifyUser("Failed to sync with server.");
  }
}

function resolveConflicts(local, server) {
  const existingTexts = new Set(local.map(q => q.text));
  const newServerQuotes = server.filter(q => !existingTexts.has(q.text));
  return [...local, ...newServerQuotes];
}

function notifyUser(message) {
  const status = document.getElementById("syncStatus");
  status.textContent = message;
  status.style.color = "green";
  setTimeout(() => {
    status.textContent = "";
  }, 3000);
}

document.getElementById("newQuote").addEventListener("click", filterQuotes);

loadQuotes();
populateCategories();
const savedFilter = localStorage.getItem('selectedCategory');
if (savedFilter) {
  document.getElementById("categoryFilter").value = savedFilter;
  filterQuotes();
} else {
  showRandomQuote();
}

setInterval(syncWithServer, 60000);
