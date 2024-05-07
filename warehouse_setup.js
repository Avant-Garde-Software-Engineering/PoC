import { setupWhs } from './main.js'

/***********************************************/
/************** SETUP MAGAZZINO ****************/
/***********************************************/

const setupWhsWin = document.getElementById('setupWhs');
const WhsSizeForm = document.getElementById('WhsSetupForm');

/* Aprire finestra per setup del magazzino quando 
la pagina viene caricata inizialmente*/
function openSetupWhs () {
    setupWhsWin.style.display = 'flex';
}
window.addEventListener('load', openSetupWhs);

/* Chiudere la finestra del setup del magazzino e 
effettivo set up di wms quando faccio il submit del form*/
function closeSetUpWhsWin () {
    setupWhsWin.style.display = 'none';
    WhsSizeForm.reset();
}

WhsSizeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
	const WhsWidth = parseFloat(document.getElementById('WhsWidth').value);
    const WhsDepth = parseFloat(document.getElementById('WhsDepth').value);
    const WhsHeight = parseFloat(document.getElementById('WhsHeight').value);

    if (isNaN(WhsWidth) || isNaN(WhsDepth) || isNaN(WhsHeight)) {
        alert("Assicurarsi di aver inserito tutte le misure");
    } 
    else {
        closeSetUpWhsWin();      
        setupWhs(WhsWidth, WhsHeight, WhsDepth);
    }
});
