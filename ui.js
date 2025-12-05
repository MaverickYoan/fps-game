// UI Controller
class UIController {
    constructor() {
        // Menu elements
        this.startMenu = document.getElementById('startMenu');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.gameOverMenu = document.getElementById('gameOverMenu');
        this.hud = document.getElementById('hud');
        
        // HUD elements
        this.scoreElement = document.getElementById('score');
        this.targetsElement = document.getElementById('targets');
        this.accuracyElement = document.getElementById('accuracy');
        this.healthBar = document.getElementById('healthBar');
        this.healthValue = document.getElementById('healthValue');
        this.ammoElement = document.getElementById('ammo');
        this.ammoReserveElement = document.getElementById('ammoReserve');
        this.hitMarker = document.getElementById('hitMarker');
        
        // Buttons
        this.startButton = document.getElementById('startButton');
        this.resumeButton = document.getElementById('resumeButton');
        this.restartButton = document.getElementById('restartButton');
        this.mainMenuButton = document.getElementById('mainMenuButton');
        this.playAgainButton = document.getElementById('playAgainButton');
        
        // State
        this.isPaused = false;
    }

    showStartMenu() {
        this.startMenu.classList.remove('hidden');
        this.pauseMenu.classList.add('hidden');
        this.gameOverMenu.classList.add('hidden');
        this.hud.classList.add('hidden');
    }

    showGame() {
        this.startMenu.classList.add('hidden');
        this.pauseMenu.classList.add('hidden');
        this.gameOverMenu.classList.add('hidden');
        this.hud.classList.remove('hidden');
    }

    showPauseMenu() {
        this.pauseMenu.classList.remove('hidden');
        this.isPaused = true;
    }

    hidePauseMenu() {
        this.pauseMenu.classList.add('hidden');
        this.isPaused = false;
    }

    showGameOver(stats) {
        this.hud.classList.add('hidden');
        this.gameOverMenu.classList.remove('hidden');
        
        const finalStats = document.getElementById('finalStats');
        finalStats.innerHTML = `
            <div><strong>Score Final:</strong> ${stats.score}</div>
            <div><strong>Cibles Détruites:</strong> ${stats.targetsDestroyed}</div>
            <div><strong>Précision:</strong> ${stats.accuracy}%</div>
            <div><strong>Tirs Effectués:</strong> ${stats.shotsFired}</div>
            <div><strong>Tirs Réussis:</strong> ${stats.shotsHit}</div>
        `;
    }

    updateScore(score) {
        this.scoreElement.textContent = score;
    }

    updateTargets(current, max) {
        this.targetsElement.textContent = `${current}/${max}`;
    }

    updateAccuracy(accuracy) {
        this.accuracyElement.textContent = `${accuracy}%`;
    }

    updateHealth(health, maxHealth) {
        const percentage = (health / maxHealth) * 100;
        this.healthBar.style.width = `${percentage}%`;
        this.healthValue.textContent = Math.max(0, Math.round(health));
        
        // Change color based on health
        if (percentage > 60) {
            this.healthBar.style.background = 'linear-gradient(90deg, #33ff33, #66ff66)';
        } else if (percentage > 30) {
            this.healthBar.style.background = 'linear-gradient(90deg, #ffaa33, #ffcc66)';
        } else {
            this.healthBar.style.background = 'linear-gradient(90deg, #ff3333, #ff6666)';
        }
    }

    updateAmmo(current, reserve) {
        this.ammoElement.textContent = current;
        this.ammoReserveElement.textContent = reserve;
        
        // Change color if low on ammo
        if (current <= 5) {
            this.ammoElement.style.color = '#ff3333';
        } else {
            this.ammoElement.style.color = '#ffd93d';
        }
    }

    showHitMarker() {
        this.hitMarker.classList.remove('hidden');
        
        // Trigger animation
        const lines = this.hitMarker.querySelectorAll('.hit-line');
        lines.forEach(line => {
            line.style.animation = 'none';
            setTimeout(() => {
                line.style.animation = 'hitMarkerAnim 0.2s ease-out';
            }, 10);
        });
        
        setTimeout(() => {
            this.hitMarker.classList.add('hidden');
        }, 200);
    }

    showReloadingIndicator() {
        // Pulsing animation for ammo during reload
        this.ammoElement.style.color = '#ff9933';
        this.ammoElement.style.animation = 'pulse 0.5s infinite';
        this.ammoElement.textContent = 'R';
    }

    hideReloadingIndicator() {
        this.ammoElement.style.color = '#ffd93d';
        this.ammoElement.style.animation = 'none';
    }
}
