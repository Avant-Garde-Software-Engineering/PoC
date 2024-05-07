import { ShelfGeometryBuilder } from './ShelfGeometryBuilder.js';
import { addObjToLib } from './main.js';


/***********************************************/
/************* SETUP SCAFFALATURA **************/
/***********************************************/

const setupShelfWin = document.getElementById('addShelf');
const shelfSizeForm = document.getElementById('shelfSetupForm');

/* Aprire finestra per aggiunta scaffalatura quando 
bottone viene cliccato*/
addShelfBtn.addEventListener('click', () => {
    setupShelfWin.style.display = 'flex';
});

/* Chiudere le finestra del setup della scaffalatura
se clicco bottone annulla */
const closeBtn = document.getElementById('closeShelfSetup');

closeBtn.addEventListener('click', () => {
	closeSetUpShelfWin();
});


/* Chiudere la finestra del setup della scaffalatura e 
aggiunta di questa al mag. quando faccio il submit del form*/
function closeSetUpShelfWin () {
    setupShelfWin.style.display = 'none';
    shelfSizeForm.reset();
}

shelfSizeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    //let shelfDepth = document.getElementById('shelfDepth').value;
    let shelfWidth = parseInt(document.getElementById('shelfWidth').value);     //int perchè misura in bin non mt
    let shelfHeight = parseInt(document.getElementById('shelfHeight').value);
    let shelfId = document.getElementById('shelfId').value;
    let binSize= document.getElementById('binSize').value;
    //let nShelfUnit = document.getElementById('nShelfUnit').value;

    if (shelfId == "" || isNaN(shelfWidth) || isNaN(shelfHeight) || isNaN(binSize)) {
        alert("Assicurarsi di aver compilato tutti i campi");
    } 
    else {
        alert("La scaffalatura può essere posizionata con doppio click");
        let newShelf = new ShelfGeometryBuilder(shelfWidth, shelfHeight, binSize);
        addObjToLib(newShelf, shelfId);
        closeSetUpShelfWin();
    }
});