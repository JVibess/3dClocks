import React, { useEffect } from "react";
import "./ClockTwo.css";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import back from "../../Assets/cannon_1k_blurred.hdr";

export default function ClockTwo() {
  useEffect(() => {
    let scene = new THREE.Scene();
    scene.background = new THREE.Color("Black");

    let camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild(renderer.domElement);

    let controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);

    let mousePos = new THREE.Vector2(0, 0);

    window.addEventListener("mousemove", (e) => {
      let x = e.clientX - window.innerWidth * 0.5;
      let y = e.clientY - window.innerHeight * 0.5;

      mousePos.x = x * 0.001;
      mousePos.y = y * 0.001;
    });

    async function init() {
      let pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();

      let envHdrTexture = await new RGBELoader().loadAsync(back);
      let envRt = pmrem.fromEquirectangular(envHdrTexture).texture;

      scene.environment = envRt;

      let ring1 = CustomRing(envRt, 0.65, "white");
      ring1.scale.set(0.75, 0.75);
      scene.add(ring1);

      let ring2 = CustomRing(envRt, 0.35, new THREE.Color(0.25, 0.225, 0.215));
      ring2.scale.set(1.05, 1.05);
      scene.add(ring2);

      let ring3 = CustomRing(envRt, 0.15, new THREE.Color(0.7, 0.7, 0.7));
      ring3.scale.set(1.3, 1.3);
      scene.add(ring3);

      let hourLine = CustomLine(0.4, 0.135, 0.07, envRt, "white", 3);
      scene.add(hourLine);

      let minutesLine = CustomLine(
        0.8,
        0.135,
        0.07,
        envRt,
        new THREE.Color(0.5, 0.5, 0.5),
        1
      );
      scene.add(minutesLine);
      let secondsLine = CustomLine(
        1,
        0.135,
        0.07,
        envRt,
        new THREE.Color(0.2, 0.2, 0.2),
        1
      );
      scene.add(secondsLine);

      let cLines = clockLines(envRt);
      scene.add(cLines);

      renderer.setAnimationLoop(() => {
        ring1.rotation.x = ring1.rotation.x * 0.95 + mousePos.y * 1.2 * 0.05;
        ring1.rotation.y = ring1.rotation.y * 0.95 + mousePos.x * 1.2 * 0.05;

        ring2.rotation.x = ring2.rotation.y * 0.95 + mousePos.y * 0.375 * 0.05;
        ring2.rotation.y = ring2.rotation.y * 0.95 + mousePos.x * 0.375 * 0.05;

        ring3.rotation.x = ring3.rotation.y * 0.95 - mousePos.y * 0.275 * 0.05;
        ring3.rotation.y = ring3.rotation.y * 0.95 - mousePos.x * 0.275 * 0.05;

        let date = new Date();
        let hourAngle = (date.getHours() / 12) * Math.PI * 2;
        rotateLine(hourLine, hourAngle, ring1.rotation, 1.0, 0);

        let minutesAngle = (date.getMinutes() / 60) * Math.PI * 2;
        minutesLine.rotation.z = -minutesAngle;
        rotateLine(minutesLine, minutesAngle, ring1.rotation, 0.8, 0.1);

        let secondsAngle = (date.getSeconds() / 60) * Math.PI * 2;
        secondsLine.rotation.z = -secondsAngle;
        rotateLine(secondsLine, secondsAngle, ring1.rotation, 0.75, -0.1);

        cLines.children.forEach((c, i) => {
          rotateLine(c, (i / 12) * Math.PI * 2, ring1.rotation, 1.72, 0.2);
        });
        controls.update();
        renderer.render(scene, camera);
      });
    }

    function rotateLine(
      line,
      angle,
      ringRotation,
      topTranslation,
      depthTranslation
    ) {
      let tmatrix = new THREE.Matrix4().makeTranslation(
        0,
        topTranslation,
        depthTranslation
      );
      let rmatrix = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 0, 1),
        -angle
      );
      let rimatrix = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler().copy(ringRotation)
      );

      line.matrix.copy(
        new THREE.Matrix4()
          .multiply(rimatrix)
          .multiply(rmatrix)
          .multiply(tmatrix)
      );
      line.matrixAutoUpdate = false;
      line.matrixWorldNeedsUpdate = false;
    }

    function CustomRing(envRt, thickness, color) {
      let ring = new THREE.Mesh(
        new THREE.RingGeometry(2, 2 + thickness, 70),
        new THREE.MeshStandardMaterial({
          envMap: envRt.texture,
          roughness: 0,
          metalness: 1,
          side: THREE.DoubleSide,
          color: color === "black" ? new THREE.Color(0, 0, 0) : color,
          envMapIntensity: 1,
        })
      );
      let outerCylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(
          2 + thickness,
          2 + thickness,
          0.25,
          70,
          1,
          true
        ),
        new THREE.MeshStandardMaterial({
          envMap: envRt.texture,
          roughness: 0,
          metalness: 1,
          side: THREE.DoubleSide,
          color,
          envMapIntensity: 1,
        })
      );

      let innerCylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 0.25, 140, 1, true),
        new THREE.MeshStandardMaterial({
          envMap: envRt.texture,
          roughness: 0,
          metalness: 1,
          side: THREE.DoubleSide,
          color,
          envMapIntensity: 1,
        })
      );

      innerCylinder.rotation.x = Math.PI * 0.5;

      outerCylinder.rotation.x = Math.PI * 0.5;
      let group = new THREE.Group();
      group.add(ring, outerCylinder, innerCylinder);
      ring.position.set(0, 0, 0.25 * 0.5);

      return group;
    }

    function CustomLine(height, width, depth, envRt, color, envMapIntensity) {
      let box = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({
          envMap: envRt.texture,
          roughness: 0,
          metalness: 1,
          side: THREE.DoubleSide,
          color,
          envMapIntensity,
        })
      );
      box.position.set(0, 0, 0);

      let topCap = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.5, width * 0.5, depth, 10),
        new THREE.MeshStandardMaterial({
          envMap: envRt.texture,
          roughness: 0,
          metalness: 1,
          side: THREE.DoubleSide,
          color,
          envMapIntensity,
        })
      );
      topCap.rotation.x = Math.PI * 0.5;
      topCap.position.set(0, +height * 0.5, 0);

      let bottomCap = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.5, width * 0.5, depth, 10),
        new THREE.MeshStandardMaterial({
          envMap: envRt.texture,
          roughness: 0,
          metalness: 1,
          side: THREE.DoubleSide,
          color,
          envMapIntensity,
        })
      );
      bottomCap.rotation.x = Math.PI * 0.5;
      bottomCap.position.set(0, -height * 0.5, 0);

      let group = new THREE.Group();
      group.add(box, topCap, bottomCap);

      return group;
    }

    function clockLines(envRt) {
      let group = new THREE.Group();

      for (let i = 0; i < 12; i++) {
        let line = CustomLine(
          0.1,
          0.075,
          0.025,
          envRt,
          new THREE.Color(0.65, 0.65, 0.65),
          1
        );
        group.add(line);
      }
      return group;
    }
    init();

    return () => {
      renderer.dispose();
    };
  }, []);

  return null;
}
