import * as THREE from "three";
import {gsap} from "gsap"; 
import img from "./img.jpg"
import img2 from "./img2.jpg"
import {TweenMax} from 'gsap'
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );

var mouse = new THREE.Vector2(0, 0)
document.body.addEventListener('mousemove', (ev) => { onMouseMove(ev) })
function onMouseMove(event) {
	TweenMax.to(mouse, 0.5, {
		x: (event.clientX / window.innerWidth) * 2 - 1,
		y: -(event.clientY / window.innerHeight) * 2 + 1,
    })
    // console.log(mouse);
}

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
        uniform vec2 u_res;
        uniform vec2 u_mouse;
        uniform float u_time;

        float circle(in vec2 _st, in float _radius, in float blurriness){
            vec2 dist = _st;
            return 1.-smoothstep(_radius-(_radius*blurriness), _radius+(_radius*blurriness), dot(dist,dist)*4.0);
        }
        void main(){
            vec2 res = u_res;
            vec2 st = gl_FragCoord.xy / res.xy - vec2(0.5);
            st.y *= u_res.y / u_res.x;
            vec2 mouse = u_mouse*0.5;
            mouse *= -1.;
            vec2 circlePos = st + mouse;

            float c = circle(circlePos, .003,0.);

            // float n = snoise2(vec2(v_uv.x,v_uv.y));

            vec2 uv = v_uv;
            vec4 _currentImage;
            float intensity = 0.3;
            vec4 orig1 = texture2D(currentImage, uv);
            // _currentImage = texture2d(currentImage,vec2(uv.x,uv.y));
            // vec4 finalTexture = _currentImage;
            // gl_FragColor = orig1;
            gl_FragColor = vec4(vec3(c),1.);
        }
        `;
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);

let loader = new THREE.TextureLoader();
loader.crossOrigin = "anonymous";
var image = loader.load(img)
var image2 = loader.load(img2)
var uniforms =  {
    currentImage : {
        type: "t", value: image,
        // dispFactor :{type : "f", value: 0.0}
    },
    nextImage : {
        type: "t", value: image2
    },
    u_mouse: {type: "t",value: mouse},
    u_time: {value: 0},
    u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};
let mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertex,
    fragmentShader : fragment,
    defines: {
        PR: window.devicePixelRatio.toFixed(1)
   }
    // transparent: true,
    // opacity: 1.0
})
let geometry = new THREE.PlaneBufferGeometry(window.innerWidth,window.innerHeight,)

let object = new THREE.Mesh(geometry, mat);

function update() {
	uniforms.u_time.value += 0.01
}
// object.position.set(0,0,0);
scene.add(object);
let animate = function() {
    requestAnimationFrame(animate);
    update()
    renderer.render(scene, camera);
};
animate();

document.body.appendChild( renderer.domElement );

