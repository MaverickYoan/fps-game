// Player Controller
class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        
        // Position and movement
        this.position = new THREE.Vector3(0, 1.7, 5);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Camera rotation
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        
        // Movement settings
        this.speed = 5;
        this.jumpSpeed = 6;
        this.gravity = 20;
        this.isOnGround = false;
        
        // Player stats
        this.health = 100;
        this.maxHealth = 100;
        
        // Input state
        this.keys = {};
        this.mouseMovement = { x: 0, y: 0 };
        this.mouseSensitivity = 0.002;
        
        // Collision
        this.boundingBox = new THREE.Box3();
        this.playerHeight = 1.7;
        this.playerRadius = 0.3;
        
        this.setupControls();
        this.updateCamera();
    }

    setupControls() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Jump
            if (e.code === 'Space' && this.isOnGround) {
                this.velocity.y = this.jumpSpeed;
                this.isOnGround = false;
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse movement (works with or without pointer lock)
        document.addEventListener('mousemove', (e) => {
            // Pointer lock mode
            if (document.pointerLockElement === document.body) {
                this.mouseMovement.x = e.movementX;
                this.mouseMovement.y = e.movementY;
            } 
            // Fallback mode without pointer lock
            else if (this.isMouseDown) {
                this.mouseMovement.x = e.movementX || 0;
                this.mouseMovement.y = e.movementY || 0;
            }
        });

        // Track mouse button for fallback mode
        this.isMouseDown = false;
        document.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right click for look
                this.isMouseDown = true;
                e.preventDefault();
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.isMouseDown = false;
            }
        });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    update(deltaTime, collisionObjects) {
        // Update rotation from mouse
        this.rotation.y -= this.mouseMovement.x * this.mouseSensitivity;
        this.rotation.x -= this.mouseMovement.y * this.mouseSensitivity;
        
        // Clamp vertical rotation
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
        
        // Reset mouse movement
        this.mouseMovement.x = 0;
        this.mouseMovement.y = 0;

        // Get movement direction
        this.direction.set(0, 0, 0);
        
        // Forward/Backward (ZQSD or WASD)
        if (this.keys['KeyW'] || this.keys['KeyZ']) this.direction.z -= 1;
        if (this.keys['KeyS']) this.direction.z += 1;
        
        // Left/Right
        if (this.keys['KeyA'] || this.keys['KeyQ']) this.direction.x -= 1;
        if (this.keys['KeyD']) this.direction.x += 1;
        
        // Normalize direction
        if (this.direction.length() > 0) {
            this.direction.normalize();
        }

        // Apply rotation to movement direction
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.rotation.y, 0));
        const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, this.rotation.y, 0));
        
        const moveDirection = new THREE.Vector3();
        moveDirection.addScaledVector(forward, this.direction.z);
        moveDirection.addScaledVector(right, this.direction.x);
        
        // Apply horizontal movement
        this.velocity.x = moveDirection.x * this.speed;
        this.velocity.z = moveDirection.z * this.speed;

        // Apply gravity
        if (!this.isOnGround) {
            this.velocity.y -= this.gravity * deltaTime;
        }

        // Update position
        const movement = this.velocity.clone().multiplyScalar(deltaTime);
        this.position.add(movement);

        // Ground collision
        if (this.position.y <= this.playerHeight) {
            this.position.y = this.playerHeight;
            this.velocity.y = 0;
            this.isOnGround = true;
        } else {
            this.isOnGround = false;
        }

        // Wall collision
        this.handleWallCollisions(collisionObjects);

        // Update camera
        this.updateCamera();
    }

    handleWallCollisions(collisionObjects) {
        // Simple sphere collision with walls
        for (const obj of collisionObjects) {
            if (!obj.geometry) continue;
            
            const objBox = new THREE.Box3().setFromObject(obj);
            const playerBox = new THREE.Box3(
                new THREE.Vector3(
                    this.position.x - this.playerRadius,
                    this.position.y - this.playerHeight,
                    this.position.z - this.playerRadius
                ),
                new THREE.Vector3(
                    this.position.x + this.playerRadius,
                    this.position.y,
                    this.position.z + this.playerRadius
                )
            );

            if (playerBox.intersectsBox(objBox)) {
                // Simple push back
                const center = objBox.getCenter(new THREE.Vector3());
                const pushDir = new THREE.Vector3().subVectors(this.position, center);
                pushDir.y = 0;
                pushDir.normalize();
                
                this.position.add(pushDir.multiplyScalar(0.1));
            }
        }
    }

    updateCamera() {
        this.camera.position.copy(this.position);
        this.camera.rotation.copy(this.rotation);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        audioSystem.playDamage();
        
        // Visual feedback
        document.getElementById('gameCanvas').classList.add('damage-flash');
        setTimeout(() => {
            document.getElementById('gameCanvas').classList.remove('damage-flash');
        }, 300);
        
        return this.health <= 0;
    }

    getForwardVector() {
        return new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);
    }

    reset() {
        this.position.set(0, 1.7, 5);
        this.velocity.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.health = this.maxHealth;
        this.updateCamera();
    }
}
