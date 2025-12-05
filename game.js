// Main Game Controller
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Game systems
        this.ui = new UIController();
        this.player = null;
        this.weapon = null;
        this.targetManager = null;
        this.environment = null;
        this.effectsSystem = null;
        
        // Game state
        this.isRunning = false;
        this.isGameOver = false;
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        this.scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;

        // Initialize audio
        audioSystem.init();

        // Show start menu
        this.ui.showStartMenu();
    }

    setupEventListeners() {
        // Start button
        this.ui.startButton.addEventListener('click', () => {
            this.startGame();
        });

        // Resume button
        this.ui.resumeButton.addEventListener('click', () => {
            this.resumeGame();
        });

        // Restart button
        this.ui.restartButton.addEventListener('click', () => {
            this.restartGame();
        });

        // Main menu button
        this.ui.mainMenuButton.addEventListener('click', () => {
            this.returnToMainMenu();
        });

        // Play again button
        this.ui.playAgainButton.addEventListener('click', () => {
            this.restartGame();
        });

        // ESC to pause
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.isRunning && !this.isGameOver) {
                if (this.ui.isPaused) {
                    this.resumeGame();
                } else {
                    this.pauseGame();
                }
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Pointer lock (optional)
        document.body.addEventListener('click', () => {
            if (this.isRunning && !this.ui.isPaused && !document.pointerLockElement) {
                // Try to request pointer lock, but don't fail if it doesn't work
                document.body.requestPointerLock().catch(() => {
                    console.log('Pointer lock not available, using fallback controls');
                });
            }
        });

        document.addEventListener('pointerlockchange', () => {
            // Just log the change, don't pause the game
            if (document.pointerLockElement) {
                console.log('Pointer lock enabled');
            } else {
                console.log('Pointer lock disabled - use right-click to look around');
            }
        });
    }

    startGame() {
        // Initialize game systems
        this.effectsSystem = new EffectsSystem(this.scene);
        this.environment = new Environment(this.scene);
        this.player = new Player(this.camera, this.scene);
        this.targetManager = new TargetManager(this.scene, this.effectsSystem);
        this.weapon = new Weapon(this.camera, this.scene, this.effectsSystem, this.targetManager, this.ui);

        // Spawn initial targets - increased to 20
        this.targetManager.spawnTargets(20);

        // Start game
        this.isRunning = true;
        this.isGameOver = false;
        this.ui.showGame();

        // Start game loop
        this.clock.start();
        this.gameLoop();
    }

    pauseGame() {
        this.ui.showPauseMenu();
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    resumeGame() {
        this.ui.hidePauseMenu();
        this.ui.showGame();
    }

    restartGame() {
        // Reset all systems
        this.player.reset();
        this.weapon.reset();
        this.targetManager.reset();
        
        this.isGameOver = false;
        this.isRunning = true;
        
        this.ui.showGame();
        
        this.clock.start();
        this.gameLoop();
    }

    returnToMainMenu() {
        // Stop the game
        this.isRunning = false;
        this.isGameOver = false;
        this.ui.isPaused = false;
        
        // Exit pointer lock if active
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        
        // Clean up game objects if they exist
        if (this.targetManager) {
            // Remove all targets from scene
            for (const target of this.targetManager.targets) {
                this.scene.remove(target);
                target.geometry.dispose();
                target.material.dispose();
                if (target.ring) {
                    target.ring.geometry.dispose();
                    target.ring.material.dispose();
                }
            }
        }
        
        // Show start menu
        this.ui.showStartMenu();
    }

    gameLoop() {
        if (!this.isRunning || this.ui.isPaused) {
            if (this.isRunning) {
                requestAnimationFrame(() => this.gameLoop());
            }
            return;
        }

        const deltaTime = this.clock.getDelta();

        // Update game systems
        this.player.update(deltaTime, this.environment.getCollisionObjects());
        this.weapon.update(deltaTime);
        this.targetManager.update(deltaTime);
        this.effectsSystem.update(deltaTime);

        // Update UI
        this.updateUI();

        // Check game over
        if (this.player.health <= 0 && !this.isGameOver) {
            this.endGame();
        }

        // Render
        this.renderer.render(this.scene, this.camera);

        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }

    updateUI() {
        this.ui.updateScore(this.targetManager.score);
        this.ui.updateTargets(
            this.targetManager.getActiveTargetCount(),
            this.targetManager.maxTargets
        );
        this.ui.updateAccuracy(this.weapon.getAccuracy());
        this.ui.updateHealth(this.player.health, this.player.maxHealth);
        this.ui.updateAmmo(this.weapon.currentAmmo, this.weapon.reserveAmmo);
        
        // Show reloading indicator
        if (this.weapon.isReloading) {
            this.ui.showReloadingIndicator();
        } else {
            this.ui.hideReloadingIndicator();
        }
    }

    endGame() {
        this.isGameOver = true;
        this.isRunning = false;
        
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        
        const stats = {
            score: this.targetManager.score,
            targetsDestroyed: this.targetManager.targetsDestroyed,
            accuracy: this.weapon.getAccuracy(),
            shotsFired: this.weapon.shotsFired,
            shotsHit: this.weapon.shotsHit
        };
        
        this.ui.showGameOver(stats);
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    const game = new Game();
});
