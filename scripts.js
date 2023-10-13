document.addEventListener("DOMContentLoaded", function () {
    setupLogoInput();
    setupPlayerSelect();
    setupLogoDoubleClick();
});

function setupLogoDoubleClick() {
    const homeLogo = document.querySelector('.home-team .team-logo');
    const controls = document.querySelector('.controls');

    homeLogo.addEventListener('dblclick', function() {
        // Toggle visibility of the entire controls container on double click of the home logo
        controls.style.display = 'block';
    });

    // Refresh button reloads the page
    document.querySelector('#refresh-button').addEventListener('click', function() {
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
