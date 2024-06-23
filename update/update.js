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
        addPlayerToList(team, player.name, player.number, player.substitute, index);
    });
}

function addPlayerToList(team, playerName, playerNumber, isSubstitute, index) {
    const listElement = document.getElementById(`${team}PlayerList`);
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';
    playerItem.innerHTML = `
        <input type="text" value="${playerName}" data-index="${index}" class="player-name" placeholder="Player name">
        <input type="text" value="${playerNumber}" data-index="${index}" class="player-number" placeholder="Number">
        <label>
            <input type="checkbox" ${isSubstitute ? 'checked' : ''} data-index="${index}" class="player-substitute">
            Substitute
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
    playerItem.querySelector('.delete-player').addEventListener('click', () => deletePlayer(team, index));
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
        }
    }
}

function deletePlayer(team, index) {
    const listElement = document.getElementById(`${team}PlayerList`);
    const playerItems = listElement.getElementsByClassName('player-item');
    if (index < playerItems.length) {
        listElement.removeChild(playerItems[index]);
        // Re-index remaining players
        Array.from(playerItems).forEach((item, newIndex) => {
            if (newIndex >= index) {
                item.querySelector('.player-name').dataset.index = newIndex;
                item.querySelector('.player-number').dataset.index = newIndex;
                item.querySelector('.player-substitute').dataset.index = newIndex;
                item.querySelector('.delete-player').dataset.index = newIndex;
            }
        });
    }
}

function setupEventListeners() {
    document.getElementById('homeAddPlayer').addEventListener('click', () => addPlayer('home'));
    document.getElementById('awayAddPlayer').addEventListener('click', () => addPlayer('away'));
    document.getElementById('saveButton').addEventListener('click', saveRoster);
    document.getElementById('resetAwayTeam').addEventListener('click', resetAwayTeam);
    document.getElementById('resetHomePlayers').addEventListener('click', resetHomePlayers);
    document.getElementById('homePlayerNameSelect').addEventListener('change', updateHomePlayerNameInput);
    document.getElementById('awayTeamSelect').addEventListener('change', updateAwayTeamFields);
    document.getElementById('homeTeamLogo').addEventListener('input', () => updateLogoDisplay('home'));
    document.getElementById('awayTeamLogo').addEventListener('input', () => updateLogoDisplay('away'));
}


function addPlayer(team) {
    const nameInput = document.getElementById(`${team}PlayerNameInput`);
    const numberInput = document.getElementById(`${team}PlayerNumberInput`);
    const substituteInput = document.getElementById(`${team}PlayerSubstituteInput`);
    const playerName = nameInput.value.trim();
    const playerNumber = numberInput.value.trim();
    const isSubstitute = substituteInput.checked;

    numberInput.classList.remove('error');

    if (playerName && isValidNumber(playerNumber)) {
        const listElement = document.getElementById(`${team}PlayerList`);
        const index = listElement.children.length;
        addPlayerToList(team, playerName, playerNumber, isSubstitute, index);
        nameInput.value = '';
        numberInput.value = '';
        substituteInput.checked = false;
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

function saveRoster() {
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

function isValidNumber(value) {
    return value !== '' && !isNaN(value) && parseInt(value) > 0;
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

function getPlayerData(team) {
    const listElement = document.getElementById(`${team}PlayerList`);
    const playerItems = listElement.getElementsByClassName('player-item');
    return Array.from(playerItems).map(item => ({
        name: item.querySelector('.player-name').value,
        number: item.querySelector('.player-number').value,
        substitute: item.querySelector('.player-substitute').checked
    }));
}
