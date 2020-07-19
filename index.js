import * as THREE from "three";
import img from "./img.jpg"
import {TweenMax} from 'gsap'
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );

scene.add( camera );
camera.position.z = 1;
scene.background = new THREE.Color( 0x23272A );
let vertex = `
        varying vec2 v_uv;
        void main() {
          v_uv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `;
let fragment = `
        varying vec2 v_uv;
        uniform sampler2D currentImage;
        void main(){
            vec2 uv = v_uv;
            vec4 _currentImage;
            float intensity = 0.3;
            vec4 orig1 = texture2D(currentImage, uv);
            // _currentImage = texture2d(currentImage,vec2(uv.x,uv.y));
            // vec4 finalTexture = _currentImage;
            gl_FragColor = orig1;
        }
        `;
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth / 2, window.innerHeight /2 );

let loader = new THREE.TextureLoader();
loader.crossOrigin = "anonymous";
var image = loader.load(img)

let mat = new THREE.ShaderMaterial({
    uniforms: {
        currentImage : {
            type: "t", value: image,
            // dispFactor :{type : "f", value: 0.0}
        }
    },
    vertexShader: vertex,
    fragmentShader : fragment,
    // transparent: true,
    // opacity: 1.0
})
let geometry = new THREE.PlaneBufferGeometry(800,600,32)

let object = new THREE.Mesh(geometry, mat);

// object.position.set(0,0,0);
scene.add(object);
let animate = function() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
};
animate();

document.body.appendChild( renderer.domElement );

