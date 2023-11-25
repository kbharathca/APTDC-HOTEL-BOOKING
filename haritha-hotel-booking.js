
$(document).ready(function () {
        // Initialize the datepickers
        $("#checkin").datepicker({
            dateFormat: 'dd-mm-yy',
            minDate: 0,
            onSelect: function (dateText, inst) {
                var checkinDate = $(this).datepicker('getDate');
                checkinDate.setDate(checkinDate.getDate() + 1);
                $("#checkout").datepicker('option', 'minDate', checkinDate);
            }
        }).datepicker("setDate", new Date());

        $("#checkout").datepicker({
            dateFormat: 'dd-mm-yy',
            minDate: 1
        }).datepicker("setDate", new Date().setDate(new Date().getDate() + 1));

        var locationSelect = document.getElementById("location");
        var checkinTimeSelect = document.getElementById("checkin-time");
        var checkoutTimeInput = document.getElementById("checkout-time");

        // Populate check-in time options
        populateCheckinTimeOptions();

        // Event listeners
        locationSelect.addEventListener('change', handleLocationChange);
        checkinTimeSelect.addEventListener('change', updateCheckoutTime);

        function populateCheckinTimeOptions() {
            for (var hour = 0; hour < 24; hour++) {
                var option = document.createElement("option");
                option.value = hour < 10 ? '0' + hour + ':00' : hour + ':00';
                option.textContent = option.value;
                checkinTimeSelect.appendChild(option);
            }
        }

  function handleLocationChange() {
    var selectedLocation = locationSelect.value;
    var checkinTime, checkoutTime;

    // Define location groups
    var group1 = ['6', '13', '14', '15', '16', '23', '38', '19', '36', '26', '22', '20', '21', '11'];
    var group2 = ['24', '28', '37'];
    var group3 = ['25', '40', '7', '41', '3', '31', '35', '1', '10', '5', '34', '42', '45', '48', '8'];

    if (group1.includes(selectedLocation)) {
        checkinTime = '10:00';
        checkoutTime = '09:00';
    } else if (group2.includes(selectedLocation)) {
        checkinTime = '12:00';
        checkoutTime = '11:00';
    } else if (group3.includes(selectedLocation)) {
        checkinTime = '14:00'; // Set a default check-in time for group3
        checkoutTime = updateCheckoutTimeBasedOnCheckin(checkinTime); // Update checkout time based on the default check-in time
    }

    // Set and disable/enable fields
    checkinTimeSelect.value = checkinTime;
    checkinTimeSelect.disabled = group1.includes(selectedLocation) || group2.includes(selectedLocation);
    checkoutTimeInput.value = checkoutTime;
}

function updateCheckoutTimeBasedOnCheckin(checkinTime) {
    var checkoutHour = (parseInt(checkinTime.split(':')[0]) + 23) % 24;
    return (checkoutHour < 10 ? '0' + checkoutHour : checkoutHour) + ':00';
}

function updateCheckoutTime() {
    checkoutTimeInput.value = updateCheckoutTimeBasedOnCheckin(checkinTimeSelect.value);
}

// Call once on load
handleLocationChange();
});
document.addEventListener("DOMContentLoaded", function () {
    var checkinTimeSelect = document.getElementById("checkin-time");
    var checkoutTimeInput = document.getElementById("checkout-time");
    var locationSelect = document.getElementById("location");
    var checkinDateInput = document.getElementById("checkin");
    var checkoutDateInput = document.getElementById("checkout");

    // Set default dates
    setDefaultDates();

    // Event listeners
    checkinDateInput.addEventListener('change', updateCheckoutDate);
    document.getElementById("portfolio-posts-btn").addEventListener("click", fetchHotelData);

   function setDefaultDates() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;
    checkinDateInput.value = today;

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var dd_tomorrow = String(tomorrow.getDate()).padStart(2, '0');
    var mm_tomorrow = String(tomorrow.getMonth() + 1).padStart(2, '0');
    var yyyy_tomorrow = tomorrow.getFullYear();

    tomorrow = yyyy_tomorrow + '-' + mm_tomorrow + '-' + dd_tomorrow;
    checkoutDateInput.value = tomorrow;
}


    function updateCheckoutDate() {
        var checkinDate = new Date(checkinDateInput.value);
        var checkoutDate = new Date(checkinDate);
        checkoutDate.setDate(checkoutDate.getDate() + 1);
        checkoutDateInput.valueAsDate = checkoutDate;
    }

   function fetchHotelData() {
    var selectedLocation = document.getElementById("location").value;
    var checkin = checkinDateInput.value;
    var checkout = checkoutDateInput.value;
    var checkinTime = checkinTimeSelect.value.replace(':', ''); // Format time for URL
    var checkoutTime = checkoutTimeInput.value.replace(':', ''); // Format time for URL

    var url = `https://staging.aptourismhotels.in/details3.php?hotelId=${selectedLocation}&checkInDate=${checkin}&checkOutDate=${checkout}&checkInTime=${checkinTime}&checkOutTime=${checkoutTime}`;

    var ourRequest = new XMLHttpRequest();
    ourRequest.open("GET", url);
    ourRequest.onload = function () {
        if (ourRequest.status >= 200 && ourRequest.status < 400) {
            var data = JSON.parse(ourRequest.responseText);
            if (Array.isArray(data)) {
                createHTML(data);
            } else {
                displayError(data.error);
            }
        } else {
            console.log("Error: " + ourRequest.status);
        }
    };
    ourRequest.onerror = function () {
        console.log("Connection error");
    };
    ourRequest.send();
}


function displayError(errorMessage) {
    var resultContainer = document.getElementById("portfolio-posts-container");
    resultContainer.innerHTML = `<div class="error-message"><strong>Status:</strong> ${errorMessage}</div>`;
}

function createHTML(data) {
    var resultContainer = document.getElementById("portfolio-posts-container");
    resultContainer.innerHTML = "";

    if (data.error) {
        var errorMessage = document.createElement("div");
        errorMessage.className = "error-message";
        errorMessage.innerHTML = `<strong>Status:</strong> ${data.error}`;
        resultContainer.appendChild(errorMessage);
    } else {
        data.forEach(function (item) {
            var maxAdults = Math.max(...item.no_of_adults);
        var maxChildren = Math.max(...item.no_of_children);

        // Update maxPerRoomText based on the fetched data
        var maxPerRoomText = `ADULT - ${maxAdults} | CHILD - ${maxChildren}`;
            var resultBox = document.createElement("div");
            resultBox.className = "result-box";
            var roomOptions = '<option value="0">0</option>';
            for (var i = 1; i <= item.available_rooms; i++) {
                roomOptions += `<option value="${i}">${i}</option>`;
            }
            var adultsOptions = item.no_of_adults.map(function (num) {
            return `<option value="${num}">${num}</option>`;
        }).join('');

        var childrenOptions = item.no_of_children.map(function (num) {
            return `<option value="${num}">${num}</option>`;
        }).join('');
        


            resultBox.innerHTML = `
               <strong>Hotel Name:</strong> ${item.hotel_name}<br>
            <strong>Room Type:</strong> ${item.room_type_name}<br>
            <strong>Max Per Room:</strong> ${maxPerRoomText}<br>
                <strong>Price Per Room:</strong> ${parseFloat(item.gross_amount)}<br>
                <strong>Tax GST:</strong> <span class="tax-gst">${parseFloat(item.tax)}</span><br>
                <strong>Required Rooms:</strong> <select class="rooms-dropdown">${roomOptions}</select><br>
                <div class="time-group">
                <div class="time-field">
                    <strong>No of Adults:</strong> <select class="adults-dropdown">${adultsOptions}</select>
                </div>
                <div class="time-field">
                    <strong>No of Children:</strong> <select class="children-dropdown">${childrenOptions}</select>
                </div>
            </div>
                <strong>Total Price:</strong> <span class="total-price">0</span><br>
                <button class="add-to-cart-btn">Add to Cart</button>
                <button class="view-cart-btn hidden" onclick="window.location.href='https://aptourismhotels.in/hotelcart';">View Cart</button>
            `;
            resultContainer.appendChild(resultBox);
                var roomsDropdown = resultBox.querySelector(".rooms-dropdown");
        var adultsDropdown = resultBox.querySelector(".adults-dropdown");
        var childrenDropdown = resultBox.querySelector(".children-dropdown");
        var totalPriceSpan = resultBox.querySelector(".total-price");
        var addToCartBtn = resultBox.querySelector(".add-to-cart-btn");
                roomsDropdown.addEventListener("change", function () {
                    updatePersonOptions(adultsDropdown, item.no_of_adults, this.value);
            updatePersonOptions(childrenDropdown, item.no_of_children, this.value);
                    var selectedRooms = parseInt(this.value);
                    var pricePerRoom = parseFloat(item.gross_amount);
                    var taxPerRoom = parseFloat(item.tax);
                    var newTotalPrice = selectedRooms * (pricePerRoom + taxPerRoom);
                    totalPriceSpan.textContent = newTotalPrice.toFixed(2);
                    addToCartBtn.disabled = selectedRooms === 0;
                });

                handleAddToCartClick(addToCartBtn, item, totalPriceSpan, roomsDropdown, checkinDateInput, checkoutDateInput, checkinTimeSelect, checkoutTimeInput, adultsDropdown, childrenDropdown);
            });
        }
        function updatePersonOptions(dropdown, originalOptions, multiplier) {
    dropdown.innerHTML = '';
    for (var i = 1; i <= Math.max(...originalOptions) * multiplier; i++) {
        var option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        dropdown.appendChild(option);
    }
}
    }

  function handleAddToCartClick(button, item, totalPriceSpan, roomsDropdown, checkinDateInput, checkoutDateInput, checkinTimeSelect, checkoutTimeInput, adultsDropdown, childrenDropdown) {
    button.addEventListener("click", function (e) {
        e.preventDefault();
        var totalPrice = parseFloat(totalPriceSpan.textContent);
        if (totalPrice === 0) {
            alert('Please select the number of rooms before adding to cart.');
            return;
        }

        var hotelName = item.hotel_name;
        var roomType = item.room_type_name;
        var pricePerRoom = item.gross_amount;
        var taxGst = item.tax;
        var numberOfRooms = roomsDropdown.value;
        var numberOfAdults = adultsDropdown.value; // Get the number of adults
        var numberOfChildren = childrenDropdown.value; // Get the number of children

        var checkinDate = checkinDateInput.value;
        var checkoutDate = checkoutDateInput.value;
        var checkinTime = checkinTimeSelect.value;
        var checkoutTime = checkoutTimeInput.value;

        showSpinner('Adding to Cart');

        var xhr = new XMLHttpRequest();
        xhr.open('GET', `https://aptourismhotels.in/cart/?add-to-cart=2829&hotel_fare=${totalPrice}&hotel_name=${encodeURIComponent(hotelName)}&room_type=${encodeURIComponent(roomType)}&price_per_room=${pricePerRoom}&tax_gst=${taxGst}&number_of_rooms=${numberOfRooms}&number_of_adults=${numberOfAdults}&number_of_children=${numberOfChildren}&checkin_date=${checkinDate}&checkout_date=${checkoutDate}&checkin_time=${checkinTime}&checkout_time=${checkoutTime}`, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                hideSpinner();

                if (xhr.status == 200) {
                    alert('Hotel Room Added to Cart Successfully!');
                    button.nextElementSibling.classList.remove('hidden');
                } else {
                    alert('Error adding to cart. Please try again.');
                }
            }
        };
        xhr.onerror = function () {
            hideSpinner();
            alert('Network error. Please check your connection.');
        };
        xhr.send();
    });
}

document.getElementById("portfolio-posts-btn").addEventListener("click", function() {
    showSpinner('Checking Availability');
    // Fetch hotel data or perform other actions here
    // ...
    setTimeout(hideSpinner, 3000); // Hide after 3 seconds
});

    function showSpinner(message) {
    var loadingTextElement = document.querySelector('.loading-text');
    loadingTextElement.innerHTML = message; // Set custom message
    document.querySelector('.spinner-overlay').style.visibility = 'visible';
    loadingTextElement.style.display = 'block'; // Show the text
}

function hideSpinner() {
    document.querySelector('.spinner-overlay').style.visibility = 'hidden';
    document.querySelector('.loading-text').style.display = 'none'; // Hide the text
}


document.getElementById("portfolio-posts-btn").addEventListener("click", function() {
    showSpinner('Checking Availability');
    fetchHotelData();
    // The setTimeout call for hideSpinner should be inside fetchHotelData or its callback
});

});