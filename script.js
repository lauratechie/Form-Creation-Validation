// script.js

let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteForm');
const exportJsonButton = document.getElementById('exportJson');
const importFileInput = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');

// --- Storage Functions ---
function loadQuotes() {
    const storedQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    if (storedQuotes.length > 0) {
        quotes = storedQuotes;
    } else {
        quotes = [
            { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
            { text: "Life is what happens when you're busy making other plans.", category: "Life" },
            { text: "You miss 100% of the shots you don’t take.", category: "Inspiration" }
        ];
    }
}

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Save last shown quote index to Session Storage
function saveLastQuoteIndex(index) {
    sessionStorage.setItem('lastQuoteIndex', index);
}

// Load last shown quote
function loadLastQuote() {
    const index = sessionStorage.getItem('lastQuoteIndex');
    if (index !== null && quotes[index]) {
        displayQuote(quotes[index]);
    } else {
        showRandomQuote();
    }
}

// --- Quote Display ---
function displayQuote(quote) {
    quoteDisplay.innerHTML = '';

    const quoteText = document.createElement('p');
    quoteText.textContent = `"${quote.text}"`;

    const quoteCategory = document.createElement('small');
    quoteCategory.textContent = `Category: ${quote.category}`;

    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);
}

// Filtered random quote
function showRandomQuote() {
    let filteredQuotes = quotes;

    const selectedCategory = categoryFilter.value;
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(q => q.category === selectedCategory);
    }

    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    displayQuote(filteredQuotes[randomIndex]);
    saveLastQuoteIndex(randomIndex);
}

// --- Add Quote Form ---
function createAddQuoteForm() {
    const quoteInput = document.createElement('input');
    quoteInput.id = 'newQuoteText';
    quoteInput.type = 'text';
    quoteInput.placeholder = 'Enter a new quote';

    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.onclick = addQuote;

    addQuoteFormContainer.appendChild(quoteInput);
    addQuoteFormContainer.appendChild(categoryInput);
    addQuoteFormContainer.appendChild(addButton);
}

// --- Add New Quote ---
function addQuote() {
    const quoteInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');

    const text = quoteInput.value.trim();
    const category = categoryInput.value.trim();

    if (text === "" || category === "") {
        alert("Please enter both quote text and category.");
        return;
    }

    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();

    // Update category dropdown if new category
    populateCategories();

    quoteInput.value = '';
    categoryInput.value = '';

    displayQuote(newQuote);
}

// --- Populate Categories ---
function populateCategories() {
    // Save current selection
    const currentSelection = categoryFilter.value;

    // Clear existing options except 'all'
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    const uniqueCategories = [...new Set(quotes.map(q => q.category))];
    uniqueCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    // Restore previous selection if still exists
    if (uniqueCategories.includes(currentSelection) || currentSelection === 'all') {
        categoryFilter.value = currentSelection;
    } else {
        categoryFilter.value = 'all';
    }

    // Save last selected category
    localStorage.setItem('lastCategory', categoryFilter.value);
}

// --- Filter Quotes ---
function filterQuotes() {
    showRandomQuote();
    localStorage.setItem('lastCategory', categoryFilter.value);
}

// --- Export JSON ---
function exportQuotesAsJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();

    URL.revokeObjectURL(url);
}

// --- Import JSON ---
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                populateCategories();
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid JSON format.');
            }
        } catch (err) {
            alert('Error reading JSON file.');
        }
    };
    reader.readAsText(file);
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', function() {
    loadQuotes();
    createAddQuoteForm();
    populateCategories();

    // Restore last selected category from localStorage
    const lastCategory = localStorage.getItem('lastCategory');
    if (lastCategory) categoryFilter.value = lastCategory;

    loadLastQuote();

    newQuoteButton.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    exportJsonButton.addEventListener('click', exportQuotesAsJson);
    importFileInput.addEventListener('change', importFromJsonFile);
});
