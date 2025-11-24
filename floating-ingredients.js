import * as THREE from 'https://cdn.skypack.dev/three@0.124.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/controls/OrbitControls';

const bubbleNoise = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);} 
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3  ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const bubbleVertexDistortion = `
uniform float uTime;
uniform float uDistortion;
uniform float uRadius;
uniform float uVelocity;

${bubbleNoise}

void main(){
  float noise=snoise(vec3(position/2.0+uTime*uVelocity));
  vec3 transformed=position*(noise*pow(uDistortion,2.0)+uRadius);
  vec4 mvPosition=modelViewMatrix*vec4(transformed,1.0);
  gl_Position=projectionMatrix*mvPosition;
}`;

const bubbleFragment = `
uniform float uHighlight;
void main(){
  vec3 base=vec3(1.0,0.95,0.85);
  vec3 tint=vec3(0.98,0.76,0.56);
  vec3 color=mix(base,tint,uHighlight);
  gl_FragColor=vec4(color,0.75);
}`;

const pointerSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='42' height='42' viewBox='0 0 42 42'><defs><radialGradient id='a' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='%23ffd799'/><stop offset='100%' stop-color='%23ff9f57'/></radialGradient></defs><g fill='none'><circle cx='21' cy='21' r='12' fill='url(%23a)' fill-opacity='0.9'/><circle cx='21' cy='21' r='16' stroke='%23ffb774' stroke-width='2' stroke-opacity='0.6'/></g></svg>`;

const ingredientPalette = ['#ffce85', '#ffc2a1', '#ffd6cc', '#ffe9c2', '#f8c9a4'];
const ingredientShapes = ['EGG', 'TOMATO', 'BACON', 'BREAD', 'CHEESE'];

function createSilhouetteTexture(label, seed = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const hue = (seed * 40 + 20) % 360;
  const color = `hsl(${hue}, 70%, 88%)`;
  ctx.fillStyle = color;
  ctx.strokeStyle = `hsl(${(hue + 20) % 360}, 65%, 70%)`;
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;

  ctx.save();
  ctx.translate(160, 160);
  ctx.rotate((seed * 0.35));

  switch (label) {
    case 'EGG': {
      ctx.beginPath();
      ctx.ellipse(0, 10, 90, 120, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = `hsl(${hue}, 70%, 78%)`;
      ctx.ellipse(-10, 15, 36, 42, -0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'TOMATO': {
      ctx.beginPath();
      ctx.ellipse(0, 10, 100, 85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = `hsl(${hue}, 75%, 82%)`;
      ctx.moveTo(-20, -40);
      ctx.quadraticCurveTo(0, -80, 20, -40);
      ctx.quadraticCurveTo(0, -20, -20, -40);
      ctx.fill();
      break;
    }
    case 'BACON': {
      ctx.beginPath();
      ctx.moveTo(-90, -80);
      ctx.quadraticCurveTo(-40, -30, -70, 40);
      ctx.quadraticCurveTo(-20, 100, 60, 70);
      ctx.quadraticCurveTo(120, 30, 90, -50);
      ctx.quadraticCurveTo(40, -110, -30, -90);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 6;
      ctx.strokeStyle = `hsl(${(hue + 12) % 360}, 60%, 76%)`;
      ctx.beginPath();
      ctx.moveTo(-70, -40);
      ctx.quadraticCurveTo(-20, 10, -30, 70);
      ctx.moveTo(-20, -70);
      ctx.quadraticCurveTo(40, -20, 40, 40);
      ctx.stroke();
      break;
    }
    case 'BREAD': {
      ctx.beginPath();
      ctx.moveTo(-90, 40);
      ctx.quadraticCurveTo(-90, -80, 0, -90);
      ctx.quadraticCurveTo(90, -80, 90, 40);
      ctx.quadraticCurveTo(90, 110, -90, 110);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = `hsl(${hue}, 65%, 80%)`;
      ctx.fillRect(-70, -20, 140, 110);
      break;
    }
    default: {
      ctx.beginPath();
      ctx.moveTo(-70, 50);
      ctx.quadraticCurveTo(-90, -40, 0, -90);
      ctx.quadraticCurveTo(90, -40, 70, 50);
      ctx.quadraticCurveTo(80, 110, -70, 110);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;
  return texture;
}

class FloatingScene {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2();
    this.bubbles = [];
    this.ingredients = [];
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xfdf6ed, 18, 40);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    this.camera.position.set(0, 2, 18);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const dir = new THREE.DirectionalLight(0xfff1dd, 0.8);
    dir.position.set(2, 6, 6);
    this.scene.add(ambient, dir);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableRotate = false;

    this.createBubbles();
    this.createIngredients();
    this.addListeners();
    this.renderer.setAnimationLoop(() => this.render());
  }

  createBubbles() {
    const bubbleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDistortion: { value: 0.45 },
        uRadius: { value: 1.0 },
        uVelocity: { value: 0.55 },
        uHighlight: { value: 0.5 }
      },
      vertexShader: bubbleVertexDistortion,
      fragmentShader: bubbleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const geometry = new THREE.IcosahedronBufferGeometry(1, 5);
    for (let i = 0; i < 18; i++) {
      const bubble = new THREE.Mesh(geometry, bubbleMaterial);
      bubble.position.set(
        THREE.MathUtils.randFloatSpread(14),
        THREE.MathUtils.randFloatSpread(12) - 2,
        THREE.MathUtils.randFloatSpread(4) - 8
      );
      const scale = THREE.MathUtils.randFloat(0.8, 2.2);
      bubble.scale.setScalar(scale);
      bubble.userData.speed = THREE.MathUtils.randFloat(0.06, 0.14);
      bubble.userData.swing = THREE.MathUtils.randFloat(0.3, 0.6);
      this.scene.add(bubble);
      this.bubbles.push(bubble);
    }
    this.bubbleMaterial = bubbleMaterial;
  }

  createIngredients() {
    const loader = new THREE.TextureLoader();
    const geom = new THREE.PlaneBufferGeometry(2.8, 2.8);

    ingredientShapes.forEach((label, idx) => {
      const texture = createSilhouetteTexture(label, idx);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.92,
        roughness: 0.6,
        metalness: 0.05,
        side: THREE.DoubleSide
      });
      for (let i = 0; i < 4; i++) {
        const mesh = new THREE.Mesh(geom, mat.clone());
        mesh.position.set(
          THREE.MathUtils.randFloatSpread(16),
          THREE.MathUtils.randFloatSpread(10) - 1,
          THREE.MathUtils.randFloatSpread(6)
        );
        mesh.userData.baseZ = mesh.position.z;
        mesh.userData.waveOffset = Math.random() * Math.PI * 2;
        mesh.userData.yRange = THREE.MathUtils.randFloat(1, 3);
        const scale = THREE.MathUtils.randFloat(1.4, 2.5);
        mesh.scale.setScalar(scale);
        mesh.rotation.z = Math.random() * Math.PI;
        this.scene.add(mesh);
        this.ingredients.push(mesh);
      }
    });
  }

  addListeners() {
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('pointermove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  updateBubbles(elapsed) {
    if (!this.bubbleMaterial) return;
    this.bubbleMaterial.uniforms.uTime.value = elapsed;

    this.bubbles.forEach((bubble, idx) => {
      bubble.position.y += bubble.userData.speed;
      bubble.position.x += Math.sin(elapsed + idx) * 0.005 * bubble.userData.swing;
      bubble.rotation.y += 0.005;
      bubble.rotation.x += 0.003;
      if (bubble.position.y > 12) {
        bubble.position.y = -10;
        bubble.position.x = THREE.MathUtils.randFloatSpread(10);
      }
    });
  }

  updateIngredients(elapsed) {
    const mouseInfluence = new THREE.Vector3(this.mouse.x, this.mouse.y, 0).multiplyScalar(0.8);
    this.ingredients.forEach((mesh, idx) => {
      const wave = Math.sin(elapsed * 0.8 + mesh.userData.waveOffset) * 0.6;
      const bubblePull = this.bubbles.reduce((acc, bubble) => {
        const dist = mesh.position.distanceTo(bubble.position);
        const strength = Math.max(0, 1 - dist / 10);
        return acc + strength * 0.8;
      }, 0);
      const wobble = wave + bubblePull;
      mesh.position.z = mesh.userData.baseZ + wobble * 0.8;
      mesh.rotation.z += 0.002 + bubblePull * 0.01;
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, mouseInfluence.x * 0.3, 0.05);
      mesh.position.y += Math.sin(elapsed * 0.6 + idx) * 0.002 * mesh.userData.yRange;
      const scale = 1 + wobble * 0.08;
      mesh.scale.setScalar(mesh.scale.x * 0.98 + scale * 0.02);
    });
  }

  render() {
    const elapsed = this.clock.getElapsedTime();
    this.updateBubbles(elapsed);
    this.updateIngredients(elapsed);
    this.renderer.render(this.scene, this.camera);
  }
}

export function startFloatingBackground() {
  const container = document.querySelector('.floating-background');
  if (!container) return;
  container.style.cursor = `url(${pointerSvg}) 20 20, auto`;
  const scene = new FloatingScene(container);
  scene.init();
}

startFloatingBackground();
