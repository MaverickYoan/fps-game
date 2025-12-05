// Environment and Level Design
class Environment {
    constructor(scene) {
        this.scene = scene;
        this.collisionObjects = [];
        this.createEnvironment();
    }

    createEnvironment() {
        // Lighting
        this.createLighting();
        
        // Floor
        this.createFloor();
        
        // Walls
        this.createWalls();
        
        // Obstacles
        this.createObstacles();
        
        // Ceiling
        this.createCeiling();
    }

    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Colored accent lights
        const light1 = new THREE.PointLight(0xff3333, 1, 20);
        light1.position.set(-10, 3, -10);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0x3333ff, 1, 20);
        light2.position.set(10, 3, -10);
        this.scene.add(light2);

        const light3 = new THREE.PointLight(0x33ff33, 1, 20);
        light3.position.set(0, 3, -15);
        this.scene.add(light3);
    }

    createFloor() {
        const geometry = new THREE.PlaneGeometry(40, 40);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.3,
            roughness: 0.7
        });
        
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        
        this.scene.add(floor);

        // Add grid pattern
        const gridHelper = new THREE.GridHelper(40, 40, 0x444444, 0x222222);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }

    createWalls() {
        const wallHeight = 6;
        const wallThickness = 0.5;
        const arenaSize = 20;

        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d2d44,
            metalness: 0.4,
            roughness: 0.6
        });

        // North wall
        const northWall = this.createWall(arenaSize, wallHeight, wallThickness, wallMaterial);
        northWall.position.set(0, wallHeight / 2, -arenaSize / 2);
        this.collisionObjects.push(northWall);

        // South wall
        const southWall = this.createWall(arenaSize, wallHeight, wallThickness, wallMaterial);
        southWall.position.set(0, wallHeight / 2, arenaSize / 2);
        this.collisionObjects.push(southWall);

        // East wall
        const eastWall = this.createWall(wallThickness, wallHeight, arenaSize, wallMaterial);
        eastWall.position.set(arenaSize / 2, wallHeight / 2, 0);
        this.collisionObjects.push(eastWall);

        // West wall
        const westWall = this.createWall(wallThickness, wallHeight, arenaSize, wallMaterial);
        westWall.position.set(-arenaSize / 2, wallHeight / 2, 0);
        this.collisionObjects.push(westWall);
    }

    createWall(width, height, depth, material) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const wall = new THREE.Mesh(geometry, material);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);
        return wall;
    }

    createObstacles() {
        const obstacleMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d3d5c,
            metalness: 0.5,
            roughness: 0.5
        });

        // Create some cover obstacles
        const obstacles = [
            { x: -5, z: 0, width: 2, height: 1.5, depth: 2 },
            { x: 5, z: 0, width: 2, height: 1.5, depth: 2 },
            { x: 0, z: -5, width: 3, height: 1, depth: 1 },
            { x: -8, z: -8, width: 1.5, height: 2, depth: 1.5 },
            { x: 8, z: -8, width: 1.5, height: 2, depth: 1.5 }
        ];

        for (const obs of obstacles) {
            const geometry = new THREE.BoxGeometry(obs.width, obs.height, obs.depth);
            const obstacle = new THREE.Mesh(geometry, obstacleMaterial.clone());
            obstacle.position.set(obs.x, obs.height / 2, obs.z);
            obstacle.castShadow = true;
            obstacle.receiveShadow = true;
            
            // Add colored edge
            const edgeGeometry = new THREE.EdgesGeometry(geometry);
            const edgeMaterial = new THREE.LineBasicMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.5
            });
            const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
            obstacle.add(edges);
            
            this.scene.add(obstacle);
            this.collisionObjects.push(obstacle);
        }
    }

    createCeiling() {
        const geometry = new THREE.PlaneGeometry(40, 40);
        const material = new THREE.MeshStandardMaterial({
            color: 0x0f0f1e,
            metalness: 0.3,
            roughness: 0.7,
            side: THREE.DoubleSide
        });
        
        const ceiling = new THREE.Mesh(geometry, material);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 6;
        
        this.scene.add(ceiling);
    }

    getCollisionObjects() {
        return this.collisionObjects;
    }
}
