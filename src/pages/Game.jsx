
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const BLOCKS = [
  { id: 'grass', name: 'Gras', color: '#579447' },
  { id: 'dirt', name: 'Erde', color: '#795338' },
  { id: 'stone', name: 'Stein', color: '#858585' },
  { id: 'cobblestone', name: 'Bruchstein', color: '#666666' },
  { id: 'sand', name: 'Sand', color: '#d9c27c' },
  { id: 'wood', name: 'Holz', color: '#80502c' },
  { id: 'leaves', name: 'Blätter', color: '#347a36' },
  { id: 'planks', name: 'Bretter', color: '#bd8950' },
  { id: 'bricks', name: 'Ziegel', color: '#a94d3b' },
  { id: 'glass', name: 'Glas', color: '#a8dce8' },
  { id: 'snow', name: 'Schnee', color: '#e9f4fa' },
  { id: 'gold', name: 'Gold', color: '#e5bd35' },
  { id: 'diamond', name: 'Diamant', color: '#39d5d0' },
  { id: 'bedrock', name: 'Grundgestein', color: '#333333' },
  { id: 'oak_log', name: 'Eichenstamm', color: '#966033' },
  { id: 'moss', name: 'Moos', color: '#527d42' },
];

const HOTBAR_SIZE = 9;

function Game() {
  const mountRef = useRef(null);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const selectedSlotRef = useRef(0);

  function chooseSlot(index) {
    const next = (index + BLOCKS.length) % BLOCKS.length;
    selectedSlotRef.current = next;
    setSelectedSlot(next);
  }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const CHUNK_SIZE = 16;
    const RENDER_DISTANCE = 2;
    const MOVE_SPEED = 8;
    const JUMP_STRENGTH = 8;
    const GRAVITY = 22;
    const REACH = 7;

    const PLAYER_RADIUS = 0.3;
    const PLAYER_HEIGHT = 1.8;
    const EYE_HEIGHT = 1.7;

    // Szene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87b8d8);
    scene.fog = new THREE.Fog(0x87b8d8, 35, 100);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    mount.appendChild(renderer.domElement);

    // Steuerung
    const controls = new PointerLockControls(
      camera,
      renderer.domElement
    );

    controls.pointerSpeed = 1;

    const onCanvasClick = () => {
      if (!controls.isLocked) controls.lock();
    };

    renderer.domElement.addEventListener('click', onCanvasClick);

    // Licht
    const ambient = new THREE.HemisphereLight(
      0xc4ddff,
      0x42502c,
      2
    );

    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffe5b5, 3);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -40;
    sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -40;

    scene.add(sun);

    // Texturen
    function createTexture(baseColor, detailColor, detail = 700) {
      const size = 128;
      const canvas = document.createElement('canvas');

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');

      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, size, size);

      for (let i = 0; i < detail; i++) {
        ctx.globalAlpha = 0.08 + Math.random() * 0.2;
        ctx.fillStyle = detailColor;

        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = 2 + Math.random() * 8;
        const h = 2 + Math.random() * 8;

        ctx.fillRect(x, y, w, h);
      }

      ctx.globalAlpha = 1;

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestMipmapNearestFilter;
      texture.generateMipmaps = true;

      return texture;
    }

    const textureSettings = {
      grass: ['#579447', '#294e24'],
      dirt: ['#795338', '#422a19'],
      stone: ['#858585', '#414141'],
      cobblestone: ['#666666', '#303030'],
      sand: ['#d9c27c', '#a48c50'],
      wood: ['#80502c', '#452b18'],
      leaves: ['#347a36', '#17451d'],
      planks: ['#bd8950', '#80552e'],
      bricks: ['#a94d3b', '#663126'],
      glass: ['#a8dce8', '#d9f8ff'],
      snow: ['#e9f4fa', '#b9d4e2'],
      gold: ['#e5bd35', '#96751a'],
      diamond: ['#39d5d0', '#167c85'],
      bedrock: ['#333333', '#111111'],
      oak_log: ['#966033', '#59371e'],
      moss: ['#527d42', '#274421'],
    };

    const materials = {};
    const textures = {};

    for (const block of BLOCKS) {
      const [base, detail] = textureSettings[block.id];
      const texture = createTexture(base, detail);

      textures[block.id] = texture;

      materials[block.id] = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: block.id === 'gold' ? 0.35 : 0.95,
        metalness: block.id === 'gold' ? 0.45 : 0,
        transparent: block.id === 'glass',
        opacity: block.id === 'glass' ? 0.38 : 1,
      });
    }

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

    // Terrain
    function terrainHeight(x, z) {
      const a = Math.sin(x * 0.12) * 2;
      const b = Math.cos(z * 0.14) * 2;
      const c = Math.sin((x + z) * 0.08) * 1.5;
      const d = Math.cos((x - z) * 0.05) * 1.5;

      return Math.max(1, Math.floor(4 + a + b + c + d));
    }

    function chunkKey(cx, cz) {
      return `${cx},${cz}`;
    }

    function blockKey(x, y, z) {
      return `${x},${y},${z}`;
    }

    const removedBlocks = new Set();
    const placedBlocks = new Map();
    const chunks = new Map();

    const worldBlocks = new Map();

    let chunkMeshes = [];

    // Zufall mit festem Ergebnis
    function hash(x, z) {
      const value =
        Math.sin(x * 127.1 + z * 311.7) * 43758.5453;

      return value - Math.floor(value);
    }

    function isTreePosition(x, z) {
      return (
        hash(x, z) > 0.975 &&
        hash(x + 17, z - 9) > 0.2
      );
    }

    // Blöcke eines Chunks generieren
    function generateChunkBlocks(cx, cz) {
      const result = {};

      for (const block of BLOCKS) {
        result[block.id] = [];
      }

      const startX = cx * CHUNK_SIZE;
      const startZ = cz * CHUNK_SIZE;

      function addBlock(x, y, z, type) {
        const key = blockKey(x, y, z);

        if (removedBlocks.has(key)) return;

        const placed = placedBlocks.get(key);
        const finalType = placed || type;

        if (!result[finalType]) return;

        result[finalType].push({ x, y, z });
      }

      // Gelände
      for (let x = startX; x < startX + CHUNK_SIZE; x++) {
        for (let z = startZ; z < startZ + CHUNK_SIZE; z++) {
          const height = terrainHeight(x, z);

          for (let y = 0; y <= height; y++) {
            let type = 'stone';

            if (y === height) {
              type = 'grass';
            } else if (y >= height - 3) {
              type = 'dirt';
            }

            addBlock(x, y, z, type);
          }

          // Bäume
          if (isTreePosition(x, z) && height >= 2) {
            const trunkHeight =
              4 + Math.floor(hash(x + 5, z + 5) * 2);

            for (let y = 1; y <= trunkHeight; y++) {
              addBlock(x, height + y, z, 'oak_log');
            }

            const crownY = height + trunkHeight;

            for (let dx = -2; dx <= 2; dx++) {
              for (let dz = -2; dz <= 2; dz++) {
                for (let dy = -1; dy <= 2; dy++) {
                  const distance =
                    Math.abs(dx) +
                    Math.abs(dz) +
                    Math.abs(dy) * 0.8;

                  if (distance <= 4.2) {
                    const trunkPosition =
                      dx === 0 && dz === 0 && dy <= 0;

                    if (!trunkPosition) {
                      addBlock(
                        x + dx,
                        crownY + dy,
                        z + dz,
                        'leaves'
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Platzierte Blöcke
      for (const [key, type] of placedBlocks.entries()) {
        const [x, y, z] = key.split(',').map(Number);

        if (
          Math.floor(x / CHUNK_SIZE) === cx &&
          Math.floor(z / CHUNK_SIZE) === cz
        ) {
          for (const list of Object.values(result)) {
            const index = list.findIndex(
              block =>
                block.x === x &&
                block.y === y &&
                block.z === z
            );

            if (index !== -1) {
              list.splice(index, 1);
            }
          }

          if (!removedBlocks.has(key) && result[type]) {
            result[type].push({ x, y, z });
          }
        }
      }

      return result;
    }

    // Chunk aufbauen
    function buildChunk(cx, cz) {
      const key = chunkKey(cx, cz);
      const oldChunk = chunks.get(key);

      if (oldChunk) {
        oldChunk.meshes.forEach(mesh => scene.remove(mesh));

        for (const blockKeyValue of oldChunk.blockKeys) {
          const entry = worldBlocks.get(blockKeyValue);

          if (entry && entry.owner === key) {
            worldBlocks.delete(blockKeyValue);
          }
        }
      }

      const blocks = generateChunkBlocks(cx, cz);
      const meshes = [];
      const blockKeys = [];
      const dummy = new THREE.Object3D();

      for (const block of BLOCKS) {
        const positions = blocks[block.id];

        if (!positions || positions.length === 0) continue;

        const mesh = new THREE.InstancedMesh(
          cubeGeometry,
          materials[block.id],
          positions.length
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.userData.blocks = positions;
        mesh.userData.chunkKey = key;
        mesh.userData.blockType = block.id;

        positions.forEach((position, index) => {
          dummy.position.set(
            position.x,
            position.y,
            position.z
          );

          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);

          const positionKey = blockKey(
            position.x,
            position.y,
            position.z
          );

          worldBlocks.set(positionKey, {
            type: block.id,
            owner: key,
          });

          blockKeys.push(positionKey);
        });

        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();

        scene.add(mesh);
        meshes.push(mesh);
      }

      chunks.set(key, {
        cx,
        cz,
        meshes,
        blockKeys,
      });

      refreshChunkMeshes();
    }

    function refreshChunkMeshes() {
      chunkMeshes = [];

      for (const chunk of chunks.values()) {
        chunkMeshes.push(...chunk.meshes);
      }
    }

    // Chunks laden und entladen
    function updateChunks() {
      const playerChunkX = Math.floor(
        camera.position.x / CHUNK_SIZE
      );

      const playerChunkZ = Math.floor(
        camera.position.z / CHUNK_SIZE
      );

      const needed = new Set();

      for (
        let x = playerChunkX - RENDER_DISTANCE;
        x <= playerChunkX + RENDER_DISTANCE;
        x++
      ) {
        for (
          let z = playerChunkZ - RENDER_DISTANCE;
          z <= playerChunkZ + RENDER_DISTANCE;
          z++
        ) {
          const key = chunkKey(x, z);
          needed.add(key);

          if (!chunks.has(key)) {
            buildChunk(x, z);
          }
        }
      }

      for (const [key, chunk] of chunks.entries()) {
        if (!needed.has(key)) {
          chunk.meshes.forEach(mesh => scene.remove(mesh));

          for (const positionKey of chunk.blockKeys) {
            const entry = worldBlocks.get(positionKey);

            if (entry && entry.owner === key) {
              worldBlocks.delete(positionKey);
            }
          }

          chunks.delete(key);
        }
      }

      refreshChunkMeshes();
    }

    function rebuildBlockChunk(x, z) {
      const cx = Math.floor(x / CHUNK_SIZE);
      const cz = Math.floor(z / CHUNK_SIZE);
      const key = chunkKey(cx, cz);

      if (chunks.has(key)) {
        buildChunk(cx, cz);
      }
    }

    // Kollisionssystem
    function collidesAt(x, y, z) {
      const minX = Math.floor(x - PLAYER_RADIUS + 0.5);
      const maxX = Math.floor(x + PLAYER_RADIUS + 0.5);

      const feet = y - EYE_HEIGHT;
      const head = feet + PLAYER_HEIGHT;

      const minY = Math.floor(feet + 0.5);
      const maxY = Math.floor(head + 0.5);

      const minZ = Math.floor(z - PLAYER_RADIUS + 0.5);
      const maxZ = Math.floor(z + PLAYER_RADIUS + 0.5);

      for (let bx = minX; bx <= maxX; bx++) {
        for (let by = minY; by <= maxY; by++) {
          for (let bz = minZ; bz <= maxZ; bz++) {
            if (worldBlocks.has(blockKey(bx, by, bz))) {
              return true;
            }
          }
        }
      }

      return false;
    }

    let verticalVelocity = 0;
    let canJump = false;

    // Bewegung mit kleinen Schritten gegen Blockkollisionen
    function moveAxis(axis, amount) {
      if (amount === 0) return;

      const steps = Math.max(
        1,
        Math.ceil(Math.abs(amount) / 0.08)
      );

      const step = amount / steps;

      for (let i = 0; i < steps; i++) {
        const nextX =
          camera.position.x + (axis === 'x' ? step : 0);

        const nextY =
          camera.position.y + (axis === 'y' ? step : 0);

        const nextZ =
          camera.position.z + (axis === 'z' ? step : 0);

        if (collidesAt(nextX, nextY, nextZ)) {
          if (axis === 'y') {
            verticalVelocity = 0;

            if (step < 0) {
              canJump = true;
            }
          }

          return;
        }

        camera.position[axis] += step;

        if (axis === 'y' && step < 0) {
          canJump = false;
        }
      }
    }

    // Einheitlicher Spieler-Skin
    const skinMaterials = {
      skin: new THREE.MeshStandardMaterial({
        color: 0xd5a078,
        roughness: 1,
      }),

      hair: new THREE.MeshStandardMaterial({
        color: 0x49301e,
        roughness: 1,
      }),

      shirt: new THREE.MeshStandardMaterial({
        color: 0x2865bd,
        roughness: 1,
      }),

      pants: new THREE.MeshStandardMaterial({
        color: 0x263b72,
        roughness: 1,
      }),

      shoes: new THREE.MeshStandardMaterial({
        color: 0x292929,
        roughness: 1,
      }),

      eyes: new THREE.MeshStandardMaterial({
        color: 0x252525,
      }),
    };

    // Wiederverwendbares vollständiges Spielermodell
    function createPlayerModel() {
      const group = new THREE.Group();

      function part(width, height, depth, material, x, y, z) {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, depth),
          material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;

        group.add(mesh);
        return mesh;
      }

      // Kopf
      part(0.5, 0.5, 0.5, skinMaterials.skin, 0, 1.55, 0);

      // Haare
      part(0.52, 0.15, 0.52, skinMaterials.hair, 0, 1.87, 0);
      part(0.12, 0.3, 0.52, skinMaterials.hair, -0.2, 1.7, 0);

      // Augen
      part(0.07, 0.07, 0.02, skinMaterials.eyes, -0.12, 1.58, -0.256);
      part(0.07, 0.07, 0.02, skinMaterials.eyes, 0.12, 1.58, -0.256);

      // Körper
      part(0.55, 0.7, 0.3, skinMaterials.shirt, 0, 0.95, 0);

      // Arme
      part(0.23, 0.65, 0.25, skinMaterials.shirt, -0.4, 0.97, 0);
      part(0.23, 0.65, 0.25, skinMaterials.shirt, 0.4, 0.97, 0);

      // Hände
      part(0.23, 0.2, 0.25, skinMaterials.skin, -0.4, 0.55, 0);
      part(0.23, 0.2, 0.25, skinMaterials.skin, 0.4, 0.55, 0);

      // Beine
      part(0.25, 0.65, 0.28, skinMaterials.pants, -0.14, 0.27, 0);
      part(0.25, 0.65, 0.28, skinMaterials.pants, 0.14, 0.27, 0);

      // Schuhe
      part(0.26, 0.16, 0.32, skinMaterials.shoes, -0.14, -0.13, -0.02);
      part(0.26, 0.16, 0.32, skinMaterials.shoes, 0.14, -0.13, -0.02);

      return group;
    }

    // Erstes vollständiges Spielermodell als Vorlage
    // Wird in First Person nicht angezeigt.
    const playerModel = createPlayerModel();
    playerModel.visible = false;
    scene.add(playerModel);

    // Arme in der First-Person-Ansicht
    const firstPersonArms = new THREE.Group();

    const leftArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.55, 0.22),
      skinMaterials.shirt
    );

    leftArm.position.set(-0.32, -0.38, -0.58);
    leftArm.rotation.z = 0.12;

    const rightArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.55, 0.22),
      skinMaterials.shirt
    );

    rightArm.position.set(0.32, -0.38, -0.58);
    rightArm.rotation.z = -0.12;

    const leftHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.18, 0.22),
      skinMaterials.skin
    );

    leftHand.position.set(-0.32, -0.68, -0.58);

    const rightHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.18, 0.22),
      skinMaterials.skin
    );

    rightHand.position.set(0.32, -0.68, -0.58);

    firstPersonArms.add(
      leftArm,
      rightArm,
      leftHand,
      rightHand
    );

    camera.add(firstPersonArms);

    // Wasser
    const waterGeometry = new THREE.PlaneGeometry(
      1000,
      1000,
      100,
      100
    );

    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x247da5,
      roughness: 0.2,
      metalness: 0.25,
      transparent: true,
      opacity: 0.82,
    });

    waterMaterial.onBeforeCompile = shader => {
      shader.uniforms.uTime = { value: 0 };

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
          #include <common>
          uniform float uTime;
          varying float vWave;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
          #include <begin_vertex>
          float wave1 = sin(position.x * 0.08 + uTime * 1.2);
          float wave2 = cos(position.y * 0.12 + uTime * 0.8);
          float wave3 = sin((position.x + position.y) * 0.05 + uTime);
          float wave = wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2;
          transformed.z += wave * 0.12;
          vWave = wave;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
          #include <common>
          varying float vWave;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `
          #include <color_fragment>
          vec3 deepColor = vec3(0.015, 0.18, 0.28);
          vec3 lightColor = vec3(0.12, 0.48, 0.62);
          float variation = clamp(vWave * 0.5 + 0.5, 0.0, 1.0);
          diffuseColor.rgb *= mix(deepColor, lightColor, variation);
        `
      );

      waterMaterial.userData.shader = shader;
    };

    const water = new THREE.Mesh(
      waterGeometry,
      waterMaterial
    );

    water.rotation.x = -Math.PI / 2;
    water.position.y = 1.2;

    scene.add(water);

    // Spielerposition
    camera.position.set(
      0,
      terrainHeight(0, 8) + EYE_HEIGHT + 0.5,
      8
    );

    const keys = {};

    function onKeyDown(event) {
      keys[event.code] = true;

      if (/^Digit[1-9]$/.test(event.code)) {
        chooseSlot(Number(event.code.slice(5)) - 1);
      }
    }

    function onKeyUp(event) {
      keys[event.code] = false;
    }

    function onBlur() {
      Object.keys(keys).forEach(key => {
        keys[key] = false;
      });
    }

    function onWheel(event) {
      chooseSlot(
        selectedSlotRef.current +
        (event.deltaY > 0 ? 1 : -1)
      );
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('wheel', onWheel);

    // Blöcke abbauen und platzieren
    const raycaster = new THREE.Raycaster();
    raycaster.far = REACH;

    const center = new THREE.Vector2(0, 0);

    function getTargetBlock() {
      raycaster.setFromCamera(center, camera);

      const hits = raycaster.intersectObjects(
        chunkMeshes,
        false
      );

      if (hits.length === 0) return null;

      const hit = hits[0];

      if (hit.instanceId === undefined) return null;

      const block =
        hit.object.userData.blocks[hit.instanceId];

      if (!block) return null;

      return { hit, block };
    }

    function mineBlock() {
      if (!controls.isLocked) return;

      const target = getTargetBlock();
      if (!target) return;

      const { block } = target;
      const key = blockKey(block.x, block.y, block.z);

      removedBlocks.add(key);
      placedBlocks.delete(key);

      rebuildBlockChunk(block.x, block.z);
    }

    function placeBlock() {
      if (!controls.isLocked) return;

      const target = getTargetBlock();
      if (!target) return;

      const { hit, block } = target;

      if (!hit.face) return;

      const normal = hit.face.normal
        .clone()
        .transformDirection(hit.object.matrixWorld);

      const x = Math.round(block.x + normal.x);
      const y = Math.round(block.y + normal.y);
      const z = Math.round(block.z + normal.z);

      const key = blockKey(x, y, z);

      // Keine Blöcke in den Spieler setzen
      const testX = camera.position.x;
      const testY = camera.position.y;
      const testZ = camera.position.z;

      const existing = worldBlocks.get(key);

      worldBlocks.set(key, {
        type: BLOCKS[selectedSlotRef.current].id,
        owner: 'placement-test',
      });

      const overlapsPlayer = collidesAt(
        testX,
        testY,
        testZ
      );

      if (existing) {
        worldBlocks.set(key, existing);
      } else {
        worldBlocks.delete(key);
      }

      if (overlapsPlayer) return;

      const type = BLOCKS[selectedSlotRef.current].id;

      removedBlocks.delete(key);
      placedBlocks.set(key, type);

      rebuildBlockChunk(x, z);
    }

    function onMouseDown(event) {
      if (event.button === 0) {
        mineBlock();
      }

      if (event.button === 2) {
        placeBlock();
      }
    }

    function onContextMenu(event) {
      event.preventDefault();
    }

    renderer.domElement.addEventListener(
      'mousedown',
      onMouseDown
    );

    renderer.domElement.addEventListener(
      'contextmenu',
      onContextMenu
    );

    // Animation
    const clock = new THREE.Clock();

    let animationId;
    let previousChunkX = null;
    let previousChunkZ = null;

    function animate() {
      animationId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);

      if (controls.isLocked) {
        const direction = new THREE.Vector3();

        camera.getWorldDirection(direction);

        const forward = new THREE.Vector3(
          direction.x,
          0,
          direction.z
        ).normalize();

        const right = new THREE.Vector3()
          .crossVectors(
            forward,
            new THREE.Vector3(0, 1, 0)
          )
          .normalize();

        let moveX = 0;
        let moveZ = 0;

        if (keys.KeyW) {
          moveX += forward.x;
          moveZ += forward.z;
        }

        if (keys.KeyS) {
          moveX -= forward.x;
          moveZ -= forward.z;
        }

        if (keys.KeyA) {
          moveX -= right.x;
          moveZ -= right.z;
        }

        if (keys.KeyD) {
          moveX += right.x;
          moveZ += right.z;
        }

        const moveLength = Math.sqrt(
          moveX * moveX + moveZ * moveZ
        );

        if (moveLength > 0) {
          moveX /= moveLength;
          moveZ /= moveLength;

          moveAxis('x', moveX * MOVE_SPEED * delta);
          moveAxis('z', moveZ * MOVE_SPEED * delta);
        }

        if (keys.Space && canJump) {
          verticalVelocity = JUMP_STRENGTH;
          canJump = false;
        }

        verticalVelocity -= GRAVITY * delta;

        moveAxis('y', verticalVelocity * delta);
      }

      // Chunks aktualisieren
      const currentChunkX = Math.floor(
        camera.position.x / CHUNK_SIZE
      );

      const currentChunkZ = Math.floor(
        camera.position.z / CHUNK_SIZE
      );

      if (
        currentChunkX !== previousChunkX ||
        currentChunkZ !== previousChunkZ
      ) {
        previousChunkX = currentChunkX;
        previousChunkZ = currentChunkZ;

        updateChunks();
      }

      water.position.x = camera.position.x;
      water.position.z = camera.position.z;

      if (waterMaterial.userData.shader) {
        waterMaterial.userData.shader.uniforms.uTime.value =
          clock.elapsedTime;
      }

      renderer.render(scene, camera);
    }

    // Start
    updateChunks();

    previousChunkX = Math.floor(
      camera.position.x / CHUNK_SIZE
    );

    previousChunkZ = Math.floor(
      camera.position.z / CHUNK_SIZE
    );

    animate();

    // Fenstergröße
    function onResize() {
      camera.aspect =
        window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    }

    window.addEventListener('resize', onResize);

    // Aufräumen
    return () => {
      cancelAnimationFrame(animationId);

      controls.unlock();
      controls.dispose();

      renderer.domElement.removeEventListener(
        'click',
        onCanvasClick
      );

      renderer.domElement.removeEventListener(
        'mousedown',
        onMouseDown
      );

      renderer.domElement.removeEventListener(
        'contextmenu',
        onContextMenu
      );

      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);

      for (const chunk of chunks.values()) {
        chunk.meshes.forEach(mesh => scene.remove(mesh));
      }

      scene.remove(water);
      scene.remove(playerModel);

      camera.remove(firstPersonArms);

      cubeGeometry.dispose();
      waterGeometry.dispose();

      Object.values(textures).forEach(texture => {
        texture.dispose();
      });

      Object.values(materials).forEach(material => {
        material.dispose();
      });

      Object.values(skinMaterials).forEach(material => {
        material.dispose();
      });

      firstPersonArms.traverse(object => {
        if (object.geometry) object.geometry.dispose();
      });

      playerModel.traverse(object => {
        if (object.geometry) object.geometry.dispose();
      });

      waterMaterial.dispose();

      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const visibleBlocks = BLOCKS.slice(0, HOTBAR_SIZE);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#87b8d8',
        cursor: 'crosshair',
      }}
    >
      {/* Fadenkreuz */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: 25,
          fontFamily: 'Arial',
          textShadow: '1px 1px 3px black',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        +
      </div>

      {/* Hotbar */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 5,
          padding: 8,
          borderRadius: 8,
          background: 'rgba(15, 15, 15, 0.72)',
          zIndex: 5,
          pointerEvents: 'auto',
          maxWidth: '95vw',
        }}
      >
        {visibleBlocks.map((block, index) => (
          <button
            key={block.id}
            onClick={() => chooseSlot(index)}
            title={`${index + 1}: ${block.name}`}
            style={{
              width: 48,
              height: 48,
              minWidth: 0,
              padding: 5,
              borderRadius: 5,
              border:
                selectedSlot === index
                  ? '3px solid white'
                  : '2px solid #777',
              background:
                selectedSlot === index
                  ? 'rgba(255,255,255,0.25)'
                  : 'rgba(0,0,0,0.45)',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 25,
                height: 25,
                margin: 'auto',
                background: block.color,
                border: '2px solid rgba(0,0,0,0.25)',
                boxShadow: 'inset -4px -4px rgba(0,0,0,0.15)',
              }}
            />

            <span
              style={{
                position: 'absolute',
                bottom: 1,
                right: 4,
                color: 'white',
                fontSize: 10,
                fontFamily: 'Arial',
              }}
            >
              {index + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Ausgewählter Block */}
      <div
        style={{
          position: 'absolute',
          bottom: 88,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontFamily: 'Arial',
          fontSize: 13,
          textShadow: '1px 1px 3px black',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        {BLOCKS[selectedSlot].name}
      </div>

      {/* Branding */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 14,
          color: 'white',
          fontFamily: 'Arial',
          fontSize: 11,
          textShadow: '1px 1px 3px black',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        EINEFICHTE
      </div>
    </div>
  );
}

export default Game;
