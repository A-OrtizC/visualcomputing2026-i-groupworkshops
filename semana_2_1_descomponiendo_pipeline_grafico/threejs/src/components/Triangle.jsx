import { useMemo, useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useControls } from "leva"

export default function Triangle() {

  const meshRef = useRef()
  const { gl } = useThree()

  // 🔥 Activar clipping en el renderer
  useEffect(() => {
    gl.localClippingEnabled = true
  }, [gl])

  const { wireframe, backFaceCulling, clipping, fragments } = useControls({
    wireframe: false,
    backFaceCulling: true,
    clipping: false,
    fragments: false
  })

  // 🔺 Geometría manual (primitiva)
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()

    const vertices = new Float32Array([
      -1, -1, 0,
       1, -1, 0,
       0,  1, 0
    ])

    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3))
    return geo
  }, [])

  // ✂ Plano matemático de clipping (x = 0.3)
  const clippingPlane = useMemo(() => {
    return new THREE.Plane(new THREE.Vector3(1, 0, 0), -0.3)
  }, [])

  // 🎨 Shader con soporte real de clipping
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: backFaceCulling ? THREE.FrontSide : THREE.DoubleSide,
      wireframe: wireframe,
      clippingPlanes: clipping ? [clippingPlane] : [],
      clipping: true,
      uniforms: {
        showFragments: { value: fragments }
      },
      vertexShader: `
        varying vec3 vPosition;

        #include <clipping_planes_pars_vertex>

        void main() {
          vPosition = position;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          #include <clipping_planes_vertex>
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        uniform bool showFragments;

        #include <clipping_planes_pars_fragment>

        void main() {

          #include <clipping_planes_fragment>

          if(showFragments){
            gl_FragColor = vec4(abs(vPosition), 1.0);
          } else {
            gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0);
          }
        }
      `
    })
  }, [wireframe, backFaceCulling, clipping, fragments, clippingPlane])

  // 🔄 Rotación animada
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <>
      {/* 🔺 Triángulo */}
      <mesh ref={meshRef} geometry={geometry} material={material} />

      {/* 🔴 Plano visual que representa el clipping */}
      {clipping && (
        <mesh
          position={[0.3, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[4, 4]} />
          <meshBasicMaterial
            color="red"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </>
  )
}
