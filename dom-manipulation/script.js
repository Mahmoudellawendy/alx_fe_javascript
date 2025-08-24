let quotes = [
  { text: "Knowledge is power.", category: "Education" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" }
];

// Load and save quotes to localStorage
function loadQuotes() {
  const savedQuotes = localStorage.getItem("quotes");
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show random quote filtered by category
function showRandomQuote() {
  const filterSelect = document.getElementById("categoryFilter");
  const selectedCategory = filterSelect.value;

  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  const quoteDisplay = document.getElementById("quoteDisplay");

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;
}

// Add a new quote
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

  textInput.value = "";
  categoryInput.value = "";

  populateCategories();
  showRandomQuote();
}

// Populate categories dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = Array.from(new Set(quotes.map(q => q.category)));

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter && categories.includes(savedFilter)) {
    categoryFilter.value = savedFilter;
  } else {
    categoryFilter.value = "all";
  }
}

function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
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
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid JSON format");

      importedQuotes.forEach(q => {
        if (q.text && q.category) {
          const exists = quotes.some(existing => existing.text === q.text);
          if (!exists) quotes.push(q);
        }
      });

      saveQuotes();
      populateCategories();
      showRandomQuote();
      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Failed to import quotes: " + error.message);
    }
  };
  reader.readAsText(file);
}

// *** دالة جلب الاقتباسات من السيرفر (GET) ***
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await response.json();

    return data.map(item => ({
      text: item.body,
      category: "Server"
    }));
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
}

// *** دالة ارسال الاقتباسات للسيرفر (POST) ***
async function postQuotesToServer(newQuotes) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newQuotes)
    });

    if (!response.ok) throw new Error("Failed to post quotes");
    const data = await response.json();
    console.log("Posted data:", data);
    return true;
  } catch (error) {
    console.error("Post failed:", error);
    return false;
  }
}

// *** دالة المزامنة الرئيسية ***
// بتجلب البيانات من السيرفر، وتحل التعارضات، وترسل بيانات جديدة إذا في
async function syncQuotes() {
  const syncStatus = document.getElementById("syncStatus");
  syncStatus.style.color = "black";
  syncStatus.textContent = "Syncing with server...";

  const serverQuotes = await fetchQuotesFromServer();

  // Conflict resolution: إذا الاقتباس موجود بالسيرفر ما نضيفش، نضيف اللي مش موجود فقط
  let newQuotesToPost = [];

  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(q => q.text === serverQuote.text);
    if (!exists) {
      quotes.push(serverQuote);
    }
  });

  // نبحث إذا عندنا اقتباسات جديدة مش موجودة في السيرفر
  quotes.forEach(localQuote => {
    const existsOnServer = serverQuotes.some(sq => sq.text === localQuote.text);
    if (!existsOnServer) {
      newQuotesToPost.push(localQuote);
    }
  });

  // نرسل الاقتباسات الجديدة للسيرفر
  if (newQuotesToPost.length > 0) {
    const postSuccess = await postQuotesToServer(newQuotesToPost);
    if (!postSuccess) {
      syncStatus.style.color = "red";
      syncStatus.textContent = "Failed to post some quotes to server.";
      return;
    }
  }

  saveQuotes();
  populateCategories();
  showRandomQuote();

  syncStatus.style.color = "green";
  syncStatus.textContent = "Sync completed!";

  setTimeout(() => {
    syncStatus.textContent = "";
  }, 4000);
}

// مزامنة دورية كل 60 ثانية
setInterval(() => {
  syncQuotes();
}, 60000);

window.onload = () => {
  loadQuotes();
  populateCategories();
  showRandomQuote();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
};
