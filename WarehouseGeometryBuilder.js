import * as THREE from 'three';
import * as BufferGeometryUtils from './BufferGeometryUtils';

/***********************************************/
/****** CLASSE GEOMETRIA MAGAZZINO IN 3D *******/
/***********************************************/

/**
 * @class WarehouseGeometryBuilder Rappresenta e costruisce la geometria dell'edificio in 3-dimensioni di un magazzino
 */
class WarehouseGeometryBuilder {
	static #_maxWidth = Number.POSITIVE_INFINITY;
	static #_maxHeight = Number.POSITIVE_INFINITY;
	static #_maxDepth = Number.POSITIVE_INFINITY;
	#_width;
    #_height;
    #_depth;

	/**
	 * @type {THREE.BufferGeometry}
	 */
	#_geometry;

	/**
	 * @param {number} width 
	 * @param {number} height 
	 * @param {number} depth 
	 */
	constructor(width, height, depth) {		
		this.#_geometry = null;
		this.#_setupDimensions(width, height, depth);
		this.#_buildGeometry();
	}

	/**
	 * Imposta le dimensioni del magazzino a partire dai parametri indicati
	 * @param {number} width 
	 * @param {number} height 
	 * @param {number} depth 
	 */
	#_setupDimensions(width, height, depth) {
		if(width <= 0 || height <= 0 || depth <= 0) {
			throw new Error("Le dimensioni per il magazzino sono negative o zero");
		}
		if(width > WarehouseGeometryBuilder.#_maxWidth || height > WarehouseGeometryBuilder.#_maxHeight || depth > WarehouseGeometryBuilder.#_maxDepth) {
			throw new Error("Le dimensioni per il magazzino eccedono i massimi valori impostati");
		}
		this.#_width = width;
		this.#_height = height;
		this.#_depth = depth;
	}

	/**
	 * Costruisce la figura 3D del magazzino
	 */
	#_buildGeometry() {
		const planeBottomGeo = new THREE.PlaneGeometry( this.#_width, this.#_depth );
		planeBottomGeo.rotateX( Math.PI / 2 );

		const planeBackGeo = new THREE.PlaneGeometry( this.#_width, this.#_height );
		planeBackGeo.translate(0, (this.#_height / 2), - (this.#_depth / 2));

		const planeFrontGeo = new THREE.PlaneGeometry( this.#_width, this.#_height );
		planeFrontGeo.translate(0, (this.#_height / 2), (this.#_depth / 2));

		const planeLeftGeo = new THREE.PlaneGeometry( this.#_depth, this.#_height );
		planeLeftGeo.rotateY( Math.PI / 2 );
		planeLeftGeo.translate(- (this.#_width / 2), (this.#_height / 2), 0);

		const planeRightGeo = new THREE.PlaneGeometry( this.#_depth, this.#_height );
		planeRightGeo.rotateY( - Math.PI / 2 );
		planeRightGeo.translate((this.#_width / 2), (this.#_height / 2), 0);

		this.#_geometry = BufferGeometryUtils.mergeGeometries([planeBottomGeo,planeBackGeo,planeFrontGeo,planeRightGeo,planeLeftGeo]);
	}
	
	/**
	 * @returns {THREE.BufferGeometry}
	 */
	get geometry() {
		return this.#_geometry;
	}
	
	/**
	 * @returns {number}
	 */
	get width() {
		return this.#_width;
	}

	/**
	 * @returns {number}
	 */
	get height() {
		return this.#_height;
	}

	/**
	 * @returns {number}
	 */
	get depth() {
		return this.#_depth;
	}

    /**
	 * @returns {number}
	 */
	static get maxWidth() {
		return WarehouseGeometryBuilder.#_maxWidth;		
	}

    /**
	 * @returns {number}
	 */
	static get maxHeight() {
		return WarehouseGeometryBuilder.#_maxHeight;		
	}

    /**
	 * @returns {number}
	 */
	static get maxDepth() {
		return WarehouseGeometryBuilder.#_maxDepth;		
	}

	/**
	 * @param {number} value Valore da impostare come massima lunghezza
	 */
	static set maxWidth(value) {
		if(value > 0) {
			WarehouseGeometryBuilder.#_maxWidth = value;
		}		
	}

	/**
	 * @param {number} value Valore da impostare come massima altezza
	 */
	static set maxHeight(value) {
		if(value > 0) {
			WarehouseGeometryBuilder.#_maxHeight = value;
		}
	}

	/**
	 * @param {number} value Valore da impostare come massima profondità
	 */
	static set maxDepth(value) {
		if(value > 0) {
			WarehouseGeometryBuilder.#_maxDepth = value;
		}
	}
}

export { WarehouseGeometryBuilder };