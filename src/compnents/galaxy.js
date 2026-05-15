import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { lerp } from "three/src/math/MathUtils.js";

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);
camera.position.set(0, -300, 100);

const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.1,
    0.1,
    0.1
);
composer.addPass(bloomPass);

const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper)

const orbit = new OrbitControls(camera, renderer.domElement);

let r = 0;
let maxdistance = 0;

for (let i = 0; i < 10000; i++) {
    const sphereGeo = new THREE.SphereGeometry(Math.random() * 1/2, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
        emissive: 0xffffff,
        emissiveIntensity: 25
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(20 * (r ** (1/2)) * Math.cos(r) * Math.random(), 20 * (r** (1/2)) * Math.sin(r) * Math.random(), 20 * Math.random());
    let distance = Math.sqrt(sphere.position.x ** 2 + sphere.position.y ** 2);
    let t = distance / 300;
    if (maxdistance < distance) {
        maxdistance = distance
    }
    sphere.material.emissive.setRGB(
        (0.2 - Math.sin(t ** 0.5 % 0.2) * 0.1 + 0.18),
        Math.sin(0.1 - t ** 2),
        (0.1 - Math.sin(t ** 0.2 % 0.2) * 0.1 + 0.18)
    )
    sphere.userData.radius = distance;
    sphere.userData.angle = Math.atan2(sphere.position.y, sphere.position.x);
    sphere.userData.isGalaxy = true;
    sphere.position.z = lerp(5, 40, t) * Math.random();
    sphere.material.color.setRGB(t, 1 - t, 1 - t);
    scene.add(sphere);
    r += 0.008;
}

for (let i = 0; i < 100; i++) {
    const sphereGeo = new THREE.SphereGeometry(2, 13, 13);
    const sphereMat = new THREE.MeshStandardMaterial({
        emissive: 0xffffff,
        emissiveIntensity: 25
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    do {
        sphere.position.set(
            Math.random() < 0.5 ? Math.random() * -3000 : Math.random() * 3000,
            Math.random() < 0.5 ? Math.random() * -3000 : Math.random() * 3000,
            Math.random() < 0.5 ? Math.random() * -3000 : Math.random() * 3000
        )
    } while((Math.sqrt(sphere.position.x ** 2 + sphere.position.y ** 2 + sphere.position.z ** 2)) < 2000);
    scene.add(sphere);
}

let angle = 0.001;

function animate(time) {
    requestAnimationFrame(animate);

    orbit.update();

    if (angle < 0.000001) {
        angle = 0.000001;
    } else {
        angle *= 0.96;
    }

    scene.children.forEach((obj) => {
        if (obj.userData.isGalaxy) {
            obj.userData.angle += lerp(angle, 0, obj.userData.radius);
            obj.position.x = Math.cos(obj.userData.angle) * obj.userData.radius;
            obj.position.y = Math.sin(obj.userData.angle) * obj.userData.radius;
        }
    });

    composer.render();
}

animate(); 
