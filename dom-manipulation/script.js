let quotes = [
  { text: "Knowledge is power.", category: "Education" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" }
];

// تحميل الاقتباسات من localStorage لو موجودة
function loadQuotes() {
  const savedQuotes = localStorage.getItem("quotes");
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  }
}

// حفظ الاقتباسات في localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes available.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;
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

  textInput.value = "";
  categoryInput.value = "";

  showRandomQuote();
}

// دالة لجلب الاقتباسات من "السيرفر" (API وهمي)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await response.json();

    // تحويل البيانات من السيرفر إلى صيغة الاقتباسات (نجعل body كـ نص الاقتباس)
    const serverQuotes = data.map(item => ({
      text: item.body,
      category: "Server"
    }));

    return serverQuotes;
  } catch (error) {
    console.error("Failed to fetch quotes from server:", error);
    return [];
  }
}

// دالة لمزامنة الاقتباسات مع السيرفر
async function syncWithServer() {
  const syncStatus = document.getElementById("syncStatus");
  syncStatus.textContent = "Syncing with server...";

  const serverQuotes = await fetchQuotesFromServer();

  // حل تعارض بسيط: دمج الاقتباسات مع إعطاء أولوية لاقتباسات السيرفر (لو فيه نص مشابه، نتجاهل الاقتباسات المحلية)
  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(q => q.text === serverQuote.text);
    if (!exists) {
      quotes.push(serverQuote);
    }
  });

  saveQuotes();
  showRandomQuote();

  syncStatus.textContent = "Sync completed! Quotes updated from server.";
  setTimeout(() => {
    syncStatus.textContent = "";
  }, 3000);
}

// وظيفة لتصدير الاقتباسات كملف JSON للتحميل
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

// وظيفة لاستيراد الاقتباسات من ملف JSON
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      // تحقق من صيغة البيانات المستوردة
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid JSON format");

      importedQuotes.forEach(q => {
        if (q.text && q.category) {
          // أضف اقتباس جديد فقط إذا لم يكن موجوداً
          const exists = quotes.some(existing => existing.text === q.text);
          if (!exists) quotes.push(q);
        }
      });

      saveQuotes();
      showRandomQuote();
      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Failed to import quotes: " + error.message);
    }
  };
  reader.readAsText(file);
}

// حدث عند تحميل الصفحة
window.onload = () => {
  loadQuotes();
  showRandomQuote();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
};
