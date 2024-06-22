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

    populatePlayerList('home', data.homeTeam.players);
    populatePlayerList('away', data.awayTeam.players);
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
        <input type="number" value="${playerNumber}" data-index="${index}" class="player-number" placeholder="Number">
        <label>
            <input type="checkbox" ${isSubstitute ? 'checked' : ''} data-index="${index}" class="player-substitute">
            Substitute
        </label>
        <button class="delete-player" data-index="${index}">Delete</button>
    `;
    listElement.appendChild(playerItem);

    // Add event listeners for editing and deleting
    playerItem.querySelector('.player-name').addEventListener('change', (e) => updatePlayer(team, index, 'name', e.target.value));
    playerItem.querySelector('.player-number').addEventListener('change', (e) => updatePlayer(team, index, 'number', e.target.value));
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
}

function addPlayer(team) {
    const nameInput = document.getElementById(`${team}PlayerNameInput`);
    const numberInput = document.getElementById(`${team}PlayerNumberInput`);
    const substituteInput = document.getElementById(`${team}PlayerSubstituteInput`);
    const playerName = nameInput.value.trim();
    const playerNumber = numberInput.value.trim();
    const isSubstitute = substituteInput.checked;
    if (playerName && playerNumber) {
        const listElement = document.getElementById(`${team}PlayerList`);
        const index = listElement.children.length;
        addPlayerToList(team, playerName, playerNumber, isSubstitute, index);
        nameInput.value = '';
        numberInput.value = '';
        substituteInput.checked = false;
    }
}

function saveRoster() {
    const rosterData = {
        homeTeam: {
            name: document.getElementById('homeTeamName').value,
            logo: document.getElementById('homeTeamLogo').value,
            players: getPlayerData('home')
        },
        awayTeam: {
            name: document.getElementById('awayTeamName').value,
            logo: document.getElementById('awayTeamLogo').value,
            players: getPlayerData('away')
        }
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

function getPlayerData(team) {
    const listElement = document.getElementById(`${team}PlayerList`);
    const playerItems = listElement.getElementsByClassName('player-item');
    return Array.from(playerItems).map(item => ({
        name: item.querySelector('.player-name').value,
        number: item.querySelector('.player-number').value,
        substitute: item.querySelector('.player-substitute').checked
    }));
}
