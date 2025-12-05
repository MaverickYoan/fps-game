// Visual Effects System
class EffectsSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.muzzleFlash = null;
        this.createMuzzleFlash();
    }

    createMuzzleFlash() {
        // Create muzzle flash geometry - smaller size
        const geometry = new THREE.SphereGeometry(0.08, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0
        });
        this.muzzleFlash = new THREE.Mesh(geometry, material);
        this.scene.add(this.muzzleFlash);
    }

    showMuzzleFlash(position, direction) {
        // Position muzzle flash in front of camera
        this.muzzleFlash.position.copy(position);
        this.muzzleFlash.position.add(direction.multiplyScalar(0.5));
        
        // Animate flash
        this.muzzleFlash.material.opacity = 1;
        this.muzzleFlash.scale.set(1, 1, 1);
        
        setTimeout(() => {
            this.muzzleFlash.material.opacity = 0;
        }, 50);
    }

    createHitParticles(position, color = 0xff0000) {
        const particleCount = 15; // More particles
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.06, 4, 4);
            const material = new THREE.MeshBasicMaterial({ color: color });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.copy(position);
            
            // Random velocity with more spread
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
            );
            
            particle.lifetime = 0.6;
            particle.age = 0;
            
            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    createTargetDestroyEffect(position) {
        const particleCount = 40; // More explosion particles
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.BoxGeometry(0.12, 0.12, 0.12);
            const material = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 1, 0.5)
            });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.copy(position);
            
            // Random velocity in all directions with more force
            const speed = 0.4;
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speed,
                Math.random() * speed * 0.8,
                (Math.random() - 0.5) * speed
            );
            
            particle.rotationSpeed = new THREE.Vector3(
                Math.random() * 0.2,
                Math.random() * 0.2,
                Math.random() * 0.2
            );
            
            particle.lifetime = 1.0;
            particle.age = 0;
            
            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    update(deltaTime) {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.age += deltaTime;
            
            if (particle.age >= particle.lifetime) {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }
            
            // Update position
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            
            // Apply gravity
            particle.velocity.y -= 9.8 * deltaTime;
            
            // Rotation
            if (particle.rotationSpeed) {
                particle.rotation.x += particle.rotationSpeed.x;
                particle.rotation.y += particle.rotationSpeed.y;
                particle.rotation.z += particle.rotationSpeed.z;
            }
            
            // Fade out
            const lifeRatio = particle.age / particle.lifetime;
            particle.material.opacity = 1 - lifeRatio;
            particle.material.transparent = true;
        }
    }

    screenShake(camera, intensity = 0.1, duration = 0.1) {
        const originalPosition = camera.position.clone();
        const shakeStart = Date.now();
        
        const shake = () => {
            const elapsed = (Date.now() - shakeStart) / 1000;
            
            if (elapsed < duration) {
                const factor = 1 - (elapsed / duration);
                camera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity * factor;
                camera.position.y = originalPosition.y + (Math.random() - 0.5) * intensity * factor;
                
                requestAnimationFrame(shake);
            } else {
                camera.position.copy(originalPosition);
            }
        };
        
        shake();
    }
}
