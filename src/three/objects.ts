import * as THREE from 'three';
import { sceneManager } from './scene';
import { animationManager } from './animations';

export interface ObjectConfig {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  color?: string;
  opacity?: number;
  wireframe?: boolean;
  emissive?: string;
  emissiveIntensity?: number;
}

export interface CubeConfig extends ObjectConfig {
  width?: number;
  height?: number;
  depth?: number;
  rounded?: boolean;
  radius?: number;
}

export interface SphereConfig extends ObjectConfig {
  radius?: number;
  widthSegments?: number;
  heightSegments?: number;
}

export interface TextConfig extends ObjectConfig {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export interface DeviceConfig extends ObjectConfig {
  type: 'laptop' | 'monitor' | 'phone' | 'tablet';
  width?: number;
  height?: number;
  depth?: number;
  screenColor?: string;
  frameColor?: string;
}

export interface NetworkNodeConfig extends ObjectConfig {
  label?: string;
  radius?: number;
  color?: string;
  connections?: string[];
}

class ObjectFactory {
  private geometryCache: Map<string, THREE.BufferGeometry> = new Map();
  private materialCache: Map<string, THREE.Material> = new Map();

  /**
   * Create a cube
   */
  createCube(id: string, config: CubeConfig = {}): THREE.Mesh {
    const width = config.width || 1;
    const height = config.height || 1;
    const depth = config.depth || 1;

    // Use rounded box if specified
    let geometry: THREE.BufferGeometry;
    if (config.rounded && config.radius) {
      // Use BoxGeometry with bevel (rounded corners)
      // For simplicity, we'll use regular BoxGeometry with slight modifications
      geometry = new THREE.BoxGeometry(width, height, depth);
    } else {
      geometry = new THREE.BoxGeometry(width, height, depth);
    }

    const material = this.createMaterial(config);
    const mesh = new THREE.Mesh(geometry, material);

    // Apply transforms
    if (config.position) {
      mesh.position.set(config.position.x, config.position.y, config.position.z);
    }
    if (config.rotation) {
      mesh.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
    }
    if (config.scale) {
      mesh.scale.set(config.scale.x, config.scale.y, config.scale.z);
    }

    // Add to scene
    sceneManager.addObject(id, mesh);

    return mesh;
  }

  /**
   * Create a sphere
   */
  createSphere(id: string, config: SphereConfig = {}): THREE.Mesh {
    const radius = config.radius || 1;
    const widthSegments = config.widthSegments || 32;
    const heightSegments = config.heightSegments || 32;

    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = this.createMaterial(config);
    const mesh = new THREE.Mesh(geometry, material);

    this.applyTransform(mesh, config);
    sceneManager.addObject(id, mesh);

    return mesh;
  }

  /**
   * Create a torus (donut shape)
   */
  createTorus(
    id: string,
    config: {
      radius?: number;
      tube?: number;
      radialSegments?: number;
      tubularSegments?: number;
    } & ObjectConfig = {}
  ): THREE.Mesh {
    const radius = config.radius || 1;
    const tube = config.tube || 0.3;
    const radialSegments = config.radialSegments || 16;
    const tubularSegments = config.tubularSegments || 64;

    const geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
    const material = this.createMaterial(config);
    const mesh = new THREE.Mesh(geometry, material);

    this.applyTransform(mesh, config);
    sceneManager.addObject(id, mesh);

    return mesh;
  }

  /**
   * Create a pyramid (cone with 4 sides)
   */
  createPyramid(id: string, config: ObjectConfig = {}): THREE.Mesh {
    // Use ConeGeometry with 4 segments
    const geometry = new THREE.ConeGeometry(1, 1.5, 4);
    const material = this.createMaterial(config);
    const mesh = new THREE.Mesh(geometry, material);

    this.applyTransform(mesh, config);
    sceneManager.addObject(id, mesh);

    return mesh;
  }

  /**
   * Create 3D text (using TextGeometry or simple fallback)
   */
  createText(id: string, config: TextConfig): THREE.Group {
    const group = new THREE.Group();

    // For simplicity, use a fallback with box geometries
    // In production, use TextGeometry from three/examples
    const fontSize = config.fontSize || 1;
    const text = config.text || '';

    // Simple fallback: create a box for each character
    // This is a simplified version - real 3D text requires TextGeometry
    const charWidth = fontSize * 0.6;
    const totalWidth = text.length * charWidth;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const box = new THREE.BoxGeometry(fontSize * 0.5, fontSize * 0.8, fontSize * 0.3);
      const material = new THREE.MeshStandardMaterial({
        color: config.color || '#6c63ff',
        emissive: config.emissive || '#6c63ff',
        emissiveIntensity: config.emissiveIntensity || 0.1,
        transparent: config.opacity !== undefined,
        opacity: config.opacity || 1,
      });
      const mesh = new THREE.Mesh(box, material);
      mesh.position.x = i * charWidth - totalWidth / 2;
      mesh.position.y = 0;
      mesh.position.z = 0;
      group.add(mesh);
    }

    this.applyTransform(group, config);
    sceneManager.addObject(id, group);

    return group;
  }

  /**
   * Create a device (laptop, monitor, phone, etc.)
   */
  createDevice(id: string, config: DeviceConfig): THREE.Group {
    const group = new THREE.Group();
    const width = config.width || 2;
    const height = config.height || 1.5;
    const depth = config.depth || 0.2;

    // Frame
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: config.frameColor || '#2a2a3a',
      metalness: 0.8,
      roughness: 0.2,
    });

    // Screen
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: config.screenColor || '#1a1a2e',
      emissive: config.screenColor || '#1a1a2e',
      emissiveIntensity: 0.3,
    });

    if (config.type === 'laptop') {
      // Base
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(width, depth, height * 0.8),
        frameMaterial
      );
      base.position.y = -height * 0.4;
      group.add(base);

      // Screen
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.9, height * 0.7, depth * 0.5),
        screenMaterial
      );
      screen.position.y = height * 0.1;
      screen.position.z = -depth * 0.2;
      group.add(screen);

      // Lid
      const lid = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.95, height * 0.8, depth * 0.3),
        frameMaterial
      );
      lid.position.y = height * 0.1;
      lid.position.z = -depth * 0.3;
      group.add(lid);

    } else if (config.type === 'monitor') {
      // Stand
      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, 0.5, 8),
        frameMaterial
      );
      stand.position.y = -height * 0.5;
      group.add(stand);

      // Screen body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        frameMaterial
      );
      group.add(body);

      // Screen
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.9, height * 0.9, depth * 0.3),
        screenMaterial
      );
      screen.position.z = depth * 0.1;
      group.add(screen);

    } else if (config.type === 'phone') {
      // Body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        frameMaterial
      );
      body.position.z = 0;
      group.add(body);

      // Screen
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.9, height * 0.93, depth * 0.1),
        screenMaterial
      );
      screen.position.z = depth * 0.1;
      group.add(screen);

      // Camera bump
      const cameraBump = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshStandardMaterial({ color: '#1a1a2e' })
      );
      cameraBump.position.set(0, height * 0.4, depth * 0.2);
      group.add(cameraBump);
    }

    this.applyTransform(group, config);
    sceneManager.addObject(id, group);

    return group;
  }

  /**
   * Create a network node
   */
  createNetworkNode(id: string, config: NetworkNodeConfig): THREE.Group {
    const group = new THREE.Group();
    const radius = config.radius || 0.3;
    const color = config.color || '#6c63ff';

    // Sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 16, 16),
      new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        metalness: 0.3,
        roughness: 0.4,
      })
    );
    group.add(sphere);

    // Glow ring
    const glow = new THREE.Mesh(
      new THREE.RingGeometry(radius * 1.2, radius * 1.6, 32),
      new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      })
    );
    glow.rotation.x = Math.PI / 2;
    group.add(glow);

    // Label (if provided)
    if (config.label) {
      // In a real implementation, use CSS2DRenderer or Sprite
      // For now, we'll add a small indicator
      const labelIndicator = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshStandardMaterial({ color: '#ffffff' })
      );
      labelIndicator.position.y = radius * 1.5;
      group.add(labelIndicator);
    }

    this.applyTransform(group, config);
    sceneManager.addObject(id, group);

    return group;
  }

  /**
   * Create an arrow
   */
  createArrow(
    id: string,
    config: {
      from?: { x: number; y: number; z: number };
      to?: { x: number; y: number; z: number };
      length?: number;
      color?: string;
      thickness?: number;
    } & ObjectConfig = {}
  ): THREE.Group {
    const group = new THREE.Group();
    const color = config.color || '#ff6b6b';
    const thickness = config.thickness || 0.05;
    const length = config.length || 2;

    // Arrow shaft
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(thickness * 0.5, thickness * 0.5, length * 0.7, 8),
      new THREE.MeshStandardMaterial({ color })
    );
    shaft.position.y = length * 0.35;
    group.add(shaft);

    // Arrow head
    const head = new THREE.Mesh(
      new THREE.ConeGeometry(thickness * 2, thickness * 4, 8),
      new THREE.MeshStandardMaterial({ color })
    );
    head.position.y = length * 0.7;
    group.add(head);

    this.applyTransform(group, config);
    sceneManager.addObject(id, group);

    return group;
  }

  /**
   * Create a particle system
   */
  createParticles(
    id: string,
    config: {
      count?: number;
      spread?: number;
      color?: string;
      size?: number;
      opacity?: number;
    } = {}
  ): THREE.Points {
    const count = config.count || 500;
    const spread = config.spread || 20;
    const color = new THREE.Color(config.color || '#6c63ff');
    const size = config.size || 0.1;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

      const variation = 0.5 + Math.random() * 0.5;
      colors[i * 3] = color.r * variation;
      colors[i * 3 + 1] = color.g * variation;
      colors[i * 3 + 2] = color.b * variation;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: size,
      vertexColors: true,
      transparent: true,
      opacity: config.opacity || 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    sceneManager.addObject(id, points);

    return points;
  }

  /**
   * Create a connection line between two points
   */
  createConnection(
    id: string,
    from: { x: number; y: number; z: number },
    to: { x: number; y: number; z: number },
    config: {
      color?: string;
      thickness?: number;
      dashed?: boolean;
      dashSize?: number;
      gapSize?: number;
    } = {}
  ): THREE.Line {
    const points = [
      new THREE.Vector3(from.x, from.y, from.z),
      new THREE.Vector3(to.x, to.y, to.z),
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    let material: THREE.LineBasicMaterial | THREE.LineDashedMaterial;

    if (config.dashed) {
      material = new THREE.LineDashedMaterial({
        color: config.color || '#6c63ff',
        dashSize: config.dashSize || 0.1,
        gapSize: config.gapSize || 0.05,
        transparent: true,
        opacity: 0.5,
      });
    } else {
      material = new THREE.LineBasicMaterial({
        color: config.color || '#6c63ff',
        transparent: true,
        opacity: 0.5,
      });
    }

    const line = new THREE.Line(geometry, material);
    if (config.dashed) {
      line.computeLineDistances();
    }

    sceneManager.addObject(id, line);

    return line;
  }

  /**
   * Create material from config
   */
  private createMaterial(config: ObjectConfig): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
      color: config.color || '#6c63ff',
      transparent: config.opacity !== undefined,
      opacity: config.opacity || 1,
      wireframe: config.wireframe || false,
      emissive: config.emissive || config.color || '#6c63ff',
      emissiveIntensity: config.emissiveIntensity || 0.1,
      metalness: 0.3,
      roughness: 0.4,
    });

    return material;
  }

  /**
   * Apply transform to mesh or group
   */
  private applyTransform(
    object: THREE.Mesh | THREE.Group | THREE.Points,
    config: ObjectConfig
  ): void {
    if (config.position) {
      object.position.set(config.position.x, config.position.y, config.position.z);
    }
    if (config.rotation) {
      object.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
    }
    if (config.scale) {
      object.scale.set(config.scale.x, config.scale.y, config.scale.z);
    }
  }

  /**
   * Create a logo (simple geometric logo)
   */
  createLogo(id: string, config: ObjectConfig = {}): THREE.Group {
    const group = new THREE.Group();

    // Main shape - a stylized 'R' or geometric shape
    const mainShape = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.2, 0.3),
      new THREE.MeshStandardMaterial({
        color: config.color || '#6c63ff',
        emissive: config.color || '#6c63ff',
        emissiveIntensity: 0.2,
        metalness: 0.5,
        roughness: 0.3,
      })
    );
    group.add(mainShape);

    // Accent
    const accent = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshStandardMaterial({
        color: '#ffd93d',
        emissive: '#ffd93d',
        emissiveIntensity: 0.5,
      })
    );
    accent.position.set(0.5, 0.3, 0.2);
    group.add(accent);

    this.applyTransform(group, config);
    sceneManager.addObject(id, group);

    return group;
  }

  /**
   * Clear all objects
   */
  clearAll(): void {
    const objects = sceneManager.getAllObjects();
    for (const obj of objects) {
      sceneManager.removeObject(obj.id);
    }
  }

  /**
   * Create multiple objects at once
   */
  createBatch(objects: Array<{
    id: string;
    type: 'cube' | 'sphere' | 'torus' | 'pyramid' | 'device' | 'network-node';
    config: any;
  }>): void {
    for (const obj of objects) {
      switch (obj.type) {
        case 'cube':
          this.createCube(obj.id, obj.config);
          break;
        case 'sphere':
          this.createSphere(obj.id, obj.config);
          break;
        case 'torus':
          this.createTorus(obj.id, obj.config);
          break;
        case 'pyramid':
          this.createPyramid(obj.id, obj.config);
          break;
        case 'device':
          this.createDevice(obj.id, obj.config);
          break;
        case 'network-node':
          this.createNetworkNode(obj.id, obj.config);
          break;
      }
    }
  }
}

// Export singleton instance
export const objectFactory = new ObjectFactory();
export default objectFactory;