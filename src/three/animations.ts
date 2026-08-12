import * as THREE from 'three';
import { sceneManager } from './scene';

export interface Animation {
  id: string;
  objectId: string;
  type: 'spin' | 'float' | 'bounce' | 'pulse' | 'orbit' | 'path' | 'fade' | 'scale';
  duration: number;
  delay: number;
  loop: boolean;
  progress: number;
  config: any;
  startTime?: number;
  isPlaying: boolean;
}

export interface SpinConfig {
  speed?: number;
  axis?: 'x' | 'y' | 'z' | 'all';
  direction?: 1 | -1;
}

export interface FloatConfig {
  amplitude?: number;
  speed?: number;
  axis?: 'x' | 'y' | 'z';
  phase?: number;
}

export interface BounceConfig {
  amplitude?: number;
  speed?: number;
  decay?: number;
}

export interface PulseConfig {
  minScale?: number;
  maxScale?: number;
  speed?: number;
}

export interface OrbitConfig {
  radius?: number;
  speed?: number;
  axis?: 'x' | 'y' | 'z';
  center?: { x: number; y: number; z: number };
}

export interface PathConfig {
  points: Array<{ x: number; y: number; z: number }>;
  speed?: number;
  loop?: boolean;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface FadeConfig {
  startOpacity?: number;
  endOpacity?: number;
  speed?: number;
}

export interface ScaleConfig {
  minScale?: number;
  maxScale?: number;
  speed?: number;
  axis?: 'x' | 'y' | 'z' | 'all';
}

class AnimationManager {
  private animations: Map<string, Animation> = new Map();
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  // Easing functions
  private easings = {
    linear: (t: number) => t,
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => 1 - (1 - t) * (1 - t),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    bounce: (t: number) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      else return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
    elastic: (t: number) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
  };

  /**
   * Start animation manager
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animateLoop();
    console.log('▶️ Animation manager started');
  }

  /**
   * Stop animation manager
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('⏹️ Animation manager stopped');
  }

  /**
   * Main animation loop
   */
  private animateLoop(): void {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(() => {
      const time = Date.now() / 1000;

      for (const [id, animation] of this.animations) {
        if (!animation.isPlaying) continue;

        this.updateAnimation(animation, time);
      }

      this.animateLoop();
    });
  }

  /**
   * Update a single animation
   */
  private updateAnimation(animation: Animation, time: number): void {
    if (!animation.startTime) {
      animation.startTime = time;
    }

    const elapsed = time - animation.startTime - animation.delay;
    if (elapsed < 0) return;

    const duration = animation.duration || 1;
    let progress = Math.min(elapsed / duration, 1);

    if (animation.loop) {
      progress = (elapsed % duration) / duration;
    }

    animation.progress = progress;

    // Get object
    const sceneObject = sceneManager.getObject(animation.objectId);
    if (!sceneObject) return;

    const mesh = sceneObject.mesh;

    // Apply animation based on type
    switch (animation.type) {
      case 'spin':
        this.applySpin(mesh, animation, progress);
        break;
      case 'float':
        this.applyFloat(mesh, animation, progress);
        break;
      case 'bounce':
        this.applyBounce(mesh, animation, progress);
        break;
      case 'pulse':
        this.applyPulse(mesh, animation, progress);
        break;
      case 'orbit':
        this.applyOrbit(mesh, animation, progress);
        break;
      case 'path':
        this.applyPath(mesh, animation, progress);
        break;
      case 'fade':
        this.applyFade(mesh, animation, progress);
        break;
      case 'scale':
        this.applyScale(mesh, animation, progress);
        break;
    }

    // Update transform if object is a group
    if (mesh instanceof THREE.Group) {
      // Groups handle their children internally
    }
  }

  /**
   * Apply spin animation
   */
  private applySpin(mesh: THREE.Object3D, animation: Animation, progress: number): void {
    const config = animation.config as SpinConfig;
    const speed = config.speed || 1;
    const angle = progress * 2 * Math.PI * speed * (config.direction || 1);

    if (config.axis === 'x') {
      mesh.rotation.x = angle;
    } else if (config.axis === 'y') {
      mesh.rotation.y = angle;
    } else if (config.axis === 'z') {
      mesh.rotation.z = angle;
    } else {
      mesh.rotation.x = angle;
      mesh.rotation.y = angle * 0.7;
      mesh.rotation.z = angle * 0.3;
    }
  }

  /**
   * Apply float animation
   */
  private applyFloat(mesh: THREE.Object3D, animation: Animation, progress: number): void {
    const config = animation.config as FloatConfig;
    const amplitude = config.amplitude || 0.5;
    const speed = config.speed || 1;
    const phase = config.phase || 0;
    const axis = config.axis || 'y';

    const value = Math.sin(progress * 2 * Math.PI * speed + phase) * amplitude;

    if (axis === 'x') {
      mesh.position.x += value * 0.01;
    } else if (axis === 'y') {
      mesh.position.y += value * 0.01;
    } else if (axis === 'z') {
      mesh.position.z += value * 0.01;
    }
  }

  /**
   * Apply bounce animation
   */
  private applyBounce(mesh: THREE.Object3D, animation: Animation, progress: number): void {
    const config = animation.config as BounceConfig;
    const amplitude = config.amplitude || 1;
    const decay = config.decay || 0.8;

    const bounceProgress = progress * 2;
    if (bounceProgress <= 1) {
      const value = Math.sin(bounceProgress * Math.PI) * amplitude * Math.pow(decay, bounceProgress);
      mesh.position.y = -Math.abs(value);
    }
  }

  /**
   * Apply pulse animation
   */
  private applyPulse(mesh: THREE.Object3D, animation: Animation, progress: number): void {
    const config = animation.config as PulseConfig;
    const minScale = config.minScale || 0.8;
    const maxScale = config.maxScale || 1.2;
    const speed = config.speed || 1;

    const value = minScale + (maxScale - minScale) * (0.5 + 0.5 * Math.sin(progress * 2 * Math.PI * speed));
    mesh.scale.set(value, value, value);
  }

  /**
   * Apply orbit animation
   */
  private applyOrbit(mesh: THREE.Object3D, animation: Animation, progress: number): void {
    const config = animation.config as OrbitConfig;
    const radius = config.radius || 2;
    const speed = config.speed || 1;
    const center = config.center || { x: 0, y: 0, z: 0 };

    const angle = progress * 2 * Math.PI * speed;
    const x = center.x + Math.cos(angle) * radius;
    const z = center.z + Math.sin(angle) * radius;

    mesh.position.x = x;
    mesh.position.z = z;

    // Face direction of movement
    mesh.lookAt(
      center.x + Math.cos(angle + 0.1) * radius,
      center.y,
      center.z + Math.sin(angle + 0.1) * radius
    );
  }

  /**
   * Apply path animation
   */
  private applyPath(mesh: THREE.Object3D, animation: Animation, progress: number): void {
    const config = animation.config as PathConfig;
    const points = config.points || [];
    const speed = config.speed || 1;
    const easing = config.easing || 'linear';

    if (points.length < 2) return;

    // Calculate position along path
    let totalProgress = progress * speed;
    if (config.loop) {
      totalProgress = totalProgress % 1;
    } else {
      totalProgress = Math.min(totalProgress, 1);
    }

    const easedProgress = this.easings[easing](totalProgress);
    const index = easedProgress * (points.length - 1);
    const idx = Math.floor(index);
    const frac = index - idx;

    const p1 = points[idx];
    const p2 = points[Math.min(idx + 1, points.length - 1)];

    if (p1 && p2) {
      mesh.position.x = p1.x + (p2.x - p1.x) * frac;
      mesh.position.y = p1.y + (p2.y - p1.y) * frac;
      mesh.position.z = p1.z + (p2.z - p1.z) * frac;
    }
  }

  /**
   * Apply fade animation
   */
  private applyFade(mesh: THREE.Object3D, animation: Animation, progress: number): void {
    const config = animation.config as FadeConfig;
    const startOpacity = config.startOpacity || 0;
    const endOpacity = config.endOpacity || 1;
    const speed = config.speed || 1;

    const opacity = startOpacity + (endOpacity - startOpacity) * Math.min(progress * speed, 1);

    // Apply to all materials
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          for (const mat of child.material) {
            mat.transparent = true;
            mat.opacity = opacity;
            mat.needsUpdate = true;
          }
        } else if (child.material) {
          child.material.transparent = true;
          child.material.opacity = opacity;
          child.material.needsUpdate = true;
        }
      }
    });
  }

  /**
   * Apply scale animation
   */
  private applyScale(mesh: THREE.Object3D, animation: Animation, progress: number): void {
    const config = animation.config as ScaleConfig;
    const minScale = config.minScale || 0.5;
    const maxScale = config.maxScale || 1.5;
    const speed = config.speed || 1;
    const axis = config.axis || 'all';

    const value = minScale + (maxScale - minScale) * (0.5 + 0.5 * Math.sin(progress * 2 * Math.PI * speed));

    if (axis === 'all') {
      mesh.scale.set(value, value, value);
    } else if (axis === 'x') {
      mesh.scale.x = value;
    } else if (axis === 'y') {
      mesh.scale.y = value;
    } else if (axis === 'z') {
      mesh.scale.z = value;
    }
  }

  /**
   * Create a spin animation
   */
  createSpinAnimation(
    objectId: string,
    config: SpinConfig = {},
    options: {
      duration?: number;
      delay?: number;
      loop?: boolean;
    } = {}
  ): Animation {
    const id = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const animation: Animation = {
      id,
      objectId,
      type: 'spin',
      duration: options.duration || 2,
      delay: options.delay || 0,
      loop: options.loop !== undefined ? options.loop : true,
      progress: 0,
      config,
      isPlaying: true,
    };

    this.animations.set(id, animation);
    return animation;
  }

  /**
   * Create a float animation
   */
  createFloatAnimation(
    objectId: string,
    config: FloatConfig = {},
    options: {
      duration?: number;
      delay?: number;
      loop?: boolean;
    } = {}
  ): Animation {
    const id = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const animation: Animation = {
      id,
      objectId,
      type: 'float',
      duration: options.duration || 3,
      delay: options.delay || 0,
      loop: options.loop !== undefined ? options.loop : true,
      progress: 0,
      config,
      isPlaying: true,
    };

    this.animations.set(id, animation);
    return animation;
  }

  /**
   * Create a bounce animation
   */
  createBounceAnimation(
    objectId: string,
    config: BounceConfig = {},
    options: {
      duration?: number;
      delay?: number;
      loop?: boolean;
    } = {}
  ): Animation {
    const id = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const animation: Animation = {
      id,
      objectId,
      type: 'bounce',
      duration: options.duration || 1,
      delay: options.delay || 0,
      loop: options.loop !== undefined ? options.loop : false,
      progress: 0,
      config,
      isPlaying: true,
    };

    this.animations.set(id, animation);
    return animation;
  }

  /**
   * Create a pulse animation
   */
  createPulseAnimation(
    objectId: string,
    config: PulseConfig = {},
    options: {
      duration?: number;
      delay?: number;
      loop?: boolean;
    } = {}
  ): Animation {
    const id = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const animation: Animation = {
      id,
      objectId,
      type: 'pulse',
      duration: options.duration || 1,
      delay: options.delay || 0,
      loop: options.loop !== undefined ? options.loop : true,
      progress: 0,
      config,
      isPlaying: true,
    };

    this.animations.set(id, animation);
    return animation;
  }

  /**
   * Create an orbit animation
   */
  createOrbitAnimation(
    objectId: string,
    config: OrbitConfig = {},
    options: {
      duration?: number;
      delay?: number;
      loop?: boolean;
    } = {}
  ): Animation {
    const id = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const animation: Animation = {
      id,
      objectId,
      type: 'orbit',
      duration: options.duration || 4,
      delay: options.delay || 0,
      loop: options.loop !== undefined ? options.loop : true,
      progress: 0,
      config,
      isPlaying: true,
    };

    this.animations.set(id, animation);
    return animation;
  }

  /**
   * Create a path animation
   */
  createPathAnimation(
    objectId: string,
    config: PathConfig,
    options: {
      duration?: number;
      delay?: number;
      loop?: boolean;
    } = {}
  ): Animation {
    const id = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const animation: Animation = {
      id,
      objectId,
      type: 'path',
      duration: options.duration || 5,
      delay: options.delay || 0,
      loop: options.loop !== undefined ? options.loop : false,
      progress: 0,
      config,
      isPlaying: true,
    };

    this.animations.set(id, animation);
    return animation;
  }

  /**
   * Create a fade animation
   */
  createFadeAnimation(
    objectId: string,
    config: FadeConfig = {},
    options: {
      duration?: number;
      delay?: number;
      loop?: boolean;
    } = {}
  ): Animation {
    const id = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const animation: Animation = {
      id,
      objectId,
      type: 'fade',
      duration: options.duration || 2,
      delay: options.delay || 0,
      loop: options.loop !== undefined ? options.loop : false,
      progress: 0,
      config,
      isPlaying: true,
    };

    this.animations.set(id, animation);
    return animation;
  }

  /**
   * Create a scale animation
   */
  createScaleAnimation(
    objectId: string,
    config: ScaleConfig = {},
    options: {
      duration?: number;
      delay?: number;
      loop?: boolean;
    } = {}
  ): Animation {
    const id = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const animation: Animation = {
      id,
      objectId,
      type: 'scale',
      duration: options.duration || 2,
      delay: options.delay || 0,
      loop: options.loop !== undefined ? options.loop : true,
      progress: 0,
      config,
      isPlaying: true,
    };

    this.animations.set(id, animation);
    return animation;
  }

  /**
   * Stop an animation
   */
  stopAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.isPlaying = false;
    }
  }

  /**
   * Start an animation
   */
  startAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.isPlaying = true;
      animation.startTime = undefined;
    }
  }

  /**
   * Remove an animation
   */
  removeAnimation(id: string): void {
    this.animations.delete(id);
  }

  /**
   * Get all animations
   */
  getAllAnimations(): Animation[] {
    return Array.from(this.animations.values());
  }

  /**
   * Get animations for an object
   */
  getAnimationsForObject(objectId: string): Animation[] {
    return Array.from(this.animations.values()).filter(a => a.objectId === objectId);
  }

  /**
   * Clear all animations
   */
  clearAll(): void {
    this.animations.clear();
  }

  /**
   * Stop all animations
   */
  stopAll(): void {
    for (const [id] of this.animations) {
      this.stopAnimation(id);
    }
  }

  /**
   * Start all animations
   */
  startAll(): void {
    for (const [id] of this.animations) {
      this.startAnimation(id);
    }
  }
}

// Export singleton instance
export const animationManager = new AnimationManager();
export default animationManager;