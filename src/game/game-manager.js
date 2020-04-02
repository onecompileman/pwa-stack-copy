import {
  AmbientLight,
  WebGLRenderer,
  sRGBEncoding,
  ReinhardToneMapping,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Fog,
  BoxBufferGeometry,
  FogExp2,
  MeshLambertMaterial,
  Mesh,
  Color,
  MathUtils,
  Clock,
  Vector3,
  Box3,
  LineBasicMaterial,
  LineSegments
} from 'three';

import C from 'cannon';
import { ScreenManager } from './screen-manager';

export class GameManager {
  constructor() {}

  initGame() {
    this.clock = new Clock();
    this.isPlaying = false;
    this.score = 0;
    this.initWorld();
    this.initScene();
    this.initLightning();
    this.initColors();
    this.initFog();
    this.initBox();
    this.initCamera();

    this.initRenderer();

    this.bindEvents();

    this.render();
    this.initScreenManager();
    this.screenManagerBindEvents();
  }

  initScreenManager() {
    this.screenManager = new ScreenManager();

    this.screenManager.show('homeScreen');
  }

  resetGame() {
    this.scene.remove(this.currentBox);
    this.fallingBoxes.forEach(box => {
      this.world.remove(box.body);
      this.scene.remove(box);
    });

    this.boxes.forEach(box => {
      this.world.remove(box.body);
      this.scene.remove(box);
    });
    this.clock = new Clock();
    this.isPlaying = false;
    this.score = 0;

    this.initColors();
    this.initFog();
    this.initBox();
    this.initCamera();
  }

  screenManagerBindEvents() {
    this.screenManager.screens.homeScreen.onTap = () => {
      this.screenManager.show('inGameUI');
      this.resetGame();
      this.isPlaying = true;
    };

    this.screenManager.screens.inGameUI.onPause = () => {
      this.screenManager.show('pauseScreen');
      this.isPlaying = false;
    };

    this.screenManager.screens.pauseScreen.onResume = () => {
      this.screenManager.show('inGameUI');
      this.isPlaying = true;
    };

    this.screenManager.screens.gameOver.onRetry = () => {
      this.screenManager.show('inGameUI');
      this.resetGame();
      this.isPlaying = true;
    };

    this.screenManager.screens.gameOver.onResume = () => {
      this.screenManager.show('homeScreen');
      this.resetGame();
    };
  }

  initWorld() {
    this.world = new C.World();
    this.world.gravity.set(0, -10, 0);
  }

  updateWorld() {
    this.world.step(1 / 60);
  }

  initColors() {
    this.backgroundColor = new Color(
      MathUtils.randFloat(0.1, 0.65),
      MathUtils.randFloat(0.15, 0.65),
      MathUtils.randFloat(0.1, 0.65)
    );

    this.toLerpBackgroundColor = new Color(
      MathUtils.randFloat(0.1, 0.65),
      MathUtils.randFloat(0.15, 0.65),
      MathUtils.randFloat(0.1, 0.65)
    );

    this.tileColor = new Color(
      MathUtils.randFloat(0.5, 0.85),
      MathUtils.randFloat(0.5, 0.8),
      MathUtils.randFloat(0.5, 0.85)
    );
    this.toLerpTileColor = new Color(
      MathUtils.randFloat(0.5, 0.85),
      MathUtils.randFloat(0.5, 0.8),
      MathUtils.randFloat(0.5, 0.85)
    );

    this.tileLerpStep = 0;
    this.tileMaxLerpStep = 3;
  }

  updateColors() {
    if (this.tileMaxLerpStep <= this.tileLerpStep) {
      this.toLerpTileColor = new Color(
        MathUtils.randFloat(0.3, 0.85),
        MathUtils.randFloat(0.5, 0.8),
        MathUtils.randFloat(0.3, 0.85)
      );
      this.toLerpBackgroundColor = new Color(
        MathUtils.randFloat(0.1, 0.65),
        MathUtils.randFloat(0.15, 0.65),
        MathUtils.randFloat(0.1, 0.65)
      );

      this.tileLerpStep = 0;
    }

    this.tileColor.lerp(this.toLerpTileColor, 0.25);
    this.backgroundColor.lerp(this.toLerpBackgroundColor, 0.25);

    this.tileLerpStep++;
  }

  initScene() {
    this.scene = new Scene();
  }

  initCamera() {
    this.canvas = document.querySelector('#mainCanvas');

    this.cameraFollowPosition = new Vector3(7.7, 19, 1.4);

    this.camera = new PerspectiveCamera(
      50,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      100
    );

    this.camera.rotation.set(-0.75, 0.5, 0.5);

    this.camera.position.set(7.7, 19, 1.4);

    this.scene.add(this.camera);
  }

  updateCamera() {
    this.camera.position.lerp(this.cameraFollowPosition, 0.1);
  }

  initLightning() {
    this.ambientLight = new AmbientLight(0xf0f0f0, 0.5);
    this.directionalLight = new DirectionalLight(0xf9f9f9, 0.6);
    this.directionalLight.castShadow = true;

    this.scene.add(this.ambientLight).add(this.directionalLight);
  }

  initRenderer() {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setClearColor(this.backgroundColor);
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.gammaFactor = 2.2;
    this.renderer.toneMapping = ReinhardToneMapping;
  }

  onResize() {
    this.renderer.setSize(innerWidth, innerHeight);

    const canvas = this.renderer.domElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());
    this.canvas.addEventListener('click', () => this.onTap());
  }

  initFog() {
    // this.fog = new FogExp2(0xff8888, 0.001);

    this.fog = new Fog(this.backgroundColor, 0.1, 30);
    this.scene.fog = this.fog;
    this.scene.background = this.backgroundColor;
  }

  initBox() {
    const geometry = new BoxBufferGeometry(4, 8, 4);
    const material = new MeshLambertMaterial({ color: 0x1111aa });
    // Initial Box
    const box = new Mesh(geometry, material);
    box.position.set(0, 0, -10);
    box.receiveShadow = true;
    // box.rotation.set(0, -0.7, 0);
    this.addMeshToWorld(box);

    this.boxes = [box];
    this.fallingBoxes = [];

    this.scene.add(box);

    this.currentBoxWidth = 4;
    this.currentBoxDepth = 4;

    this.boxHeight = 0.6;
    this.currentBoxSpeed = 4;

    const currentBoxGeometry = new BoxBufferGeometry(
      this.currentBoxWidth,
      this.boxHeight,
      this.currentBoxDepth
    );
    const currentBoxMaterial = new MeshLambertMaterial({
      color: this.tileColor.clone()
    });

    this.currentBox = new Mesh(currentBoxGeometry, currentBoxMaterial);
    this.currentBox.castShadow = true;
    this.currentBox.position.set(0, 4.3, -10);
    // this.currentBox.rotation.set(0, -0.7, 0);

    this.scene.add(this.currentBox);

    this.movementDir = 'horizontal';
  }

  updateBox() {
    if (this.movementDir === 'vertical') {
      if (this.currentBox.position.z >= -5 && this.currentBoxSpeed > 0) {
        this.currentBoxSpeed = -this.currentBoxSpeed;
      }

      if (this.currentBox.position.z <= -15 && this.currentBoxSpeed < 0) {
        this.currentBoxSpeed = -this.currentBoxSpeed;
      }

      const velocity = new Vector3(
        0,
        0,
        this.currentBoxSpeed * this.clock.getDelta()
      );

      this.currentBox.position.add(velocity);
    } else {
      if (this.currentBox.position.x >= 5 && this.currentBoxSpeed > 0) {
        this.currentBoxSpeed = -this.currentBoxSpeed;
      }

      if (this.currentBox.position.x <= -5 && this.currentBoxSpeed < 0) {
        this.currentBoxSpeed = -this.currentBoxSpeed;
      }

      const velocity = new Vector3(
        this.currentBoxSpeed * this.clock.getDelta(),
        0,
        0
      );

      this.currentBox.position.add(velocity);
    }
  }

  onTap() {
    this.cameraFollowPosition.copy(this.camera.position);
    this.cameraFollowPosition.y += this.boxHeight * 0.85;

    let lastBox = this.boxes[this.boxes.length - 1];

    let lastBoxSize = new Vector3();

    new Box3().setFromObject(lastBox).getSize(lastBoxSize);

    console.log(lastBoxSize);

    if (this.movementDir === 'horizontal') {
      const boxToAdd = this.currentBox.clone();
      const lastBoxMinX = lastBox.position.x - lastBoxSize.x / 2;
      const lastBoxMaxX = lastBox.position.x + lastBoxSize.x / 2;

      const currentBoxMinX = boxToAdd.position.x - this.currentBoxWidth / 2;
      const currentBoxMaxX = boxToAdd.position.x + this.currentBoxWidth / 2;

      const placeThreshold = 0.1;

      console.log(boxToAdd);

      const maxDiff = lastBoxMaxX - currentBoxMaxX;

      console.log(maxDiff, lastBoxMaxX, currentBoxMaxX);

      if (Math.abs(maxDiff) > placeThreshold) {
        this.currentBoxWidth -= Math.abs(maxDiff);

        console.log(this.currentBoxWidth, 'dito');

        if (this.currentBoxWidth <= 0) {
          setTimeout(() => {
            this.screenManager.show('gameOver');
            this.isPlaying = false;
          }, 1000);
        }

        this.score++;
        this.screenManager.screens.inGameUI.score = this.score;
        this.screenManager.screens.gameOver.score = this.score;

        this.scene.remove(this.currentBox);
        if (this.currentBoxWidth > 0) {
          let newBoxPositionX =
            maxDiff > 0
              ? currentBoxMaxX - this.currentBoxWidth / 2
              : lastBoxMaxX - this.currentBoxWidth / 2;
          const newBoxGeometry = new BoxBufferGeometry(
            this.currentBoxWidth,
            this.boxHeight,
            this.currentBoxDepth
          );
          const newBox = new Mesh(newBoxGeometry, boxToAdd.material.clone());
          newBox.position.copy(boxToAdd.position.clone());
          newBox.position.x = newBoxPositionX;

          this.boxes.push(newBox);
          this.scene.add(newBox);
          this.addMeshToWorld(newBox);
        }
        // Falling box
        let fallingBoxPositionX =
          maxDiff > 0
            ? currentBoxMinX - (Math.abs(maxDiff) / 2 - 0.1)
            : lastBoxMaxX + (Math.abs(maxDiff) / 2 + 0.1);
        const fallingBoxGeometry = new BoxBufferGeometry(
          Math.abs(maxDiff),
          this.boxHeight,
          this.currentBoxDepth
        );
        const fallingBox = new Mesh(
          fallingBoxGeometry,
          boxToAdd.material.clone()
        );
        fallingBox.position.copy(boxToAdd.position.clone());
        fallingBox.position.x = fallingBoxPositionX;

        this.fallingBoxes.push(fallingBox);
        this.scene.add(fallingBox);
        this.addMeshToWorld(fallingBox, 1);
      } else {
        const lastBoxMesh = this.currentBox.clone();
        lastBoxMesh.position.copy(lastBox.position.clone());
        lastBoxMesh.position.y = this.currentBox.position.y;

        this.score += 10;
        this.screenManager.screens.inGameUI.score = this.score;
        this.screenManager.screens.gameOver.score = this.score;

        this.scene.remove(this.currentBox);

        this.boxes.push(lastBoxMesh);
        this.scene.add(lastBoxMesh);
        this.addMeshToWorld(lastBoxMesh);
      }
    } else {
      const boxToAdd = this.currentBox.clone();
      const lastBoxMinZ = lastBox.position.z - lastBoxSize.z / 2;
      const lastBoxMaxZ = lastBox.position.z + lastBoxSize.z / 2;

      const currentBoxMinZ = boxToAdd.position.z - this.currentBoxDepth / 2;
      const currentBoxMaxZ = boxToAdd.position.z + this.currentBoxDepth / 2;

      const placeThreshold = 0.05;

      const maxDiff = lastBoxMaxZ - currentBoxMaxZ;

      if (Math.abs(maxDiff) > placeThreshold) {
        this.currentBoxDepth -= Math.abs(maxDiff);

        console.log(this.currentBoxDepth, 'dito');

        if (this.currentBoxDepth <= 0) {
          setTimeout(() => {
            this.screenManager.show('gameOver');
            this.isPlaying = false;
          }, 1000);
        }

        this.score++;
        this.screenManager.screens.inGameUI.score = this.score;
        this.screenManager.screens.gameOver.score = this.score;

        this.scene.remove(this.currentBox);
        if (this.currentBoxDepth > 0) {
          let newBoxPositionZ =
            maxDiff > 0
              ? currentBoxMaxZ - this.currentBoxDepth / 2
              : lastBoxMaxZ - this.currentBoxDepth / 2;

          const newBoxGeometry = new BoxBufferGeometry(
            this.currentBoxWidth,
            this.boxHeight,
            this.currentBoxDepth
          );

          const newBox = new Mesh(newBoxGeometry, boxToAdd.material.clone());
          newBox.position.copy(boxToAdd.position.clone());
          newBox.position.z = newBoxPositionZ;

          this.boxes.push(newBox);
          this.scene.add(newBox);
          this.addMeshToWorld(newBox);
        }
        // Falling box
        let fallingBoxPositionZ =
          maxDiff > 0
            ? currentBoxMinZ + (Math.abs(maxDiff) / 2 - 0.1)
            : lastBoxMaxZ + (Math.abs(maxDiff) / 2 + 0.1);

        const fallingBoxGeometry = new BoxBufferGeometry(
          this.currentBoxWidth,
          this.boxHeight,
          Math.abs(maxDiff)
        );

        const fallingBox = new Mesh(
          fallingBoxGeometry,
          boxToAdd.material.clone()
        );

        fallingBox.position.copy(boxToAdd.position.clone());
        fallingBox.position.z = fallingBoxPositionZ;

        this.fallingBoxes.push(fallingBox);
        this.scene.add(fallingBox);
        this.addMeshToWorld(fallingBox, 1);
      } else {
        const lastBoxMesh = this.currentBox.clone();
        lastBoxMesh.position.copy(lastBox.position.clone());
        lastBoxMesh.position.y = this.currentBox.position.y;

        this.score += 10;
        this.screenManager.screens.inGameUI.score = this.score;
        this.screenManager.screens.gameOver.score = this.score;

        this.scene.remove(this.currentBox);

        this.boxes.push(lastBoxMesh);
        this.scene.add(lastBoxMesh);
        this.addMeshToWorld(lastBoxMesh);
      }
    }

    this.updateColors();

    lastBox = this.boxes[this.boxes.length - 1];

    const currentBoxGeometry = new BoxBufferGeometry(
      this.currentBoxWidth,
      this.boxHeight,
      this.currentBoxDepth
    );
    const currentBoxMaterial = new MeshLambertMaterial({
      color: this.toLerpTileColor.clone()
    });

    console.log(this.tileColor);

    this.movementDir =
      this.movementDir === 'horizontal' ? 'vertical' : 'horizontal';

    this.currentBox = new Mesh(currentBoxGeometry, currentBoxMaterial);
    this.currentBox.position.set(
      this.movementDir === 'horizontal' ? -5 : 0,
      lastBox.position.y + this.boxHeight,
      this.movementDir === 'horizontal' ? -10 : -15
    );

    if (this.movementDir === 'horizontal') {
      this.currentBox.position.z = lastBox.position.z;
    } else {
      this.currentBox.position.x = lastBox.position.x;
    }

    this.currentBox.receiveShadow = true;
    this.currentBox.castShadow = true;
    if (this.currentBoxWidth > 0 && this.currentBoxDepth > 0) {
      this.scene.add(this.currentBox);
    }
  }

  addMeshToWorld(mesh, mass = 0) {
    mesh.size = new Vector3();

    new Box3().setFromObject(mesh).getSize(mesh.size);
    console.log(mesh.size);

    const box = new C.Box(new C.Vec3().copy(mesh.size).scale(0.5));

    mesh.body = new C.Body({
      mass,
      position: new C.Vec3(mesh.position.x, mesh.position.y, mesh.position.z)
    });

    mesh.body.addShape(box);
    this.world.addBody(mesh.body);
  }

  updateBoxes() {
    this.boxes.forEach(box => {
      box.position.copy(box.body.position);
    });

    this.fallingBoxes = this.fallingBoxes.filter(box => {
      box.position.copy(box.body.position);
      if (box.position.y <= -5) {
        this.world.remove(box.body);
        this.scene.remove(box);
      }

      return box.position.y > -5;
    });
  }

  render() {
    requestAnimationFrame(() => {
      this.render();
    });

    if (this.isPlaying) {
      this.updateBox();
      this.updateWorld();
      this.updateBoxes();
      this.updateCamera();
    }

    this.renderer.render(this.scene, this.camera);
  }
}
