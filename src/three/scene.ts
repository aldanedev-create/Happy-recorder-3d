import * as THREE from 'three';

export interface SceneConfig {
  backgroundColor?: string;
  fogColor?: string;
  fogDensity?: number;
  ambientLightColor?: string;
  ambientLightIntensity?: number;
  directionalLightColor?: string;
  directionalLightIntensity?: number;
  useBloom?: boolean;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
}

export interface SceneObject {
  id: string;
  mesh: THREE.Object3D;
  type: 'mesh' | 'group' | 'points' | 'sprite';
  visible: boolean;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  userData: any;
}

class SceneManager {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: { update: () => void; autoRotate: boolean; autoRotateSpeed: number } | null = null;
  private objects: Map<string, SceneObject> = new Map();
  private animationId: number | null = null;
  private isInitialized: boolean = false;
  private isHeadless: boolean = false;
  private container: HTMLElement | null = null;
  private config: SceneConfig = {
    backgroundColor: '#0a0a1a',
    fogColor: '#0a0a1a',
    fogDensity: 0.002,
    ambientLightColor: '#404060',
    ambientLightIntensity: 0.5,
    directionalLightColor: '#ffffff',
    directionalLightIntensity: 1.0,
    useBloom: true,
    bloomStrength: 0.3,
    bloomRadius: 0.5,
    bloomThreshold: 0.1,
  };

  // Callbacks
  private onRenderCallbacks: ((time: number) => void)[] = [];

  /**
   * Initialize the Three.js scene
   */
  initialize(container: HTMLElement, config?: Partial<SceneConfig>): void {
    if (this.isInitialized) {
      console.warn('Scene already initialized');
      return;
    }

    this.container = container;

    // Merge config
    if (config) {
      this.config = { ...this.config, ...config };
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor!);
    this.scene.fog = new THREE.FogExp2(
      this.config.fogColor!,
      this.config.fogDensity!
    );

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 30);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);

    // React Native Windows has no supported DOM control or post-processing
    // canvas. Rendering uses the platform renderer when one is available.

    // Lighting
    this.setupLighting();

    // Resize handler
    this.setupResizeHandler();

    this.isInitialized = true;
    console.log('🎬 Three.js Scene initialized');
  }

  /**
   * Initialize scene data on platforms without a DOM/WebGL canvas, including
   * React Native Windows. Objects and animations remain available to the UI
   * while a platform renderer can be added later.
   */
  initializeHeadless(config?: Partial<SceneConfig>): void {
    if (this.isInitialized) return;
    if (config) this.config = { ...this.config, ...config };
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor!);
    this.setupLighting();
    this.isHeadless = true;
    this.isInitialized = true;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Setup lighting
   */
  private setupLighting(): void {
    if (!this.scene) return;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      this.config.ambientLightColor!,
      this.config.ambientLightIntensity!
    );
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
      this.config.directionalLightColor!,
      this.config.directionalLightIntensity!
    );
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = false;
    this.scene.add(directionalLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight('#4040ff', 0.3);
    fillLight.position.set(-10, 0, 10);
    this.scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight('#ff6b6b', 0.2);
    rimLight.position.set(0, -10, -10);
    this.scene.add(rimLight);
  }

  /**
   * Setup resize handler
   */
  private setupResizeHandler(): void {
    const handleResize = () => {
      if (!this.container || !this.camera || !this.renderer) return;

      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);

    };

    window.addEventListener('resize', handleResize);
  }

  /**
   * Add an object to the scene
   */
  addObject(
    id: string,
    mesh: THREE.Object3D,
    position?: THREE.Vector3,
    rotation?: THREE.Euler,
    scale?: THREE.Vector3
  ): SceneObject {
    if (!this.scene) {
      throw new Error('Scene not initialized');
    }

    const type = mesh instanceof THREE.Mesh
      ? 'mesh'
      : mesh instanceof THREE.Group
        ? 'group'
        : mesh instanceof THREE.Points
          ? 'points'
          : 'sprite';

    const sceneObject: SceneObject = {
      id,
      mesh,
      type: type as any,
      visible: true,
      position: position || new THREE.Vector3(0, 0, 0),
      rotation: rotation || new THREE.Euler(0, 0, 0),
      scale: scale || new THREE.Vector3(1, 1, 1),
      userData: {},
    };

    // Set initial transform
    mesh.position.copy(sceneObject.position);
    mesh.rotation.copy(sceneObject.rotation);
    mesh.scale.copy(sceneObject.scale);

    this.scene.add(mesh);
    this.objects.set(id, sceneObject);

    return sceneObject;
  }

  /**
   * Remove an object from the scene
   */
  removeObject(id: string): void {
    const sceneObject = this.objects.get(id);
    if (!sceneObject) return;

    if (this.scene) {
      this.scene.remove(sceneObject.mesh);
    }

    // Dispose geometry and materials
    if (sceneObject.mesh instanceof THREE.Mesh) {
      sceneObject.mesh.geometry.dispose();
      if (Array.isArray(sceneObject.mesh.material)) {
        sceneObject.mesh.material.forEach(m => m.dispose());
      } else if (sceneObject.mesh.material) {
        sceneObject.mesh.material.dispose();
      }
    }

    this.objects.delete(id);
  }

  /**
   * Get an object by ID
   */
  getObject(id: string): SceneObject | null {
    return this.objects.get(id) || null;
  }

  /**
   * Update object transform
   */
  updateObjectTransform(
    id: string,
    position?: THREE.Vector3,
    rotation?: THREE.Euler,
    scale?: THREE.Vector3
  ): void {
    const sceneObject = this.objects.get(id);
    if (!sceneObject) return;

    if (position) {
      sceneObject.position.copy(position);
      sceneObject.mesh.position.copy(position);
    }
    if (rotation) {
      sceneObject.rotation.copy(rotation);
      sceneObject.mesh.rotation.copy(rotation);
    }
    if (scale) {
      sceneObject.scale.copy(scale);
      sceneObject.mesh.scale.copy(scale);
    }
  }

  /**
   * Show/hide an object
   */
  setObjectVisibility(id: string, visible: boolean): void {
    const sceneObject = this.objects.get(id);
    if (!sceneObject) return;

    sceneObject.visible = visible;
    sceneObject.mesh.visible = visible;
  }

  /**
   * Register render callback
   */
  onRender(callback: (time: number) => void): void {
    this.onRenderCallbacks.push(callback);
  }

  /**
   * Start the render loop
   */
  startRenderLoop(): void {
    if (!this.isInitialized) {
      console.warn('Scene not initialized');
      return;
    }

    if (this.isHeadless || this.animationId) {
      console.warn('Render loop already running');
      return;
    }

    const animate = (time: number) => {
      this.animationId = requestAnimationFrame(animate);

      // Update controls
      if (this.controls) {
        this.controls.update();
      }

      // Call render callbacks
      for (const callback of this.onRenderCallbacks) {
        callback(time);
      }

      // Render
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate(0);
    console.log('▶️ Render loop started');
  }

  /**
   * Stop the render loop
   */
  stopRenderLoop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      console.log('⏹️ Render loop stopped');
    }
  }

  /**
   * Get the scene
   */
  getScene(): THREE.Scene | null {
    return this.scene;
  }

  /**
   * Get the camera
   */
  getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }

  /**
   * Get the renderer
   */
  getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  /**
   * Get all objects
   */
  getAllObjects(): SceneObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopRenderLoop();

    // Dispose all objects
    for (const [id] of this.objects) {
      this.removeObject(id);
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
    }

    // Clear scene
    if (this.scene) {
      this.scene = null;
    }

    // Clear callbacks
    this.onRenderCallbacks = [];

    this.isInitialized = false;
    this.isHeadless = false;
    console.log('🧹 Scene disposed');
  }

  /**
   * Create a screenshot
   */
  captureScreenshot(): string | null {
    if (!this.renderer) return null;

    // Render a frame
    if (this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    // Capture
    const dataURL = this.renderer.domElement.toDataURL('image/png');
    return dataURL;
  }

  /**
   * Set auto-rotate
   */
  setAutoRotate(enabled: boolean, speed?: number): void {
    if (!this.controls) return;
    this.controls.autoRotate = enabled;
    if (speed !== undefined) {
      this.controls.autoRotateSpeed = speed;
    }
  }

  /**
   * Set camera position
   */
  setCameraPosition(x: number, y: number, z: number): void {
    if (!this.camera) return;
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Set bloom settings
   */
  setBloom(enabled: boolean, strength?: number): void {
    // Bloom requires a platform-native post-processing renderer. Keep this
    // API stable while the Windows renderer is implemented.
    void enabled;
    void strength;
  }
}

// Export singleton instance
export const sceneManager = new SceneManager();
export default sceneManager;
