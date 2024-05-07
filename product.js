import * as THREE from 'three';


/***********************************************/
/************** CLASSE PRODOTTO ****************/
/***********************************************/

export class Product {         //mettere alcuni campi privati (?) con relativi metodi get per accedere all'esterno

    constructor(name, width, height, depth, color = 0xab8348) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.color = color;
        this.geometry = null;
        this.mesh = this.createMesh();
        const productBounding = new THREE.Box3().setFromObject(this.mesh);
        this.bounding = productBounding;
        this.shelf = null;
        this.binx = null;
        this.biny = null;
    }
  
    createMesh() {
        /*const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        return new THREE.Mesh(geometry, material);*/

        const texture = new THREE.TextureLoader().load('assets/product.jpg');

        // Crea il materiale con la texture
        const material = new THREE.MeshBasicMaterial({ map: texture });

        // Crea la geometria della mesh
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        this.geometry = geometry;
        console.log("Created", this.geometry);

        // Crea e restituisci la mesh con la geometria e il materiale
        return new THREE.Mesh(geometry, material);
    }

    assignBin(shelf, x, y) {
        if(this.shelf != null) {
            this.unassignBin();
        }
        this.shelf = shelf;
        this.binx = x;
        this.biny = y;
    }

    unassignBin() {
        this.shelf = null;
        this.binx = null;
        this.biny = null;
    }

    removeProduct() {
        if(this.shelf != null)
            this.shelf.removeObjectFromBin(this, this.binx, this.biny);
        this.shelf = null;
        this.binx = null;
        this.biny = null;
    }

    resize(dimension){
        dimension *= 0.8;
        this.width = dimension;
        this.height = dimension;
        this.depth = dimension;
        // Create a new geometry with the new dimensions
        const newGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        // Dispose of the old geometry
        this.mesh.geometry.dispose();
        // Assign the new geometry to the mesh
        this.mesh.geometry = newGeometry;
        this.geometry = this.mesh.geometry;
        const productBounding = new THREE.Box3().setFromObject(this.mesh);
        this.bounding = productBounding;
    }
}