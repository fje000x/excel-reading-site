document.addEventListener('DOMContentLoaded', function() {
    const correctPassword = 'dc7010';
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitPassword = document.getElementById('submitPassword');
    const passwordError = document.getElementById('passwordError');
    
    submitPassword.addEventListener('click', function() {
        if (passwordInput.value === correctPassword) {
            passwordModal.style.display = 'none';
            document.querySelector('h1').style.display = 'block';
            document.getElementById('fileInput').style.display = 'block';

            // Check for saved table data in localStorage and display it
            if (localStorage.getItem('tableData')) {
                const savedData = JSON.parse(localStorage.getItem('tableData'));
                displayTable(savedData);
                document.getElementById('factContainer').style.display = 'block';
                fetchFactOfTheDay();
            }
        } else {
            passwordError.style.display = 'block';
        }
    });
});

document.getElementById('fileInput').addEventListener('change', handleFile, false);

function handleFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        displayTable(json);
        
        // Save to localStorage
        localStorage.setItem('tableData', JSON.stringify(json));

        // Display the fact container and fetch the fact of the day
        document.getElementById('factContainer').style.display = 'block';
        fetchFactOfTheDay();
    };
    
    reader.readAsArrayBuffer(file);
}

function displayTable(data) {
    const tableContainer = document.getElementById('tableContainer');
    let table = '<table><thead><tr>';
    
    // Create table headers
    data[0].forEach(header => {
        table += `<th>${header}</th>`;
    });
    table += '</tr></thead><tbody>';
    
    // Create table rows
    for (let i = 1; i < data.length; i++) {
        table += '<tr>';
        data[i].forEach((cell, index) => {
            if (i === 1 && index === 0) {
                table += `<td>🚀 ${cell || ''}</td>`; // Add rocket ship emoji to the first cell in the first row
            } else if (i === data.length - 1 && index === 0) {
                table += `<td>${cell || ''} 🐢</td>`; // Add turtle emoji to the last cell in the first column
            } else {
                table += `<td>${cell || ''}</td>`;
            }
        });
        table += '</tr>';
    }
    
    table += '</tbody></table>';
    tableContainer.innerHTML = table;
}

// Fetch and display the fact of the day
function fetchFactOfTheDay() {
    $.ajax({
        method: 'GET',
        url: 'https://api.api-ninjas.com/v1/facts',
        headers: { 'X-Api-Key': 'QzNoQcZqwpRUsyErjvW5KjQvwQaa7sANwbolgb8M' },
        contentType: 'application/json',
        success: function(result) {
            console.log(result);
            if (result.length > 0) {
                document.getElementById('fact').innerText = result[0].fact;
            } else {
                document.getElementById('fact').innerText = "No fact available.";
            }
        },
        error: function ajaxError(jqXHR) {
            console.error('Error: ', jqXHR.responseText);
            document.getElementById('fact').innerText = "Failed to load fact of the day.";
        }
    });
}

// Fetch a new fact every 5 minutes if the fact container is visible
setInterval(() => {
    if (document.getElementById('factContainer').style.display === 'block') {
        fetchFactOfTheDay();
    }
}, 300000); // 300000 ms = 5 minutes
