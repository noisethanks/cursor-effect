import * as THREE from "three";
import img from "./img.jpg"
import {TweenMax} from 'gsap'
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// camera.position.z = 1;
var renderer = new THREE.WebGLRenderer();
var planematerial
let TEXTURE = new THREE.TextureLoader().load(img,
function(texture){
    console.log("textureloaded")
    planematerial = new THREE.MeshBasicMaterial({
        map:texture
    })
    let mesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(4,3,1,1), 
        planematerial
    )
    scene.add(mesh)
    console.log(planematerial)
    function animate() {
        requestAnimationFrame( animate );
    
        renderer.render( scene, camera );
    }
    animate();
    
    var mouse = new THREE.Vector2(0, 0)
    window.addEventListener('mousemove', function(ev){
        onMouseMove(ev)
    })
    
    
    function onMouseMove(event) {
        TweenMax.to(mouse, 0.5, {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1,
        })
        console.log(mouse)
        TweenMax.to(mesh.rotation, 0.5, {
            x: -mouse.y * 1.2,
            y: mouse.x * (Math.PI / 6)* 5
        })
    }
},undefined,
(err)=>{
console.log("an err happened", err)
}
); 
camera.position.z = 4;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

