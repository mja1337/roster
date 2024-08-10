const BIN_ID = '66768e2ead19ca34f87cdcdb';
const API_KEY = '$2a$10$wLpRGAXvgxVE6tw.LmdZr.PF9Me4.bLxjNrMU9nuDRSICiDjGpQ/e';

document.addEventListener('DOMContentLoaded', function() {
    fetchCurrentRoster();
    setupEventListeners();
});

function fetchCurrentRoster() {
    axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: {
            'X-Access-Key': API_KEY
        }
    })
    .then(response => {
        const data = response.data.record;
        populateFields(data);
    })
    .catch(error => console.error('Error fetching data:', error));
}

function populateFields(data) {
    document.getElementById('homeTeamName').value = data.homeTeam.name;
    document.getElementById('homeTeamLogo').value = data.homeTeam.logo;
    document.getElementById('awayTeamName').value = data.awayTeam.name;
    document.getElementById('awayTeamLogo').value = data.awayTeam.logo;

    updateLogoDisplay('home');
    updateLogoDisplay('away');

    populatePlayerList('home', data.homeTeam.players);
    populatePlayerList('away', data.awayTeam.players);
    populateHomePlayerDropdown(data.homeTeam.playerPool);
    populateAwayTeamDropdown(data.awayTeamPool);
}

function populateHomePlayerDropdown(playerPool) {
    const select = document.getElementById('homePlayerNameSelect');
    select.innerHTML = '<option value="">-- Select player --</option>';
    playerPool.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        select.appendChild(option);
    });
}

function populateAwayTeamDropdown(awayTeamPool) {
    const select = document.getElementById('awayTeamSelect');
    select.innerHTML = '<option value="">-- Select away team --</option>';
    awayTeamPool.forEach(team => {
        const option = document.createElement('option');
        option.value = JSON.stringify(team);
        option.textContent = team.name;
        select.appendChild(option);
    });
}

function populatePlayerList(team, players) {
    const listElement = document.getElementById(`${team}PlayerList`);
    listElement.innerHTML = '';

    players.forEach((player, index) => {
        addPlayerToList(team, player.name, player.number, player.substitute, player.captain, index);
    });

    updatePlayerListOrder(listElement.id);  // Ensure correct ordering and event listeners
}

function addPlayerToList(team, playerName, playerNumber, isSubstitute, isCaptain, index) {
    const listElement = document.getElementById(`${team}PlayerList`);
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';
    playerItem.setAttribute('draggable', true);  // Make the item draggable
    playerItem.setAttribute('data-index', index);  // Store the index for sorting

    playerItem.innerHTML = `
        <input type="text" value="${playerName}" data-index="${index}" class="player-name" placeholder="Player name">
        <input type="text" value="${playerNumber}" data-index="${index}" class="player-number" placeholder="Number">
        <label>
            <input type="checkbox" ${isSubstitute ? 'checked' : ''} data-index="${index}" class="player-substitute">
            Substitute
        </label>
        <label>
            <input type="checkbox" class="player-captain" ${isCaptain ? 'checked' : ''} data-index="${index}">
            Captain
        </label>
        <button class="delete-player" data-index="${index}">Delete</button>
    `;
    listElement.appendChild(playerItem);

    // Add event listeners for editing and deleting
    playerItem.querySelector('.player-name').addEventListener('change', (e) => updatePlayer(team, index, 'name', e.target.value));
    playerItem.querySelector('.player-number').addEventListener('change', (e) => {
        if (isValidNumber(e.target.value)) {
            updatePlayer(team, index, 'number', e.target.value);
            e.target.classList.remove('error');
        } else {
            e.target.classList.add('error');
        }
    });
    playerItem.querySelector('.player-substitute').addEventListener('change', (e) => updatePlayer(team, index, 'substitute', e.target.checked));
    playerItem.querySelector('.player-captain').addEventListener('change', (e) => handleCaptainSelection(e, team, index));

    // Handle deletion without relying on data-index
    playerItem.querySelector('.delete-player').addEventListener('click', () => {
        listElement.removeChild(playerItem);
        updatePlayerListOrder(listElement.id);
    });
    
    // Add drag-and-drop event listeners
    playerItem.addEventListener('dragstart', handleDragStart);
    playerItem.addEventListener('dragover', handleDragOver);
    playerItem.addEventListener('drop', handleDrop);
    playerItem.addEventListener('dragend', handleDragEnd);
}

function handleCaptainSelection(e, team, index) {
    const listElement = document.getElementById(`${team}PlayerList`);
    if (e.target.checked) {
        // Uncheck any other captain checkboxes before adding a new captain
        const otherCaptains = listElement.querySelectorAll('.player-captain');
        otherCaptains.forEach((checkbox) => {
            if (checkbox !== e.target) {
                checkbox.checked = false;
            }
        });
    }
    updatePlayer(team, index, 'captain', e.target.checked);
}

function updatePlayer(team, index, field, value) {
    const listElement = document.getElementById(`${team}PlayerList`);
    const playerItems = listElement.getElementsByClassName('player-item');
    if (index < playerItems.length) {
        const playerItem = playerItems[index];
        if (field === 'name') {
            playerItem.querySelector('.player-name').value = value;
        } else if (field === 'number') {
            playerItem.querySelector('.player-number').value = value;
        } else if (field === 'substitute') {
            playerItem.querySelector('.player-substitute').checked = value;
        } else if (field === 'captain') {
            playerItem.querySelector('.player-captain').checked = value;
        }
    }
}

function setupEventListeners() {
    document.getElementById('homeAddPlayer').addEventListener('click', () => addPlayer('home'));
    document.getElementById('awayAddPlayer').addEventListener('click', () => addPlayer('away'));
    document.getElementById('saveButton').removeEventListener('click', saveHandler); // Ensure no duplicate listener
    document.getElementById('saveButton').addEventListener('click', saveHandler); // Attach the listener
    document.getElementById('resetAwayTeam').addEventListener('click', resetAwayTeam);
    document.getElementById('resetHomePlayers').addEventListener('click', resetHomePlayers);
    document.getElementById('homePlayerNameSelect').addEventListener('change', updateHomePlayerNameInput);
    document.getElementById('awayTeamSelect').addEventListener('change', updateAwayTeamFields);
    document.getElementById('homeTeamLogo').addEventListener('input', () => updateLogoDisplay('home'));
    document.getElementById('awayTeamLogo').addEventListener('input', () => updateLogoDisplay('away'));

    // Event delegation for drag and drop
    document.getElementById('homePlayerList').addEventListener('dragstart', handleDragStart);
    document.getElementById('homePlayerList').addEventListener('dragover', handleDragOver);
    document.getElementById('homePlayerList').addEventListener('drop', handleDrop);
    document.getElementById('homePlayerList').addEventListener('dragend', handleDragEnd);

    document.getElementById('awayPlayerList').addEventListener('dragstart', handleDragStart);
    document.getElementById('awayPlayerList').addEventListener('dragover', handleDragOver);
    document.getElementById('awayPlayerList').addEventListener('drop', handleDrop);
    document.getElementById('awayPlayerList').addEventListener('dragend', handleDragEnd);
}

function addPlayer(team) {
    const nameInput = document.getElementById(`${team}PlayerNameInput`);
    const numberInput = document.getElementById(`${team}PlayerNumberInput`);
    const substituteInput = document.getElementById(`${team}PlayerSubstituteInput`);
    const captainInput = document.getElementById(`${team}PlayerCaptainInput`);
    const playerName = nameInput.value.trim();
    const playerNumber = numberInput.value.trim();
    const isSubstitute = substituteInput.checked;
    const isCaptain = captainInput ? captainInput.checked : false;

    numberInput.classList.remove('error');

    if (playerName && isValidNumber(playerNumber)) {
        const listElement = document.getElementById(`${team}PlayerList`);
        const index = listElement.children.length;
        addPlayerToList(team, playerName, playerNumber, isSubstitute, isCaptain, index);

        // After adding the player, reset inputs
        nameInput.value = '';
        numberInput.value = '';
        substituteInput.checked = false;
        if (captainInput) {
            captainInput.checked = false; // Reset the captain input checkbox after adding the player
        }

        updatePlayerListOrder(listElement.id);  // Ensure correct ordering and event listeners
    } else {
        if (!isValidNumber(playerNumber)) {
            numberInput.classList.add('error');
        }
    }
}

function resetHomePlayers() {
    document.getElementById('homePlayerList').innerHTML = '';
}

function updateHomePlayerNameInput() {
    const select = document.getElementById('homePlayerNameSelect');
    const input = document.getElementById('homePlayerNameInput');
    input.value = select.value;
}

function updateLogoDisplay(team) {
    const logoUrl = document.getElementById(`${team}TeamLogo`).value;
    const logoImg = document.getElementById(`${team}TeamLogoImage`);
    logoImg.src = logoUrl || 'placeholder.png'; // Use a placeholder image if URL is empty
    logoImg.style.display = logoUrl ? 'block' : 'none';
}

function updateAwayTeamFields() {
    const select = document.getElementById('awayTeamSelect');
    const nameInput = document.getElementById('awayTeamName');
    const logoInput = document.getElementById('awayTeamLogo');

    if (select.value) {
        const selectedTeam = JSON.parse(select.value);
        nameInput.value = selectedTeam.name;
        logoInput.value = selectedTeam.logo;
        updateLogoDisplay('away');
    } else {
        nameInput.value = '';
        logoInput.value = '';
        updateLogoDisplay('away');
    }
}

function resetAwayTeam() {
    document.getElementById('awayTeamName').value = '';
    document.getElementById('awayTeamLogo').value = '';
    document.getElementById('awayPlayerList').innerHTML = '';
    document.getElementById('awayTeamSelect').value = '';
    updateLogoDisplay('away');
}

function saveRoster(event) {
    event.preventDefault(); // Prevent default form submission

    if (!validatePlayerNumbers()) {
        alert('Please enter a valid number for all players.');
        return;
    }

    const rosterData = {
        homeTeam: {
            name: document.getElementById('homeTeamName').value,
            logo: document.getElementById('homeTeamLogo').value,
            players: getPlayerData('home'),
            playerPool: Array.from(document.getElementById('homePlayerNameSelect').options)
                .map(option => option.value)
                .filter(value => value !== '')
        },
        awayTeam: {
            name: document.getElementById('awayTeamName').value,
            logo: document.getElementById('awayTeamLogo').value,
            players: getPlayerData('away')
        },
        awayTeamPool: Array.from(document.getElementById('awayTeamSelect').options)
            .filter(option => option.value !== '')
            .map(option => JSON.parse(option.value))
    };

    axios.put(`https://api.jsonbin.io/v3/b/${BIN_ID}`, rosterData, {
        headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': API_KEY
        }
    })
    .then(response => {
        alert('Roster saved successfully!');
    })
    .catch(error => {
        console.error('Error saving data:', error);
        alert('Error saving roster. Please try again.');
    });
}

function validatePlayerNumbers() {
    let isValid = true;
    ['home', 'away'].forEach(team => {
        const playerItems = document.getElementById(`${team}PlayerList`).getElementsByClassName('player-item');
        Array.from(playerItems).forEach(item => {
            const numberInput = item.querySelector('.player-number');
            if (!isValidNumber(numberInput.value)) {
                numberInput.classList.add('error');
                isValid = false;
            } else {
                numberInput.classList.remove('error');
            }
        });
    });
    return isValid;
}

function validateUniquePlayerNumbers(team) {
    const numbers = new Set();
    let valid = true;
    const playerItems = document.getElementById(`${team}PlayerList`).getElementsByClassName('player-item');

    Array.from(playerItems).forEach(item => {
        const numberInput = item.querySelector('.player-number');
        if (numbers.has(numberInput.value)) {
            numberInput.classList.add('error');
            valid = false;
        } else {
            numbers.add(numberInput.value);
            numberInput.classList.remove('error');
        }
    });

    if (!valid) {
        alert(`There are duplicate player numbers in the ${team.charAt(0).toUpperCase() + team.slice(1)} team. Please ensure all player numbers are unique.`);
    }

    return valid;
}

function isValidNumber(value) {
    return value !== '' && !isNaN(value) && parseInt(value) > 0;
}

function getPlayerData(team) {
    const listElement = document.getElementById(`${team}PlayerList`);
    const playerItems = listElement.getElementsByClassName('player-item');
    return Array.from(playerItems).map(item => ({
        name: item.querySelector('.player-name').value,
        number: item.querySelector('.player-number').value,
        substitute: item.querySelector('.player-substitute').checked,
        captain: item.querySelector('.player-captain').checked
    }));
}

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = e.target.closest('.player-item');  // Reference to the dragged item
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedItem.innerHTML);
    draggedItem.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();  // Necessary to allow drop
    const targetItem = e.target.closest('.player-item');
    if (targetItem && targetItem !== draggedItem) {
        targetItem.classList.add('drag-over');
    }
    return false;
}

function handleDrop(e) {
    e.stopPropagation();  // Stops some browsers from redirecting
    const targetItem = e.target.closest('.player-item');

    if (draggedItem !== targetItem) {
        // Move the dragged item to the new position
        const listElement = draggedItem.parentNode;
        listElement.insertBefore(draggedItem, targetItem);

        // Update the data-index attributes after reordering
        updatePlayerListOrder(listElement.id);
    }

    targetItem.classList.remove('drag-over');
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function updatePlayerListOrder(teamListId) {
    const listElement = document.getElementById(teamListId);
    const playerItems = listElement.querySelectorAll('.player-item');

    playerItems.forEach((item, index) => {
        item.setAttribute('data-index', index);
        // Ensure all input elements have the correct data-index attributes
        item.querySelectorAll('input, button').forEach(input => {
            input.setAttribute('data-index', index);
        });
    });

    // Reattach event listeners to delete buttons
    listElement.querySelectorAll('.delete-player').forEach((button) => {
        button.addEventListener('click', (e) => {
            const itemToDelete = e.target.closest('.player-item');
            listElement.removeChild(itemToDelete);
            updatePlayerListOrder(teamListId); // Ensure order is updated after deletion
        });
    });

    // Reattach event listeners for substitutes and captains
    listElement.querySelectorAll('.player-substitute').forEach((checkbox) => {
        checkbox.addEventListener('change', (e) => {
            const index = parseInt(checkbox.getAttribute('data-index'));
            updatePlayer(teamListId.replace('PlayerList', ''), index, 'substitute', e.target.checked);
        });
    });

    listElement.querySelectorAll('.player-captain').forEach((checkbox) => {
        checkbox.addEventListener('change', (e) => {
            const index = parseInt(checkbox.getAttribute('data-index'));
            handleCaptainSelection(e, teamListId.replace('PlayerList', ''), index);
        });
    });
}

function handleTouchStart(e) {
    draggedItem = e.target.closest('.player-item');
    draggedItem.classList.add('dragging');
}

function handleTouchMove(e) {
    const touchLocation = e.targetTouches[0];
    draggedItem.style.position = "absolute";
    draggedItem.style.left = touchLocation.pageX + 'px';
    draggedItem.style.top = touchLocation.pageY + 'px';
}

function handleTouchEnd(e) {
    this.classList.remove('dragging');
    const dropTarget = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    
    if (dropTarget && dropTarget.closest('.player-item') && dropTarget.closest('.player-item') !== draggedItem) {
        const tempHTML = dropTarget.closest('.player-item').innerHTML;
        dropTarget.closest('.player-item').innerHTML = draggedItem.innerHTML;
        draggedItem.innerHTML = tempHTML;
        updatePlayerListOrder(draggedItem.parentNode.id);
    }

    draggedItem.style.position = "";
    draggedItem.style.left = "";
    draggedItem.style.top = "";
}

function saveHandler(event) {
    event.preventDefault();  // Prevent the default form submission

    let valid = true;

    // Check for exactly one captain in the home team
    const homeCaptains = document.querySelectorAll('#homePlayerList .player-captain:checked');
    if (homeCaptains.length !== 1) {
        alert('Please select exactly one captain for the Home team.');
        valid = false;
    }

    // Check for exactly one captain in the away team
    const awayCaptains = document.querySelectorAll('#awayPlayerList .player-captain:checked');
    if (awayCaptains.length !== 1) {
        alert('Please select exactly one captain for the Away team.');
        valid = false;
    }

    // Validate unique player numbers for both teams
    if (!validateUniquePlayerNumbers('home') || !validateUniquePlayerNumbers('away')) {
        valid = false;
    }

    // Prevent saving if validation fails
    if (!valid) {
        console.log("Validation failed, not saving the roster.");
        return;  // Exit the function to prevent saving
    }

    // If validation is successful, proceed with saving the roster
    saveRoster(event);
}
