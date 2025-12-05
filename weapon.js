// Weapon System
class Weapon {
    constructor(camera, scene, effectsSystem, targetManager, ui) {
        this.camera = camera;
        this.scene = scene;
        this.effectsSystem = effectsSystem;
        this.targetManager = targetManager;
        this.ui = ui;
        
        // Weapon stats - improved for better gameplay
        this.damage = 50; // 2 shots to destroy a target
        this.fireRate = 0.15; // slightly faster fire rate
        this.maxAmmo = 30;
        this.currentAmmo = 30;
        this.reserveAmmo = 120; // more reserve ammo
        this.reloadTime = 1.5; // faster reload
        
        // State
        this.lastFireTime = 0;
        this.isReloading = false;
        this.canFire = true;
        
        // Raycaster for shooting
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 100;
        
        // Recoil - reduced for better control
        this.recoilAmount = 0;
        this.recoilRecovery = 8; // faster recovery
        
        // Stats
        this.shotsFired = 0;
        this.shotsHit = 0;
        
        this.setupControls();
    }

    setupControls() {
        // Mouse click to shoot (semi-automatic - one shot per click)
        this.mousePressed = false;
        
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mousePressed = true;
                this.fire();
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mousePressed = false;
            }
        });

        // R to reload
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR') {
                this.reload();
            }
        });
    }

    fire() {
        // Only fire if mouse was just pressed (not held down)
        if (!this.canFire || this.isReloading || !this.mousePressed) return;
        
        // Prevent automatic fire - require new click
        this.mousePressed = false;
        
        const now = Date.now() / 1000;
        if (now - this.lastFireTime < this.fireRate) return;
        
        if (this.currentAmmo <= 0) {
            // Auto reload if out of ammo
            this.reload();
            return;
        }

        this.lastFireTime = now;
        this.currentAmmo--;
        this.shotsFired++;

        // Play sound
        audioSystem.playShoot();

        // Muzzle flash
        const position = this.camera.position.clone();
        const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.camera.rotation);
        this.effectsSystem.showMuzzleFlash(position, direction.clone());

        // Apply recoil
        this.applyRecoil();

        // Raycast to check for hits
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        // Check if we hit a target
        if (this.targetManager && this.ui) {
            const hit = this.targetManager.checkHit(this.raycaster, this.damage);
            if (hit) {
                this.shotsHit++;
                this.ui.showHitMarker();
            }
        }
    }

    applyRecoil() {
        // More noticeable but still controllable recoil
        this.recoilAmount = 0.015;
    }

    updateRecoil(deltaTime) {
        if (this.recoilAmount > 0) {
            // Apply recoil to camera with slight randomness
            this.camera.rotation.x += this.recoilAmount * (0.9 + Math.random() * 0.2);
            
            // Recover from recoil smoothly
            this.recoilAmount = Math.max(0, this.recoilAmount - this.recoilRecovery * deltaTime);
        }
    }

    reload() {
        if (this.isReloading || this.currentAmmo === this.maxAmmo || this.reserveAmmo === 0) return;

        this.isReloading = true;
        this.canFire = false;
        
        audioSystem.playReload();
        
        // Visual feedback
        console.log('Rechargement...');

        setTimeout(() => {
            const ammoNeeded = this.maxAmmo - this.currentAmmo;
            const ammoToReload = Math.min(ammoNeeded, this.reserveAmmo);
            
            this.currentAmmo += ammoToReload;
            this.reserveAmmo -= ammoToReload;
            
            this.isReloading = false;
            this.canFire = true;
            
            console.log(`Rechargement terminé! ${this.currentAmmo}/${this.reserveAmmo}`);
        }, this.reloadTime * 1000);
    }

    registerHit() {
        this.shotsHit++;
    }

    getAccuracy() {
        if (this.shotsFired === 0) return 100;
        return Math.round((this.shotsHit / this.shotsFired) * 100);
    }

    update(deltaTime) {
        this.updateRecoil(deltaTime);
    }

    reset() {
        this.currentAmmo = this.maxAmmo;
        this.reserveAmmo = 90;
        this.isReloading = false;
        this.canFire = true;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.recoilAmount = 0;
    }
}
