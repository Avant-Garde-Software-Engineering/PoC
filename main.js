import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'         /*per ruotare con mouse la vista del magazzino */

import { Product } from './product.js';
import { ShelfGeometryBuilder } from './ShelfGeometryBuilder.js';
export { scene };
import { WarehouseScene } from './WarehouseScene.js';


/***********************************************/
/************* SETUP AMBIENTE 3D ***************/
/***********************************************/

//accedo al container div wms per il sistema 3d
const container = document.getElementById('wms');

//creo scena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

//creo camera
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

//creo renderer e lo aggiungo al container
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight); 
//let boundingRect = renderer.domElement.getBoundingClientRect();
container.appendChild(renderer.domElement);

//controlli per ruotare la vista del magazzino
const controls = new OrbitControls(camera, renderer.domElement);

let keys = {
    W: false,
    A: false,
    S: false,
    D: false,
    ARROW_UP: false,
    ARROW_LEFT: false,
    ARROW_DOWN: false,
    ARROW_RIGHT: false
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'w' || event.key === 'W') {
        keys.W = true;
    } else if (event.key === 'a' || event.key === 'A') {
        keys.A = true;
    } else if (event.key === 's' || event.key === 'S') {
        keys.S = true;
    } else if (event.key === 'd' || event.key === 'D') {
        keys.D = true;
    } else if (event.key === 'ArrowUp') {
        keys.ARROW_UP = true;
    } else if (event.key === 'ArrowLeft') {
        keys.ARROW_LEFT = true;
    } else if (event.key === 'ArrowDown') {
        keys.ARROW_DOWN = true;
    } else if (event.key === 'ArrowRight') {
        keys.ARROW_RIGHT = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 'W') {
        keys.W = false;
    } else if (event.key === 'a' || event.key === 'A') {
        keys.A = false;
    } else if (event.key === 's' || event.key === 'S') {
        keys.S = false;
    } else if (event.key === 'd' || event.key === 'D') {
        keys.D = false;
    } else if (event.key === 'ArrowUp') {
        keys.ARROW_UP = false;
    } else if (event.key === 'ArrowLeft') {
        keys.ARROW_LEFT = false;
    } else if (event.key === 'ArrowDown') {
        keys.ARROW_DOWN = false;
    } else if (event.key === 'ArrowRight') {
        keys.ARROW_RIGHT = false;
    }
});

// Funzione per aggiornare la posizione e la rotazione della telecamera
function updateCameraPosition() {
    const speed = 0.5; // Velocità di movimento
    const rotationSpeed = 0.01; // Velocità di rotazione

    if (keys.W) {
        const frontVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
        camera.position.addScaledVector(frontVector, speed);
    }
    if (keys.S) {
        const frontVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
        camera.position.addScaledVector(frontVector, -speed);
    }
    if (keys.A) {
        const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
        camera.position.addScaledVector(rightVector, -speed);
    }
    if (keys.D) {
        const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
        camera.position.addScaledVector(rightVector, speed);
    }
    
    if (keys.ARROW_UP) {
        camera.rotateX(rotationSpeed);
    }
    if (keys.ARROW_DOWN) {
        camera.rotateX(-rotationSpeed);
    }
    if (keys.ARROW_LEFT) {
        const upVector = new THREE.Vector3(0, 1, 0);
        camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(upVector, rotationSpeed));
    }
    if (keys.ARROW_RIGHT) {
        const upVector = new THREE.Vector3(0, 1, 0);
        camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(upVector, -rotationSpeed));
    }
}

//loop di renderizzazione
export function animate() {
    updateCameraPosition();
	warehouse.updateScene();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

//aggiornamento scena se ridimensiono finestra
function onWindowResize() {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();        //in quanto ho modificato parametri
	warehouse.resizeScene(container.clientWidth, container.clientHeight);
}
window.addEventListener('resize', onWindowResize);


/***********************************************/
/************** COMANDI GRAFICI ****************/
/***********************************************/
// comando reset della vista

/*resetViewBtn.addEventListener('click', () => {
	controls.reset();
	controls.update();
});

//zoom +
zoomInBtn.addEventListener('click', () => {
	console.log("zoom in");
});

//zoom -
zoomOutBtn.addEventListener('click', () => {
	console.log("zoom out");
});

//ruota v/dx
rotateDxBtn.addEventListener('click', () => {
	console.log("ruota dx");
});

//ruota v/sx
rotateSxBtn.addEventListener('click', () => {
	console.log("ruota sx");
});
*/


/***********************************************/
/***************** MAGAZZINO *******************/
/***********************************************/
/**
 * @type {WarehouseScene}
 */
let warehouse = null;

export function setupWhs(width, height, depth) {
    warehouse = new WarehouseScene(width, height, depth, scene, camera, container.clientWidth, container.clientHeight);

    // Crea la griglia con la texture
    const gridHelper = new THREE.GridHelper(Math.max(depth, width) + 3, (Math.max(depth, width) + 3), 0x000000, 0x000000); // Usa il colore bianco per ora

    // Aggiungi la griglia alla scena
    scene.add(gridHelper);

	animate();
}

export {warehouse};

/***********************************************/
/*********** AGGIUNTA NUOVI OGGETTI ************/
/***********************************************/

const productList = document.getElementById('productLib');        //lista dei prodotti su lib (sidebar finestra principale)
const shelfList = document.getElementById('shelfLib');        //lista delle scaffalature su lib (sidebar finestra principale)

const prodDatalist = document.getElementById('products');        //lista dei prodotti su finestra di movimentazione
const shelDatalist = document.getElementById('shelves');        //lista dei prodotti su finestra di movimentazione

export function addObjToLib(obj, id) {
	
    const newElement = document.createElement('li');
	newElement.textContent = id;
	

    //pulsante per modifica scaffalatura
    /*var editShelfBtn = document.createElement("button");
    editShelfBtn.id= "shelfEditButton";
    editShelfBtn.textContent = "Edit";
    editShelfBtn.addEventListener("click", () =>{
        editShelfWin.style.display = 'flex';
    });*/

    //pulsante per eliminare scaffalatura
    var deleteShelfBtn = document.createElement("button");
    deleteShelfBtn.id= "shelfDeleteButton";
    deleteShelfBtn.textContent = "Delete";
    deleteShelfBtn.addEventListener("click", () =>{
        // deleteShelfWin.style.display = 'flex';
        /*let prova= obj;
        prova.removeShelf();
        */
        if(obj.removeShelf()){
            warehouse.deleteShelf(id);
            
            newElement.remove();

            const shelDatalist = document.getElementById('shelves'); // Ottieni il datalist
            const optionToRemove = shelDatalist.querySelector(`option[value="${id}"]`); // Seleziona l'elemento option tramite l'ID

            if (optionToRemove) {
                shelDatalist.removeChild(optionToRemove); // Rimuovi l'elemento option dal datalist
            }
        } else {
            alert("Non è stato possibile eliminare la scaffalatura");
        }

    });
    
    // Aggiungi un gestore di eventi per le voci del dropdown
    document.querySelectorAll('.dropdown-content button').forEach(button => {
        button.addEventListener('click', () => {
            if (warehouse.movementRequest && warehouse.movementRequest.length > 0) {
                const movementId = button.dataset.movementId;
                const movement = warehouse.movementRequest.find(m => m.id === movementId);
                if (movement) {
                    const movementInfo = `ID Movimento: ${movement.id}<br>
                                        Prodotto: ${movement.product}<br>
                                        Scaffalatura Precedente: ${movement.prevShelf}<br>
                                        Nuova Scaffalatura: ${movement.newShelf}`;
                    document.getElementById('movementInfo').innerHTML = movementInfo;
                    document.getElementById('movementDetails').style.display = 'block';
                }
            }
        });
    });

    // Gestore di eventi per chiudere il modalOverlay
    document.getElementById('closeMovementDetails').addEventListener('click', () => {
        document.getElementById('movementDetails').style.display = 'none';
    });

    //pulsante per eliminare oggetti
    var deleteObjectBtn = document.createElement("button");
    deleteObjectBtn.id= "objectDeleteButton";
    deleteObjectBtn.textContent = "Delete";
    deleteObjectBtn.addEventListener("click", () =>{
        obj.removeProduct();    
        warehouse.deleteProduct(id);
        newElement.remove();
        const prodDatalist = document.getElementById('products'); // Ottieni il datalist
        const optionToRemove = prodDatalist.querySelector(`option[value="${id}"]`); // Seleziona l'elemento option tramite l'ID

        if (optionToRemove) {
            prodDatalist.removeChild(optionToRemove); // Rimuovi l'elemento option dal datalist
        }
    });

    if (obj instanceof ShelfGeometryBuilder) {
        if (warehouse.addShelf(obj, id)) {
			newElement.textContent = id;
            shelfList.appendChild(newElement);//aggiungo scaffalatura alla lib
            newElement.appendChild(deleteShelfBtn); //aggiungo bottone elimina

            //aggiungo elemento nella finestra di movimentazione
            const shelOption = document.createElement('option');
            shelOption.value = id;
            shelDatalist.appendChild(shelOption);

        } else {
            alert("Non è stato possibile inserire la scaffalatura");
        }
    } 
    else if (obj instanceof Product) {
		if(warehouse.addProduct(obj)) {
			productList.appendChild(newElement);       //aggiungo prod. alla lib
			newElement.textContent = obj.name;
			//newElement.appendChild(moveObjectBtn);     //aggiungo bottone sposta
			newElement.appendChild(deleteObjectBtn);   //aggiungo bottone elimina


			//aggiungo elemento nella finestra di movimentazione
			const prodOption = document.createElement('option');
			prodOption.value = obj.name;
			prodDatalist.appendChild(prodOption);
            return true;
		} else {
			alert("Non è stato possibile inserire il prodotto");
            return false;
		}
    }
}


