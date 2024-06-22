const BIN_ID = '66768e2ead19ca34f87cdcdb';

document.addEventListener("DOMContentLoaded", function () {
    fetchRosterData();
    setupEventListeners();
});

function fetchRosterData() {
    axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`)
        .then(response => {
            const data = response.data.record;
            populateTeam(data.homeTeam, 'home');
            populateTeam(data.awayTeam, 'away');
        })
        .catch(error => console.error('Error:', error));
}

function populateTeam(teamData, teamType) {
    const logoImg = document.getElementById(`${teamType}TeamLogoImg`);
    const teamName = document.getElementById(`${teamType}TeamName`);
    const playerList = document.querySelector(`.${teamType}-player-list`);
    const substituteList = document.querySelector(`.${teamType}-substitute-list`);

    logoImg.src = teamData.logo;
    teamName.textContent = teamData.name;

    //playerList.innerHTML = '<h3>Players</h3>';
    substituteList.innerHTML = '<h3 style="color: white;">Substitutes</h3>';

    teamData.players.forEach((player) => {
        const li = document.createElement('li');
        li.textContent = `${player.number}. ${player.name}`;
        if (player.substitute) {
            substituteList.appendChild(li);
        } else {
            playerList.appendChild(li);
        }
    });

    if (teamType === 'home') {
        populatePlayerSelect(teamData.players);
    }
}

function populatePlayerSelect(players) {
    const playerSelect = document.getElementById('home-player-select');
    playerSelect.innerHTML = '<option value="" disabled selected>Select a player</option>';
    players.forEach(player => {
        if (player.name) {
            const option = document.createElement('option');
            option.value = player.number;
            option.textContent = `${player.number}. ${player.name}${player.substitute ? ' (Substitute)' : ''}`;
            playerSelect.appendChild(option);
        }
    });
}

function setupEventListeners() {
    document.getElementById('refresh-button').addEventListener('click', fetchRosterData);
    document.getElementById('home-player-select').addEventListener('change', function(e) {
        if (e.target.value) {
            alert(`Selected player: ${e.target.options[e.target.selectedIndex].text}`);
        }
    });
}
