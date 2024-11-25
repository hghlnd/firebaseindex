let items = localStorage.getItem('items') ? JSON.parse(localStorage.getItem('items')) : [];
let reminderIntervalId = null;

document.addEventListener('DOMContentLoaded', displayItems);

document.getElementById('addItemButton').addEventListener('click', function() {
    let itemInput = document.getElementById('itemInput');
    let itemName = itemInput.value.trim();
    if (itemName !== "") {
        items.push(itemName);
        localStorage.setItem('items', JSON.stringify(items));
        displayItems();
        itemInput.value = "";
    } else {
        alert('Please enter an item name');
    }
});

function displayItems() {
    let itemList = document.getElementById('itemList');
    itemList.innerHTML = '';
    items.forEach(function(item, index) {
        let listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${item}`;
        itemList.appendChild(listItem);
    });
}

document.getElementById('setReminderButton').addEventListener('click', function() {
    let intervalInput = document.getElementById('reminderInterval').value;
    let interval = parseInt(intervalInput) * 60 * 1000;
    if (interval > 0) {
        if (reminderIntervalId) clearInterval(reminderIntervalId);
        reminderIntervalId = setInterval(function() {
            alert(`Check your pockets! Make sure you have your: ${items.join(', ')}`);
        }, interval);
        alert(`Reminder set for every ${intervalInput} minutes.`);
    } else {
        alert('Please enter a valid time interval.');
    }
});

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installButton').style.display = 'block';
});

document.getElementById('installButton').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            document.getElementById('installButton').style.display = 'none';
        }
        deferredPrompt = null;
    }
});

document.getElementById('clearItemsButton').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all items?')) {
        items = [];
        localStorage.removeItem('items');
        displayItems();
    }
});
