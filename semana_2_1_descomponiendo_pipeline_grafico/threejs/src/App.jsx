import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import Scene from "./components/Scene"

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }} style={{width: "100vw", height: "100vh"}}>
      <color attach="background" args={["#111111"]} />
      <Scene />
      <OrbitControls />
    </Canvas>
  )
}
