// دي مصفوفة من الاقتباسات، كل عنصر فيها عبارة عن كائن (Object) فيه نص الاقتباس (text) وفئة الاقتباس (category)
let quotes = [
  { text: "Knowledge is power.", category: "Education" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" }
];

// دالة وظيفتها تعرض اقتباس عشوائي من المصفوفة
function showRandomQuote() {
  // أول حاجة بنحسب رقم عشوائي ما بين 0 وطول المصفوفة - 1
  const randomIndex = Math.floor(Math.random() * quotes.length);

  // بنجيب الاقتباس اللي رقمه هو الرقم العشوائي اللي حصلنا عليه
  const quote = quotes[randomIndex];

  // بنجيب العنصر اللي هنعرض فيه الاقتباس في صفحة الويب
  const quoteDisplay = document.getElementById("quoteDisplay");

  // هنا بنغير محتوى هذا العنصر عشان يظهر الاقتباس والفئة بتاعته
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;
}

// دالة وظيفتها تضيف اقتباس جديد حسب مدخلات المستخدم
function addQuote() {
  // بنجيب عناصر الحقول (input) اللي المستخدم بيكتب فيها الاقتباس والفئة
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  // بنجيب النصوص اللي المستخدم كتبها، وبنقص المسافات الزيادة في الأول والآخر
  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  // لو المستخدم نسي يكتب الاقتباس أو الفئة بنظهرله رسالة تحذير
  if (newText === "" || newCategory === "") {
    alert("Please fill in both the quote and the category.");
    return; // بنوقف الدالة هنا عشان ما نضيفش اقتباس فارغ
  }

  // بنعمل كائن جديد يمثل الاقتباس الجديد
  const newQuote = {
    text: newText,
    category: newCategory
  };

  // بنضيف الاقتباس الجديد لمصفوفة الاقتباسات
  quotes.push(newQuote);

  // بنمسح النصوص اللي المستخدم كتبها عشان تكون جاهزة لاقتباس جديد
  textInput.value = "";
  categoryInput.value = "";

  // بنعرض اقتباس عشوائي (اللي ممكن يكون الاقتباس الجديد)
  showRandomQuote();
}

// بنضيف حدث (Event Listener) لزر "Show New Quote" عشان لما المستخدم يضغط عليه، يعرض اقتباس جديد
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// بنضيف حدث لزر "Add Quote" عشان لما المستخدم يضغط عليه، يضيف الاقتباس الجديد
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

// في البداية بنعرض اقتباس عشوائي لما الصفحة تفتح
showRandomQuote();
