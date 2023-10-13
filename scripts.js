document.addEventListener("DOMContentLoaded", function () {
    setupLogoInput();
    setupPlayerSelect();
    setupLogoDoubleClick();
    renderPlayers();
});

function setupLogoDoubleClick() {
    const homeLogo = document.querySelector('.home-team .team-logo');
    const playerSelect = document.querySelector('#home-player-select');
    const refreshButton = document.querySelector('#refresh-button');

    playerSelect.style.display = 'none';
    refreshButton.style.display = 'none';

    homeLogo.addEventListener('dblclick', function() {
        playerSelect.style.display = (playerSelect.style.display === 'none') ? 'block' : 'none';
        refreshButton.style.display = (refreshButton.style.display === 'none') ? 'block' : 'none';
    });

    refreshButton.addEventListener('click', function() {
        location.reload();
    });
}

function setupPlayerSelect() {
    const playerSelect = document.querySelector('#home-player-select');
    const playerList = document.querySelector('.home-player-list');

    playerSelect.addEventListener('change', function() {
        for (let li of playerList.querySelectorAll('li')) {
            const textContent = li.textContent.trim();
            if (textContent.match(/^\d+\.\s*$/)) {
                li.textContent = textContent + ' ' + playerSelect.value;
                break;
            }
        }
        playerSelect.value = "";
        //playerSelect.style.display = 'none';
    });
}

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
function renderPlayers() {
    // Render home team player list items (assuming select dropdown is used for player selection)
    for (let i = 0; i < 17; i++) {
        const listItem = document.createElement('li');
        listItem.textContent = `${i + 1}. `;
        listItem.contentEditable = "true";
        document.querySelector('.home-player-list').appendChild(listItem);
    }

    // Render away team player list items
    for (let i = 0; i < 17; i++) {
        const listItem = document.createElement('li');
        listItem.textContent = `${i + 1}. `;
        listItem.contentEditable = "true";
        document.querySelector('.away-player-list').appendChild(listItem);
    }
}
