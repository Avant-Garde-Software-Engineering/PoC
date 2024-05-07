import * as THREE from 'three';
import { WarehouseGeometryBuilder } from './WarehouseGeometryBuilder';
import { ShelfGeometryBuilder } from './ShelfGeometryBuilder';


/***********************************************/
/**** CLASSE SCENA MAGAZZINO COMPLETO IN 3D ****/
/***********************************************/

/**
 * @class WarehouseScene Rappresenta la scena 3D del un magazzino: con edificio, scaffalature e prodotti
 */
class WarehouseScene {
    static #_defaultWarehouseWidth = 50;
    static #_defaultWarehouseHeight = 10;
    static #_defaultWarehouseDepth = 50;
    
    #_warehouse = {
        /**
         * @type {WarehouseGeometryBuilder}
         */
        geometryBuilder: null,
        /**
         * @type {THREE.Mesh}
         */
        mesh: null
    };

    /**
     * @typedef {{geometryBuilder: ShelfGeometryBuilder, mesh: THREE.Mesh, bounding: THREE.Box3}} shelfInfo
     */
    /**
     * @type {Object.<string, shelfInfo>[]}
     */
    #_shelves = [];
    #_products = [];
    #_movementRequests = [];

    /**
     * @type {THREE.Scene}
     */
    #_scene = null;

    /**
     * @type {THREE.PerspectiveCamera}
     */
    #_camera = null;

    #_pointer = new THREE.Vector2();
    #_raycaster = new THREE.Raycaster();
    #_moveMouse = new THREE.Vector2();
    #_sceneWidth = 0;
    #_sceneHeight = 0;



    /**
     * @type {DOMRect}
     */
    #_sceneRect = null;

    /**
     * @type {string}
     */
    #_draggingShelfId = null;

    #_selectedProduct = null;
    /** 
     * @param {number} warehouseWidth Lunghezza da impostare per l'edificio del magazzino
     * @param {number} warehouseHeight Altezza da impostare per l'edificio del magazzino
     * @param {number} warehouseDepth Profondità da impostare per l'edificio del magazzino
     * @param {THREE.Scene} scene Scena da utilizzare per la visualizzazione del magazzino
     * @param {THREE.PerspectiveCamera} camera Camera da utilizzare per osservare la scena
     * @param {number} sceneWidth Largezza della scena su schermo
     * @param {number} sceneHeight Altezza della scena su schermo
     * @param {DOMRect} sceneRect Rettangolo della posizione della scena su schermo
     */
    constructor(warehouseWidth, warehouseHeight, warehouseDepth, scene, camera, sceneWidth, sceneHeight, sceneRect) {
        try {
            this.#_warehouse.geometryBuilder = new WarehouseGeometryBuilder(warehouseWidth, warehouseHeight, warehouseDepth);
        } catch (error) {
            console.log(`Errore: ${error.message} - magazzino costruito con i parametri di default`);
            this.#_warehouse.geometryBuilder = new WarehouseGeometryBuilder(WarehouseScene.#_defaultWarehouseWidth, WarehouseScene.#_defaultWarehouseHeight, WarehouseScene.#_defaultWarehouseDepth);
        }
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('assets/muro.jpg');

        // Crea un materiale usando la texture
        const material = new THREE.MeshBasicMaterial({ map: texture });

        // Crea la mesh del magazzino utilizzando la geometria esistente e il nuovo materiale
        this.#_warehouse.mesh = new THREE.Mesh(this.#_warehouse.geometryBuilder.geometry, material);
        this.#_warehouse.mesh.material.side = THREE.DoubleSide;
        this.#_warehouse.mesh.userData.ground = true;
        this.#_sceneWidth = sceneWidth;
        this.#_sceneHeight = sceneHeight;
        this.#_sceneRect = sceneRect;
        this.#_scene = scene;
        this.#_scene.add(this.#_warehouse.mesh);
        this.#_camera = camera;
        this.#_camera.position.z = this.#_warehouse.geometryBuilder.depth + (this.#_warehouse.geometryBuilder.depth / 2);
        this.#_camera.position.y = this.#_warehouse.geometryBuilder.height + (this.#_warehouse.geometryBuilder.height * 3 / 2);
        this.#_camera.lookAt(new THREE.Vector3(0, 0, 0));

        window.addEventListener('dblclick', event => {
            //if(!event.shiftKey) return;
            this.#_pointer.x = ( event.offsetX / this.#_sceneWidth ) * 2 - 1;
            this.#_pointer.y = - ( event.offsetY / this.#_sceneHeight ) * 2 + 1;
        
            this.#_selectDraggingObj();
        });
        
        window.addEventListener('mousemove', event => {
            this.#_moveMouse.x = ( event.offsetX / this.#_sceneWidth ) * 2 - 1;
            this.#_moveMouse.y = - ( event.offsetY / this.#_sceneHeight ) * 2 + 1;
        });

        window.addEventListener('mousemove', event => {
            if (this.#_selectedProduct) {
                this.#_moveProduct(event);
            }
        });

        window.addEventListener('keydown', (event) => {
            const key = event.key;
            if (key === 'q') {
                this.rotateDraggingShelf("clockwise");
            } else if (key === 'e') {
                this.rotateDraggingShelf("counterclockwise");
            }
        });
    }

    addMovement(product, prevShelf, newShelf) {
        const count = this.#_movementRequests.length;
        this.#_movementRequests.push({
            id: count,
            product: product,
            prevShelf: prevShelf,
            newShelf: newShelf
        });
    }

    get movementRequests() {
        return this.#_movementRequests;
    }
    
    rotateDraggingShelf(direction) {
        console.log("Rotazione scaffalatura:", direction);
        if (this.#_draggingShelfId !== null) {
            const shelf = this.#_shelves[this.#_draggingShelfId];
            const rotationAmount = Math.PI / 2; // 90 gradi in radianti
            if (direction === "clockwise") {
                shelf.mesh.rotateY(rotationAmount);
            } else if (direction === "counterclockwise") {
                shelf.mesh.rotateY(-rotationAmount);
            }

            let shelfGeo = shelf.geometryBuilder;
            let shelfMesh = shelf.mesh;

            console.log("Rotazione:", shelfGeo.getRotation());
            // Aggiorna la geometria e i limiti di movimento della scaffalatura dopo la rotazione
            shelf.geometryBuilder.rotateShelf(direction);
            shelf.mesh.userData.update(); // Assicura che la scaffalatura rimanga all'interno dei limiti del magazzino

            if(shelfGeo.getRotation() == 0) {
                shelfMesh.userData.limit = {
                    min: new THREE.Vector3(-(this.#_warehouse.geometryBuilder.width/2 - shelfGeo.width / 2), 0, -(this.#_warehouse.geometryBuilder.depth/2 - shelfGeo.depth / 2)),
                    max: new THREE.Vector3((this.#_warehouse.geometryBuilder.width/2 - shelfGeo.width / 2), 0, (this.#_warehouse.geometryBuilder.depth/2 - shelfGeo.depth / 2))
                };
            } else if(shelfGeo.getRotation() == Math.PI / 2) {
                shelfMesh.userData.limit = {
                    min: new THREE.Vector3(-(this.#_warehouse.geometryBuilder.width/2 - shelfGeo.depth / 2), 0, -(this.#_warehouse.geometryBuilder.depth/2 - shelfGeo.width / 2)),
                    max: new THREE.Vector3((this.#_warehouse.geometryBuilder.width/2 - shelfGeo.depth / 2), 0, (this.#_warehouse.geometryBuilder.depth/2 - shelfGeo.width / 2))
                };
            } else {
                console.error("Rotazione non supportata");
            }
        }
    }
    /**
     * Aggiunge scaffalatura nella scena che si sposta con il cursore del mouse. Con un trascinamento in atto, non aggiunge nulla.
     * @param {ShelfGeometryBuilder} shelfGeo
     * @param {string} id Identificativo da assegnare alla scaffalatura
     * @returns {boolean}
     */
    addShelf(shelfGeo, id) {
        if(this.#_draggingShelfId !== null || id in this.#_shelves) return false;
        if(shelfGeo.width > this.#_warehouse.geometryBuilder.width || shelfGeo.height > this.#_warehouse.geometryBuilder.height || shelfGeo.depth > this.#_warehouse.geometryBuilder.depth) {
            throw new Error("La scaffalatura eccede le dimensioni del magazzino");
        }


        
        // Carica la texture
        const texture = new THREE.TextureLoader().load('assets/texture_metallo.jpg');

        // Creazione del materiale utilizzando la texture caricata
        const material = new THREE.MeshBasicMaterial({ map: texture });

        // Abilita la trasparenza per il materiale
        material.transparent = true;

        // Creazione del mesh dello scaffale utilizzando la geometria dello scaffale e il nuovo materiale
        const shelfMesh = new THREE.Mesh(shelfGeo.geometry, material);

        // Imposta la posizione del mesh dello scaffale
        shelfMesh.position.set(0, 0, 0);

        // Aggiunge il mesh dello scaffale alla scena
        this.#_scene.add(shelfMesh);

        this.#_scene.updateMatrixWorld();
        
        shelfMesh.userData.limit = {
            min: new THREE.Vector3(-(this.#_warehouse.geometryBuilder.width/2 - shelfGeo.width / 2), 0, -(this.#_warehouse.geometryBuilder.depth/2 - shelfGeo.depth / 2)),
            max: new THREE.Vector3((this.#_warehouse.geometryBuilder.width/2 - shelfGeo.width / 2), 0, (this.#_warehouse.geometryBuilder.depth/2 - shelfGeo.depth / 2))
        };
        shelfMesh.userData.update = function(){
            shelfMesh.position.clamp(shelfMesh.userData.limit.min, shelfMesh.userData.limit.max);
        }
        
        const shelfBounding = new THREE.Box3().setFromObject(shelfMesh);
        this.#_shelves[id] = {
            geometryBuilder: shelfGeo,
            mesh: shelfMesh,
            bounding: shelfBounding
        };
    
        this.#_draggingShelfId = id;
        shelfMesh.material.opacity = 0.7;
        return true;
    }

    addProduct(product) {
        const id = product.name;
        if (product == null || product.name in this.#_products) return false;

        this.checkProductBoundaries(product);
        product.mesh.userData.update = function(){
            product.mesh.position.clamp(product.mesh.userData.limit.min, product.mesh.userData.limit.max);
        }

        // Aggiungi il prodotto alla scena e all'array dei prodotti
        this.#_scene.add(product.mesh);
        this.#_products[id] = product;

        this.#_selectedProduct = id;
        product.mesh.material.opacity = 0.7;

        return true;
    }

    checkProductBoundaries(product) {
        let floorY = product.geometry.parameters.height / 2; // Altezza del pavimento
        const isAssigned = product.shelf != null;
        if(isAssigned) {
            const shelfGeo = product.shelf; // Ottenere il geometryBuilder della scaffalatura associata al prodotto
            const shelfMesh = this.findShelfMeshByGeometryBuilder(shelfGeo); // Trova la mesh della scaffalatura
            const position = shelfGeo.objectPosition(product, shelfMesh);
            product.mesh.userData.limit = {
                min: new THREE.Vector3(position.x, position.y, position.z),
                max: new THREE.Vector3(position.x, position.y, position.z)
            };
        } else {
            product.mesh.userData.limit = {
                min: new THREE.Vector3(-(this.#_warehouse.geometryBuilder.width / 2 - product.width / 2), floorY, -(this.#_warehouse.geometryBuilder.depth / 2 - product.depth / 2)),
                max: new THREE.Vector3((this.#_warehouse.geometryBuilder.width / 2 - product.width / 2), Number.MAX_VALUE, (this.#_warehouse.geometryBuilder.depth / 2 - product.depth / 2))
            };
        }
        product.mesh.userData.update = function(){
            product.mesh.position.clamp(product.mesh.userData.limit.min, product.mesh.userData.limit.max);
        }
    }

    findShelfMeshByGeometryBuilder(geometryBuilder) {
        // Itera attraverso le scaffalature nella scena e controlla se il geometryBuilder corrisponde a quello cercato
        for (const [key, value] of Object.entries(this.#_shelves)) {
            if (value.geometryBuilder === geometryBuilder) {
                return value.mesh; // Restituisci la mesh della scaffalatura se trovi una corrispondenza
            }
        }
        return null; // Se non trovi corrispondenze, restituisci null
    }

    /**
     * Restituisce gli id delle scaffalature che collidono con quella inserita come parametro
     * @param {string} id Identificatore della scaffalatura su cui verificare le collisioni 
     * @returns {string[]}
     */
    #_checkShelfCollisions(id) {
        const collisions = [];
        if(this.#_shelves[id]){
            const bounding = this.#_shelves[id].bounding;
            
            for(const [key, value] of Object.entries(this.#_shelves)) {
                const element = value.bounding;
                if(element.intersectsBox(bounding) && element !== bounding) {
                    collisions.push(key);
                }
            }
            for(const [key, value] of Object.entries(this.#_products)) {
                const element = value.bounding;
                console.log("Geometry builder:", this.#_shelves[this.#_draggingShelfId].geometryBuilder);
                console.log("element.shelf:", element.shelf);
                if(element.intersectsBox(bounding) && value.shelf != this.#_shelves[this.#_draggingShelfId].geometryBuilder) {
                    collisions.push(key);
                }
            }
        } else if(this.#_products[id]) {
            const bounding = this.#_products[id].bounding;
            for(const [key, value] of Object.entries(this.#_shelves)) {
                const element = value.bounding;
                if(element.intersectsBox(bounding)) {
                    collisions.push(key);
                }
            }
            for(const [key, value] of Object.entries(this.#_products)) {
                const element = value.bounding;
                if(element.intersectsBox(bounding) && element !== bounding) {
                    collisions.push(key);
                }
            }
        }
        console.log("Collisioni:", collisions);
        return collisions;
    }

    /**
     * Restituisce un array di mesh delle scaffalature aggiunte nel magazzino
     * @returns {THREE.Mesh[]}
     */
    #_getShelfMesh() {
        let arrayMesh = [];
        for(const [key, value] of Object.entries(this.#_shelves)) {
            arrayMesh.push(value.mesh);
        }
        return arrayMesh;
    }

    #_getProductMesh() {
        let arrayMesh = [];
        for(const [key, value] of Object.entries(this.#_products)) {
            arrayMesh.push(value.mesh);
        }
        return arrayMesh;
    }

    #_getProducts() {
        let array = [];
        for(const [key, value] of Object.entries(this.#_products)) {
            array.push(value);
        }
        return array;
    }

    #_getKeyOfShelfMesh(value) {
        return Object.keys(this.#_shelves).find(key => this.#_shelves[key].mesh === value);
    }

    #_getKeyOfProductMesh(value) {
        return Object.keys(this.#_products).find(key => this.#_products[key].mesh === value);
    }
    
    updateShelves() {
        for(const [key, value] of Object.entries(this.#_shelves)) {
            value.geometryBuilder.updateContent();
        }
    }

    /**
     * Seleziona tramite raycasting con il puntatore del mouse lo scaffale da spostare. Se viene invocata in fase di trascinamento, conclude la fase.
     * @returns {void}
     */

    #_selectDraggingObj() {

        if(this.#_draggingShelfId !== null) {
            let collisions = this.#_checkShelfCollisions(this.#_draggingShelfId);
            console.log("Shelf:", this.#_shelves[this.#_draggingShelfId]);
            if(collisions.length > 0) {
                return;
            }
            this.#_shelves[this.#_draggingShelfId].mesh.material.opacity = 1;
            this.#_shelves[this.#_draggingShelfId].mesh.updateMatrixWorld();
            this.#_draggingShelfId = null;
            return;
        }
        if(this.#_selectedProduct !== null) {
            console.log("Selected product:", this.#_selectedProduct);
            let collisions = this.#_checkShelfCollisions(this.#_selectedProduct);
            console.log("Collisions:", collisions);
            let collidesWithShelf = 0;
            for(let i = 0; i < collisions.length; i++){
                if(collisions[i] in this.#_shelves) collidesWithShelf++;
            }
            let accepted = true;
            if(collisions.length > 0) accepted = false;
            if(collidesWithShelf){
                accepted = true;
                const randomColumnIndex = Math.floor(Math.random()*2);
                if(randomColumnIndex) accepted = false;
                if(collisions.length > 0) {
                    if(accepted)
                        this.#_shelves[collisions[0]].geometryBuilder.insertObjectInRandomBin(this.#_products[this.#_selectedProduct], this.#_shelves[collisions[0]].mesh);
                    else 
                        alert("Il prodotto non può essere spostato in quanto è stato rifiutato da terze parti.");
                }
            }
            if(accepted) {
                console.log("Ciao:", this.#_products[this.#_selectedProduct]);
                this.#_products[this.#_selectedProduct].mesh.material.opacity = 1;
                this.#_products[this.#_selectedProduct].mesh.updateMatrixWorld();
                this.#_selectedProduct = null;
                return;
            }
        }

        this.#_raycaster.setFromCamera(this.#_pointer, this.#_camera);
        let arrayShelfMesh = this.#_getShelfMesh();
        let intersects = this.#_raycaster.intersectObjects(arrayShelfMesh, false);
        if(intersects.length > 0 && this.#_selectedProduct == null) {
            intersects[0].object.material.opacity = 0.7;
            this.#_draggingShelfId = this.#_getKeyOfShelfMesh(intersects[0].object);
        }
        intersects = this.#_raycaster.intersectObjects(this.#_getProductMesh(), false);
        if (intersects.length > 0 && this.#_draggingShelfId === null) {

            this.#_selectedProduct = this.#_getKeyOfProductMesh(intersects[0].object);
            if(this.#_products[this.#_selectedProduct].shelf !== null) {
                this.#_selectedProduct = null;
            }
            // Esegui azioni aggiuntive se necessario (ad esempio, evidenzia il prodotto)
        }
    }

    /**
     * Aggiorna la posizione dello scaffale in fase di trascinamento
     * @returns {void}
     */
    #_dragShelf() {
        if (this.#_draggingShelfId !== null) {
            this.#_raycaster.setFromCamera(this.#_moveMouse, this.#_camera);
            const intersects = this.#_raycaster.intersectObjects(this.#_scene.children);
            if(intersects.length > 0) {
                for(let o of intersects) {
                    if(!o.object.userData.ground) continue;
                    const shelf = this.#_shelves[this.#_draggingShelfId];
                    shelf.mesh.position.x = o.point.x;
                    shelf.mesh.position.z = o.point.z;
                }
                //alert("prova1");
                let shelf = this.#_shelves[this.#_draggingShelfId];
                shelf.geometryBuilder.updateProductBin(shelf.mesh);  // update anche dei prodotti all'interno dei BIN
            }
        }
    }

    #_moveProduct(event) {
        // Aggiorna la posizione del prodotto in base alla posizione del cursore del mouse
        this.#_moveMouse.x = (event.offsetX / this.#_sceneWidth) * 2 - 1;
        this.#_moveMouse.y = -(event.offsetY / this.#_sceneHeight) * 2 + 1;

        this.#_raycaster.setFromCamera(this.#_moveMouse, this.#_camera);
        const intersects = this.#_raycaster.intersectObjects([this.#_warehouse.mesh], false); // Limita l'intersezione alla mesh del magazzino
        if (intersects.length > 0) {
            for (let o of intersects) {
                if (!o.object.userData.ground) continue;
                const intersectionPoint = intersects[0].point;

                // Mantieni la posizione verticale del prodotto costante
                const currentProduct = this.#_products[this.#_selectedProduct];
                intersectionPoint.y = currentProduct.mesh.position.y;

                currentProduct.mesh.position.copy(intersectionPoint);
            }
        }
    }

    deleteShelf(id) {
        const shelfGeometry = this.#_shelves[id].geometryBuilder.geometry;
        this.#_scene.remove(shelfGeometry);

        // Rimuovere l'oggetto mesh dello scaffale dalla scena
        const shelfMesh = this.#_shelves[id].mesh;
        this.#_scene.remove(shelfMesh);

        // Rimuovere l'oggetto scaffale dall'array #_shelves[]
        delete this.#_shelves[id];
    }

    deleteProduct(id) {
        const prodGeometry = this.#_products[id].geometry;
        this.#_scene.remove(prodGeometry);

        // Rimuovere l'oggetto mesh dello scaffale dalla scena
        const prodMesh = this.#_products[id].mesh;
        this.#_scene.remove(prodMesh);

        // Rimuovere l'oggetto scaffale dall'array #_shelves[]
        delete this.#_products[id];
    }

    /**
     * Aggiorna la visualizzazione degli elementi nella scena
     * @returns {void}
     */
    updateScene() {
        let arrayMesh;
        if(this.#_draggingShelfId){
            for(const [key, value] of Object.entries(this.#_shelves)) {
                value.bounding.copy(value.geometryBuilder.geometry.boundingBox).applyMatrix4(value.mesh.matrixWorld);
            }
            this.#_dragShelf();
            let arrayMesh = this.#_getShelfMesh();        
            arrayMesh.forEach(o => {
                o.userData.update();
            })
            arrayMesh = this.#_getProducts();        
            arrayMesh.forEach(o => {
                this.checkProductBoundaries(o)
                o.mesh.userData.update();
            })
        } else if(this.#_selectedProduct) {
            for(const [key, value] of Object.entries(this.#_products)) {
                value.bounding.copy(value.geometry.boundingBox).applyMatrix4(value.mesh.matrixWorld);
            }
            arrayMesh = this.#_getProducts();        
            arrayMesh.forEach(o => {
                this.checkProductBoundaries(o)
                o.mesh.userData.update();
            })
        }
    }

    /**
     * @returns {THREE.Scene}
     */
    get scene() {
        return this.#_scene;
    }

    resizeScene(sceneWidth, sceneHeight) {
        this.#_sceneWidth = sceneWidth;
        this.#_sceneHeight = sceneHeight;
    }
    
    /**
     * Restituisce l'elenco delle scaffalature presenti nella scena del magazzino
     * @returns {Object.<string, shelfInfo>[]} Un array di oggetti contenenti informazioni sulle scaffalature
     */
    getShelves() {
        return this.#_shelves;
    }

    getProducts() {
        console.log("Sono in getProdcuts.", this.#_products);
        return this.#_products;
    }
}

    

export {WarehouseScene};