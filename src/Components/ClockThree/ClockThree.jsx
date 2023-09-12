import React, { useEffect, useRef } from "react";
import "./ClockThree.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import bumpp from "../../Assets/ClockThree/earthbump.jpg";
import mapp from "../../Assets/ClockThree/earthmap.jpg";
import specc from "../../Assets/ClockThree/earthspec.jpg";
import texture from "../../Assets/ClockThree/old_room_2k.hdr";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import planeMesh from "../../Assets/ClockThree/plane/scene.glb";
import mask from "../../Assets/ClockThree/mask.png";
import anime from "animejs";

export default function ClockThree() {
  const canvasRef = useRef();
  let ring1, ring2, ring3, sphere;

  useEffect(() => {
    let sunBackground = document.querySelector(".sun-background");
    let moonBackground = document.querySelector(".moon-background");
    let planesData = [];
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 50);

    const ringsScene = new THREE.Scene();
    const ringsCamera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    ringsCamera.position.set(0, 0, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    canvasRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.dampingFactor = 0.05;
    controls.enableDamping = true;

    const sunLight = new THREE.DirectionalLight(
      new THREE.Color("#FFFFFF"),
      3.5
    );
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 512;
    sunLight.shadow.mapSize.height = 512;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.bottom = -10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.right = 10;
    scene.add(sunLight);

    const moonLight = new THREE.DirectionalLight(
      new THREE.Color("#77ccff").convertSRGBToLinear(),
      0
    );
    moonLight.position.set(-10, 20, 10);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 512;
    moonLight.shadow.mapSize.height = 512;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 100;
    moonLight.shadow.camera.left = -10;
    moonLight.shadow.camera.bottom = -10;
    moonLight.shadow.camera.top = 10;
    moonLight.shadow.camera.right = 10;
    scene.add(moonLight);

    let mousePos = new THREE.Vector2(0, 0);

    window.addEventListener("mousemove", (e) => {
      let x = e.clientX - window.innerWidth * 0.5;
      let y = e.clientY - window.innerHeight * 0.5;

      mousePos.x = x * 0.0003;
      mousePos.y = y * 0.0003;
    });

    async function renderScene() {
      let pmrem = new THREE.PMREMGenerator(renderer);

      let envmapTexture = await new RGBELoader()
        .setDataType(THREE.FloatType)
        .loadAsync(texture);

      let envMap = pmrem.fromEquirectangular(envmapTexture).texture;

      ring1 = new THREE.Mesh(
        new THREE.RingGeometry(15, 13.5, 80, 1, 0),
        new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#FFCB8E")
            .convertSRGBToLinear()
            .multiplyScalar(200),
          roughness: 0.25,
          envMap,
          envMapIntensity: 1.8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35,
        })
      );

      ring1.sunOpacity = 0.35;
      ring1.moonOpactiy = 0.03;

      ringsScene.add(ring1);

      ring2 = new THREE.Mesh(
        new THREE.RingGeometry(16.5, 15.75, 80, 1, 0),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color("#FFCB8E").convertSRGBToLinear(),
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
        })
      );
      ring2.sunOpacity = 0.35;
      ring2.moonOpactiy = 0.1;

      ringsScene.add(ring2);

      ring3 = new THREE.Mesh(
        new THREE.RingGeometry(18, 17.75, 80),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color("#FFCB8E")
            .convertSRGBToLinear()
            .multiplyScalar(50),
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
        })
      );
      ring3.sunOpacity = 0.35;
      ring3.moonOpactiy = 0.03;
      ringsScene.add(ring3);

      let textures = await Promise.all([
        new THREE.TextureLoader().loadAsync(bumpp),
        new THREE.TextureLoader().loadAsync(mapp),
        new THREE.TextureLoader().loadAsync(specc),
        new THREE.TextureLoader().loadAsync(mask),
      ]);

      sphere = new THREE.Mesh(
        new THREE.SphereGeometry(10, 70, 70),
        new THREE.MeshPhysicalMaterial({
          map: textures[1],
          roughnessMap: textures[2],
          bumpMap: textures[0],
          bumpScale: 0.05,
          envMap,
          envMapIntensity: 0.4,
          sheen: 1,
          sheenRoughness: 0.75,
          sheenColor: new THREE.Color("#ff8a00").convertSRGBToLinear(),
          clearcoat: 0.5,
        })
      );
      sphere.sunEnvIntensity = 0.4;
      sphere.moonEnvIntensity = 0.1;

      sphere.rotation.y += Math.PI * 1.25;
      sphere.receiveShadow = true;
      scene.add(sphere);
    }

    renderScene();

    let clock = new THREE.Clock();

    let daytime = true;
    let animating = false;

    window.addEventListener("mousemove", (e) => {
      if (animating) return;

      let anim;
      if (e.clientX > window.innerWidth - 200 && !daytime) {
        anim = [1, 0];
      } else if (e.clientX < 200 && daytime) {
        anim = [0, 1];
      } else {
        return;
      }

      animating = true;

      let obj = { t: 0 };
      anime({
        targets: obj,
        t: anim,
        complete: () => {
          animating = false;
          daytime = !daytime;
        },
        update: () => {
          sunLight.intensity = 3.5 * (1 - obj.t);
          moonLight.intensity = 3.5 * obj.t;

          sunLight.position.setY(20 * (1 - obj.t));
          moonLight.position.setY(20 * obj.t);

          sphere.material.sheen = 1 - obj.t;

          scene.children.forEach((child) => {
            child.traverse((object) => {
              if (object instanceof THREE.Mesh && object.material.envMap) {
                object.material.envMapIntensity =
                  object.sunEnvIntensity * (1 - obj.t) +
                  object.moonEnvIntensity +
                  obj.t;
              }
            });
          });
          sunBackground.style.opacity = 1 - obj.t;
          moonBackground.style.opacity = obj.t;
        },
        easing: "easeInOutSine",
        duration: 500,
      });
    });

    renderer.setAnimationLoop(() => {
      let delta = clock.getDelta();

      planesData.forEach((planesData) => {
        let plane = planesData.group;
        plane.position.set(0, 0, 0);
        plane.rotation.set(0, 0, 0);
        plane.updateMatrixWorld();

        planesData.rot += delta * 0.25;
        plane.rotateOnAxis(planesData.randomAxis, planesData.randomAxisRot);
        plane.rotateOnAxis(new THREE.Vector3(0, 1, 0), planesData.rot);
        plane.rotateOnAxis(new THREE.Vector3(0, 0, 1), planesData.rad);
        plane.translateY(planesData.yOff);
        plane.rotateOnAxis(new THREE.Vector3(1, 0, 0), +Math.PI * 0.5);
      });

      controls.update();

      renderer.render(scene, camera);

      if (ring1) {
        ring1.rotation.x = ring1.rotation.x * 0.95 + mousePos.y * 0.05 * 1.2;
        ring1.rotation.y = ring1.rotation.y * 0.95 + mousePos.x * 0.05 * 1.2;
      }

      if (ring2) {
        ring2.rotation.x = ring2.rotation.x * 0.95 + mousePos.y * 0.05 * 0.375;
        ring2.rotation.y = ring2.rotation.y * 0.95 + mousePos.x * 0.05 * 0.375;
      }

      if (ring3) {
        ring3.rotation.x = ring3.rotation.x * 0.95 - mousePos.y * 0.05 * 0.275;
        ring3.rotation.y = ring3.rotation.y * 0.95 - mousePos.x * 0.05 * 0.275;
      }

      renderer.autoClear = false;
      renderer.render(ringsScene, ringsCamera);
      renderer.autoClear = true;
    });

    return () => {
      renderer.dispose();
    };
  }, []);

  function makePlane(planeMesh, trailTexture, envMap, scene) {
    let plane = planeMesh.clone();
    plane.scale.set(0.001, 0.001, 0.001);
    plane.position.set(0, 0, 0);
    plane.rotation.set(0, 0, 0);
    plane.updateMatrixWorld();

    plane.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.material.envMap = envMap;
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    let group = new THREE.Group();
    group.add(plane);
    scene.add(group);

    return {
      group: group,
      rot: Math.random() * Math.PI * 2.0,
      rad: Math.random() * Math.PI * 0.45 + 0.2,
      yOff: 10.5 + Math.random() * 1.0,
      randomAxis: new THREE.Vector3(nr(), nr()).normalize(),
      randomAxisRot: Math.random() * Math.PI * 2,
    };
  }

  function nr() {
    return Math.random() * 2 - 1;
  }

  return (
    <>
      <div className="sun-background"></div>
      <div className="moon-background"></div>
      <div ref={canvasRef} className="canvas-container"></div>
    </>
  );
}
