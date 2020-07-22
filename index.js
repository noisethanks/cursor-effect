import * as THREE from "three";
import {gsap} from "gsap"; 
import img from "./img.jpg"
import img2 from "./img2.jpg"
import {TweenMax} from 'gsap';
import { VideoTexture } from "three";

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
        uniform sampler2D hoverImage;
        uniform vec2 u_res;
        uniform vec2 u_mouse;
        uniform float u_time;

        vec3 mod289(vec3 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }
          
          vec4 mod289(vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }
          
          vec4 permute(vec4 x) {
               return mod289(((x*34.0)+1.0)*x);
          }
          
          vec4 taylorInvSqrt(vec4 r)
          {
            return 1.79284291400159 - 0.85373472095314 * r;
          }

        float snoise3(vec3 v)
        {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;

        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        //   x0 = x0 - 0.0 + 0.0 * C.xxx;
        //   x1 = x0 - i1  + 1.0 * C.xxx;
        //   x2 = x0 - i2  + 2.0 * C.xxx;
        //   x3 = x0 - 1.0 + 3.0 * C.xxx;
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

        // Permutations
        i = mod289(i);
        vec4 p = permute( permute( permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

        //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                        dot(p2,x2), dot(p3,x3) ) );
        }

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

            float c = circle(circlePos, 0.05,1.8)*2.5;

            float offx = v_uv.x + sin(v_uv.y + u_time * .1);
	        float offy = v_uv.y - u_time * 0.1 - cos(u_time * .001) * .01;

            float n = snoise3(vec3(offx, offy, u_time * .5) * 4.) - 1.;
            vec4 color  = vec4(0.4,0.4,0.4,0.2);
            vec2 uv = v_uv;
            vec4 _currentImage;
            vec4 _hoverImage;
            float intensity = 0.3;
            // _currentImage = texture2D(currentImage, uv);
            // _hoverImage = texture2D(hoverImage,uv);
            float r = abs(sin(u_time))*v_uv.x*v_uv.y;
            float g = abs(sin(u_time))*v_uv.x*(v_uv.y);
            float b = abs(cos(u_time))*v_uv.x*(v_uv.y);
            _hoverImage = vec4(r,g,b,0.7);
            _currentImage  = vec4(0.0,0.0,0.0,0.0);
            float finalMask = smoothstep(0.4, 0.5, n + c);
            vec4 finalImage = mix(_currentImage,_hoverImage,finalMask);
            gl_FragColor = finalImage;
        }
        `;

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x23272A );
var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
camera.position.z = 1;
scene.add( camera );


var mouse = new THREE.Vector2(0, 0)
document.body.addEventListener('mousemove', (ev) => { onMouseMove(ev) })
function onMouseMove(event) {
	TweenMax.to(mouse, 0.5, {
		x: (event.clientX / window.innerWidth) * 2 - 1,
		y: -(event.clientY / window.innerHeight) * 2 + 1,
    })
    // console.log(mouse);
}

var video = document.createElement("video")
video.src = 'https://elp-media-public.s3-us-west-1.amazonaws.com/splash.m4v';
video.id = "video";
video.style = "width:100%;height:100%;display:none";
// video.style = "width:100%;height:100%";
// video.play();

document.body.appendChild(video)

// var videoTexture = THREE.VideoTexture(video);
// console.log(videoTexture)

var renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize( window.innerWidth, window.innerHeight);

let loader = new THREE.TextureLoader();
loader.crossOrigin = "anonymous";
var image = loader.load(img)
var image2 = loader.load(img2)

var uniforms =  {
    // currentImage : {
    //     type: "t", value: image,
    //     // dispFactor :{type : "f", value: 0.0}
    // },
    // hoverImage : {
    //     type: "t", value: image2
    // },
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
scene.add(object);

function update() {
	uniforms.u_time.value += 0.01
}
// object.position.set(0,0,0);

let animate = function() {

    requestAnimationFrame(animate);
    update()
    renderer.render(scene, camera);

};
animate();

document.body.appendChild( renderer.domElement );

