import { ShelfGeometryBuilder } from './ShelfGeometryBuilder.js';
import { addObjToLib } from './main.js';
import { scene } from './main.js'
import { Product } from './product.js'


/***********************************************/
/*************** SETUP PRODOTTO ****************/
/***********************************************/

const setupProdWin = document.getElementById('addProduct');
const prodSizeForm = document.getElementById('prodSetupForm');

/* Aprire finestra per aggiunta prodotto quando 
bottone viene cliccato*/
addProductBtn.addEventListener('click', () => {
    setupProdWin.style.display = 'flex';
});

/* Chiudere le finestra del setup del prodotto
se clicco sul bottone annulla annulla */
const closeBtn = document.getElementById('closeProdSetup');
closeBtn.addEventListener('click', () => {
	closeSetUpProdWin();
});

/* Chiudere la finestra del setup del prodotto e 
aggiunta del prodotto al mag. quando faccio il submit del form*/
function closeSetUpProdWin () {
    setupProdWin.style.display = 'none';
    prodSizeForm.reset();
}

prodSizeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let prodWidth = 1.5;//parseFloat(document.getElementById('prodWidth').value);
    let prodDepth = 1.5;//parseFloat(document.getElementById('prodDepth').value);
    let prodHeight = 1.5;//parseFloat(document.getElementById('prodHeight').value);
    let prodName = document.getElementById('prodName').value.trim();

    if (isNaN(prodDepth) || isNaN(prodWidth) || isNaN(prodHeight) || prodName.length == 0) {        /*da implementare se check stesso nome*/       
        alert("Assicurarsi di aver compilato tutti i campi");
    } 
    else {
        try{
            let newProduct = new Product(prodName, prodWidth, prodHeight, prodDepth);
            if(addObjToLib(newProduct, prodName)){
                scene.add(newProduct.mesh);
            }
            closeSetUpProdWin();   
        } catch (e) {
            alert(e);
        }
    }
});