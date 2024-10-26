import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import hologramVertexShader from './Shaders/vertex.glsl'
import hologramFragmentShader from './Shaders/fragment.glsl'
import overlayVertexShader from './Shaders/Overlay/vertex.glsl'
import overlayFragmentShader from './Shaders/Overlay/fragment.glsl'


/**
 * Loaders
 */
// Loading
const loaderElement = document.querySelector('.loading')
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        gsap.delayedCall(1, () => {

            loaderElement.style.display = 'none'

            gsap.to(
                overlayMaterial.uniforms.uAlpha, 
                { duration: 1.5, value: 0, delay: 0.5 }
            )

            window.setTimeout(() => {
                if (car) {
                    car.visible = true
                }    
            }, 800)

            window.setTimeout(() => {
                initGUI()
            }, 2000)
        })
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => 
    {
        loaderElement.style.display = 'block'
    }
)

const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Base
 */
// Debug
let debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    vertexShader: overlayVertexShader,
    fragmentShader: overlayFragmentShader,
    uniforms: {
        uAlpha: new THREE.Uniform(1)
    },
    transparent: true,
    depthWrite: false,
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Material
 */
debugObject.colorCar = '#ff0066'
const materialCar = new THREE.ShaderMaterial({
    vertexShader: hologramVertexShader,
    fragmentShader: hologramFragmentShader,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uColor: new THREE.Uniform(new THREE.Color(debugObject.colorCar)),
        glitchStrengthFactor: { value: 0.25 }, // Factor de fuerza del glitch
        sinFactor1: { value: 5.45 },           // Primer multiplicador del sin
        sinFactor2: { value: 10.76 },          // Segundo multiplicador del sin
        smoothstepMin: { value: 0.3 },         // Rango inferior del smoothstep
        smoothstepMax: { value: 1.0 }          // Rango superior del smoothstep
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
})

debugObject.colorBase = '#6d174e'
debugObject.colorBase2 = '#ffa500'

const materialBase = new THREE.MeshPhysicalMaterial({
    metalness: 0.847,
    roughness: 0.352,
    color: debugObject.colorBase,
    transmission: 0.044,
    ior: 1.45,
    transparent: false,
    wireframe: false
})

const materialBase2 = new THREE.MeshPhysicalMaterial({
    metalness: 0.604,
    roughness: 0.255,
    color: debugObject.colorBase2,
    transmission: 0,
    ior: 1.5,
    transparent: false,
    wireframe: false,
})


/**
 * Model
 */
let car 
let carVisible = false

gltfLoader.load(
    'Model/spacecar.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(0.6, 0.6, 0.6)
        scene.add(gltf.scene)

        car = gltf.scene.children.find((child) => child.name === 'Car')
        car.visible = false

        const base = gltf.scene.children.find((child) => child.name === 'Base')
        const base2 = gltf.scene.children.find((child) => child.name === 'Base-2')

        // Material
        car.material = materialCar

        base.material = materialBase
        base.receiveShadow = true
        base.castShadow = true

        base2.material = materialBase2
        base2.receiveShadow = true
        base2.castShadow = true  
    }
)

/**
 * Light
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 2.5)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(-2, 10, - 4)
scene.add(directionalLight)

const directionalLight2 = new THREE.DirectionalLight('#ffffff', 2.5)
directionalLight2.castShadow = true
directionalLight2.shadow.mapSize.set(1024, 1024)
directionalLight2.shadow.camera.far = 15
directionalLight2.shadow.normalBias = 0.05
directionalLight2.position.set(2, - 7, 4)
scene.add(directionalLight2)

// const helper = new THREE.DirectionalLightHelper(directionalLight, 5)
// scene.add(helper)

// const helper2 = new THREE.DirectionalLightHelper(directionalLight2, 5)
// scene.add(helper2)

/**
 * Tweaks
 */
function initGUI()
{
    const gui = new GUI({ width: 325 })

    const carFolder = gui.addFolder('Car Material')

    carFolder
        .addColor(debugObject, 'colorCar')
        .name('Color car')
        .onChange((value) => {
        materialCar.uniforms.uColor.value.set(debugObject.colorCar)
    })
    carFolder
        .add(materialCar.uniforms.glitchStrengthFactor, 'value', 0, 1, 0.01)
        .name('Glitch Intensity')
    carFolder
        .add(materialCar.uniforms.sinFactor1, 'value', 0, 20, 0.01)
        .name('Frequency 1')
    carFolder
        .add(materialCar.uniforms.sinFactor2, 'value', 0, 20, 0.01)
        .name('Frequency 2')
    carFolder
        .add(materialCar.uniforms.smoothstepMin, 'value', 0, 1, 0.01)
        .name('Min Smoothing')
    carFolder
        .add(materialCar.uniforms.smoothstepMax, 'value', 0, 2, 0.01)
        .name('Max Smoothing')

    const baseFolder = gui.addFolder('Base Material')
    baseFolder.add(materialBase, 'metalness', 0, 1, 0.001)
    baseFolder.add(materialBase, 'roughness', 0, 1, 0.001)
    baseFolder.add(materialBase, 'transmission', 0, 1, 0.001)
    baseFolder.add(materialBase, 'ior', 0, 10, 0.001)
    baseFolder.addColor(debugObject, 'colorBase').onChange((value) => {
        materialBase.color.set(value)
    })
    baseFolder.close()

    const base2Folder = gui.addFolder('Base2 Material')
    base2Folder.add(materialBase2, 'metalness', 0, 1, 0.001)
    base2Folder.add(materialBase2, 'roughness', 0, 1, 0.001)
    base2Folder.add(materialBase2, 'transmission', 0, 1, 0.001)
    base2Folder.add(materialBase2, 'ior', 0, 10, 0.001)
    base2Folder.addColor(debugObject, 'colorBase2').onChange((value) => {
        materialBase2.color.set(value)
    })
    base2Folder.close()
}

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Animate
 */
const clock = new THREE.Clock()
const amplitude = 0.5

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Model
    if (car) {
        car.rotation.y = - elapsedTime * 0.3
        car.position.y = 2.7 + amplitude * Math.sin( elapsedTime)
    }

    // Update materials
    materialCar.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()