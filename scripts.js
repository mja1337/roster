
document.addEventListener("DOMContentLoaded", function () {
  loadFromLocalStorage();
  renderPlayers();
});

function loadFromLocalStorage() {

  populateTeamList('.home-player-list', storedHomeTeam);
  populateTeamList('.away-player-list', storedAwayTeam);
}

function populateTeamList(selector, playerData) {
  const teamList = document.querySelector(selector);
  teamList.innerHTML = "";

  playerData.forEach(player => {
      const listItem = document.createElement("li");
      listItem.textContent = `${player.number}. ${player.name}`;
      listItem.contentEditable = "true";
      teamList.appendChild(listItem);
  });
}

function renderPlayers() {

  homeTeamNames.forEach((name, index) => {
      const dropdown = document.createElement('select');
      const defaultOption = document.createElement('option');
      defaultOption.textContent = `${index + 1}. Select Player`;
      defaultOption.value = '';
      dropdown.appendChild(defaultOption);

      homeTeamNames.forEach(playerName => {
          const option = document.createElement('option');
          option.textContent = playerName;
          option.value = playerName;
          dropdown.appendChild(option);
      });

      const listItem = document.createElement('li');
      listItem.textContent = `${index + 1}. `;
      listItem.appendChild(dropdown);
      document.querySelector('.home-player-list').appendChild(listItem);
  });

  for (let i = 0; i < 17; i++) {
      const listItem = document.createElement('li');
      listItem.textContent = `${i + 1}. `;
      listItem.contentEditable = "true";
      document.querySelector('.away-player-list').appendChild(listItem);
  }
}


  const homePlayers = Array.from(document.querySelectorAll('.home-player-list li')).map(li => {
      const parts = li.textContent.split('. ');
      return {
          number: parts[0],
          name: parts[1]
      };
  });

  const awayPlayers = Array.from(document.querySelectorAll('.away-player-list li')).map(li => {
      const parts = li.textContent.split('. ');
      return {
          number: parts[0],
          name: parts[1]
      };
  });

document.addEventListener("DOMContentLoaded", function () {
  setupLogoInput();
});

function setupLogoInput() {
  const logoInput = document.querySelector('#awayTeamLogoUrl');
  const logoImg = document.querySelector('#awayTeamLogoImg');

  logoInput.addEventListener('change', function() {
      if (logoInput.value) {
          logoImg.src = logoInput.value;
          logoImg.onload = function() {
              logoInput.style.display = 'none';
          };
      } else {
          logoInput.style.display = 'block';
          logoImg.src = '';
      }
  });
}

//document.addEventListener("DOMContentLoaded", function () {
//  const zoomOutButton = document.getElementById('zoom-out-button');
//  let scale = 1;
//  zoomOutButton.addEventListener('click', function() {
//    scale -= 0.1; // decrement scale by 10% on each click
//    document.body.style.transform = `scale(${scale})`;
//  });
//});
