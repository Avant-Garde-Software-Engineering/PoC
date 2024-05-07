import { warehouse } from "./main.js";
import { ShelfGeometryBuilder } from "./ShelfGeometryBuilder.js";

/**********************************************/
/********** MOVIMENTAZIONE PRODOTTO ***********/
/**********************************************/

const moveReqWin = document.getElementById('requestMove');
const moveReqForm = document.getElementById('moveRequestForm');
const prodInput = document.getElementById('product');
const shelfInput = document.getElementById('shelf');
const xInput = document.getElementById('posx');
const yInput = document.getElementById('posy');

/* Aprire finestra per richiesta spostamento quando 
bottone viene cliccato*/
newMoveRequest.addEventListener('click', () => {
	moveReqWin.style.display = 'flex';
});

/* Chiudere le finestra per richiesta movimento quando
clicco su bottone annulla */
const closeBtn = document.getElementById('closeMoveReq');

closeBtn.addEventListener('click', () => {
	closeMoveReqWin();
});

/* Chiudere la finestra per richiesta movimento e
aggiunta di questa al menù a tendina, quando faccio il submit del form*/
function closeMoveReqWin () {
    moveReqWin.style.display = 'none';
    moveReqForm.reset();
}

moveReqForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let enteredProd = prodInput.value;
    let destination = shelfInput.value;         /*valore X, temporaneo! da rivedere implementazione*/
    
    let posx = xInput.value;
    let posy = yInput.value;

    console.log("x:",posx,"y:",posy);
    
    if (destination == "") {        /* da fare check anche che non sia placeholder?*/
        alert("Assicurarsi di aver compilato entrambi i campi");
    } 
    else if (!checkValidProduct(enteredProd)) {
        alert("Assicurarsi di aver selezionato un prodotto valido");
    }
    else {
        try {
        move(enteredProd, destination, posx, posy);
        closeMoveReqWin();     
        } catch (e) {
            alert(e);
        }
    }
});

function checkValidProduct(enteredProd) {       //controlla che il prodotto da spostare esista
    var options = prodInput.list.options;

    for (var i = 0; i< options.length; i++) {
        if (enteredProd == options[i].value)
            return true;
    }
    return false;

    /*da implementare check che prodotto non sia già in movimentazione */
}

function move(prodToMove, destination, x, y) {       //effettua richiesta effettiva di movimentazione
    /* aggiungo prodotto a menù con prodotti in attesa*/
    const dropdownRequests = document.querySelector('#requestDropdown .dropdown-content');
    //const randomColumnIndex = Math.floor(Math.random() * 2);
    //Togliere commento della parte sopra per aggiungere randomicità al movimento
    const randomColumnIndex = 1;
    if(randomColumnIndex) {
        let convertedX = parseInt(x);
        let convertedY = parseInt(y);

        console.log("x:", x, "y:", y);
        
        const scaffali = warehouse.getShelves();
        const prodotti = warehouse.getProducts();
        const currentScaffale = scaffali[destination];
        const currentProdotto = prodotti[prodToMove];
        currentScaffale.geometryBuilder.insertObjectInBin(currentProdotto, currentScaffale.mesh, convertedX, convertedY);
        warehouse.updateShelves();

        const request = document.createElement('a');
        request.href = '#';
        request.textContent = prodToMove;
        request.addEventListener('click', () => {
            // Mostra la modalOverlay quando la voce viene cliccata
            document.getElementById('modalOverlayId').style.display = 'block';
            // Codice per impostare i dettagli della modalOverlay in base alla voce selezionata
        });
        dropdownRequests.appendChild(request);
    } else {
        alert("Il prodotto non può essere spostato in quanto è stato rifiutato da terze parti.");
    }
    /* da migliorare con possibilità di cestinare richiesta o accettarla per fare movimento */

    /* implementazione sul modello 3d da fare */
}