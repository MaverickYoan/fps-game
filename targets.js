// Target System
class TargetManager {
    constructor(scene, effectsSystem) {
        this.scene = scene;
        this.effectsSystem = effectsSystem;
        this.targets = [];
        this.maxTargets = 20; // Increased from 10 to 20
        this.targetsDestroyed = 0;
        this.score = 0;
        
        // Arena bounds for spawning - closer to player and more spread out
        this.spawnBounds = {
            x: { min: -12, max: 12 },
            y: { min: 1.5, max: 3.5 },
            z: { min: -18, max: -8 }
        };
    }

    createTarget(position) {
        // Create target geometry - larger sphere for easier hitting
        const geometry = new THREE.SphereGeometry(0.7, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff3333,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
            metalness: 0.5,
            roughness: 0.5
        });
        
        const target = new THREE.Mesh(geometry, material);
        target.position.copy(position);
        
        // Add target properties
        target.health = 100;
        target.maxHealth = 100;
        target.isTarget = true;
        target.scoreValue = 100;
        
        // Add glow ring - adjusted for larger target
        const ringGeometry = new THREE.TorusGeometry(0.85, 0.08, 8, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        target.add(ring);
        target.ring = ring;
        
        this.scene.add(target);
        this.targets.push(target);
        
        return target;
    }

    spawnTargets(count) {
        for (let i = 0; i < count; i++) {
            const position = new THREE.Vector3(
                this.randomInRange(this.spawnBounds.x.min, this.spawnBounds.x.max),
                this.randomInRange(this.spawnBounds.y.min, this.spawnBounds.y.max),
                this.randomInRange(this.spawnBounds.z.min, this.spawnBounds.z.max)
            );
            
            this.createTarget(position);
        }
    }

    randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    checkHit(raycaster, damage) {
        const intersects = raycaster.intersectObjects(this.targets, true);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            let target = hit.object;
            
            // Get the parent target if we hit the ring
            if (!target.isTarget && target.parent && target.parent.isTarget) {
                target = target.parent;
            }
            
            if (target.isTarget) {
                this.damageTarget(target, damage, hit.point);
                return true;
            }
        }
        
        return false;
    }

    damageTarget(target, damage, hitPoint) {
        target.health -= damage;
        
        // Visual feedback - flash white then back
        const originalColor = target.material.color.clone();
        const originalEmissive = target.material.emissive.clone();
        
        target.material.color.setHex(0xffffff);
        target.material.emissive.setHex(0xffffff);
        target.material.emissiveIntensity = 1.0;
        
        setTimeout(() => {
            if (target.parent) {
                target.material.color.copy(originalColor);
                target.material.emissive.copy(originalEmissive);
                target.material.emissiveIntensity = 0.5;
            }
        }, 80);
        
        // Hit particles - more intense
        this.effectsSystem.createHitParticles(hitPoint, 0xff3333);
        
        // Play hit sound
        audioSystem.playHit();
        
        // Show damage number (console for now)
        console.log(`💥 Hit! -${damage} HP (${target.health}/${target.maxHealth})`);
        
        // Check if destroyed
        if (target.health <= 0) {
            this.destroyTarget(target);
        }
    }

    destroyTarget(target) {
        // Update stats
        this.targetsDestroyed++;
        this.score += target.scoreValue;
        
        // Explosion effect - more particles
        this.effectsSystem.createTargetDestroyEffect(target.position);
        audioSystem.playTargetDestroy();
        
        // Console feedback
        console.log(`🎯 Target destroyed! +${target.scoreValue} points (Total: ${this.score})`);
        
        // Remove from scene
        this.scene.remove(target);
        target.geometry.dispose();
        target.material.dispose();
        
        if (target.ring) {
            target.ring.geometry.dispose();
            target.ring.material.dispose();
        }
        
        // Remove from array
        const index = this.targets.indexOf(target);
        if (index > -1) {
            this.targets.splice(index, 1);
        }
        
        // Respawn a new target after a short delay
        setTimeout(() => {
            this.respawnTarget();
        }, 500);
    }

    respawnTarget() {
        if (this.targets.length < this.maxTargets) {
            const position = new THREE.Vector3(
                this.randomInRange(this.spawnBounds.x.min, this.spawnBounds.x.max),
                this.randomInRange(this.spawnBounds.y.min, this.spawnBounds.y.max),
                this.randomInRange(this.spawnBounds.z.min, this.spawnBounds.z.max)
            );
            
            this.createTarget(position);
        }
    }

    update(deltaTime) {
        // Animate targets - rotate rings
        for (const target of this.targets) {
            if (target.ring) {
                target.ring.rotation.z += deltaTime;
            }
            
            // Subtle floating animation
            target.position.y += Math.sin(Date.now() / 1000 + target.position.x) * 0.001;
        }
    }

    reset() {
        // Remove all targets
        for (const target of this.targets) {
            this.scene.remove(target);
            target.geometry.dispose();
            target.material.dispose();
            
            if (target.ring) {
                target.ring.geometry.dispose();
                target.ring.material.dispose();
            }
        }
        
        this.targets = [];
        this.targetsDestroyed = 0;
        this.score = 0;
        
        // Spawn initial targets
        this.spawnTargets(this.maxTargets);
    }

    getActiveTargetCount() {
        return this.targets.length;
    }
}
