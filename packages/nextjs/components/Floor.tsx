"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Character from "./Character";
import { Environment, OrbitControls, PerspectiveCamera, useCursor, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box3, BoxGeometry, Group, Vector3 } from "three";

interface FloorProps {
  scale?: [number, number, number];
  gatherAndTalk?: boolean;
}

interface ModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
}

// Keyboard controls hook
const useKeyboardControls = () => {
  const { camera } = useThree();
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    e: false,
  });

  const isTypingTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || target.isContentEditable) return true;
    const active = document.activeElement as HTMLElement | null;
    if (active) {
      const activeTag = active.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || active.isContentEditable) return true;
    }
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const speed = 0.5;
    const direction = new Vector3();

    if (keys.current.w) direction.z -= speed;
    if (keys.current.s) direction.z += speed;
    if (keys.current.a) direction.x -= speed;
    if (keys.current.d) direction.x += speed;
    if (keys.current.q) direction.y += speed;
    if (keys.current.e) direction.y -= speed;

    direction.applyQuaternion(camera.quaternion);
    camera.position.add(direction);
  });
};

const KeyboardControls: React.FC = () => {
  useKeyboardControls();
  return null;
};

// Character models array
const characterModels = [
  {
    Component: Character,
    props: {
      modelPath: "/models/characters/Casual_Male.fbx",
      animationPath: "/models/characters/animations/WalkingForCasualMale.fbx",
      idleAnimationPath: "/models/characters/animations/IdleCasualMale.fbx",
      talkingAnimationPath: "/models/characters/animations/TalkingForCasualMale.fbx",
      speechBubblePath: "/models/characters/speechbubble1.fbx",
      position: [0, 0, 6],
      rotation: [0, Math.PI / 4, 0],
      scale: 0.02,
      gatherPosition: [0, 0, 10],
    },
  },
  {
    Component: Character,
    props: {
      modelPath: "/models/characters/Casual_Female.fbx",
      animationPath: "/models/characters/animations/WalkingForCasualFemale.fbx",
      idleAnimationPath: "/models/characters/animations/IdleCasualFemale.fbx",
      talkingAnimationPath: "/models/characters/animations/TalkingForCasualFemale.fbx",
      speechBubblePath: "/models/characters/speechbubble2.fbx",
      position: [0, 0, 6],
      rotation: [0, -Math.PI / 4, 0],
      scale: 0.02,
      gatherPosition: [-4, 0, 2],
    },
  },
  {
    Component: Character,
    props: {
      modelPath: "/models/characters/Casual3_Female.fbx",
      animationPath: "/models/characters/animations/WalkingForCasualFemale3.fbx",
      idleAnimationPath: "/models/characters/animations/IdleCasualFemale3.fbx",
      talkingAnimationPath: "/models/characters/animations/TalkingForCasualFemale3.fbx",
      speechBubblePath: "/models/characters/speechbubble3.fbx",
      position: [0, 0, 6],
      rotation: [0, -Math.PI / 2, 0],
      scale: 0.02,
      gatherPosition: [4, 0, 2],
    },
  },
];

// Furniture Models (used ones only)
const TableModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/table.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[0.8, 0.8, 0.8]} {...props} />;
};
const RugModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/rugRounded.glb");
  return <primitive object={scene} position={[1.5, 0.01, 1.5]} scale={[1, 1, 1]} {...props} />;
};
const PlantModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/plantSmall1.glb");
  return <primitive object={scene} position={[5, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const ChairCushionModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/chairCushion.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const BookcaseClosedDoorsModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/bookcaseClosedDoors.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const PottedPlantModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/pottedPlant.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const CabinetTelevisionModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/cabinetTelevision.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const TelevisionVintageModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/televisionVintage.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const LampRoundFloorModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/lampRoundFloor.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const LaptopModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/laptop.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const TableClothModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/tableCloth.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const LoungeSofaModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/loungeSofa.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const DeskModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/desk.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenFridgeSmallModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenFridgeSmall.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[0.75, 0.65, 0.75]} {...props} />;
};
const BooksModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/books.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const Books2Model: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/books2.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const LampRoundTableModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/lampRoundTable.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[0.65, 0.65, 0.65]} {...props} />;
};
const KitchenCoffeeMachineModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenCoffeeMachine.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[0.7, 0.7, 0.7]} {...props} />;
};
const PlantSmall2Model: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/plantSmall2.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenBarModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenBar.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenBar2Model: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenBar2.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenBar3Model: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenBar3.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenBarEndModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenBarEnd.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenFridgeModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenFridge.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenCabinetUpperDoubleModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenCabinetUpperDouble.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenCabinetUpperDouble2Model: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenCabinetUpperDouble2.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenCabinetUpperCornerModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenCabinetUpperCorner.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenCabinetUpperModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenCabinetUpper.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenCabinetUpper2Model: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenCabinetUpper2.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenSinkModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenSink.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const RugRectangleModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/rugRectangle.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1.3]} {...props} />;
};
const TableRoundModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/tableRound.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[0.85, 0.85, 0.85]} {...props} />;
};
const ChairRoundedModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/chairRounded.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const ChairRounded2Model: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/chairRounded2.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const PlantSmall3Model: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/plantSmall3.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const RadioModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/radio.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[0.9, 0.9, 0.9]} {...props} />;
};
const BearModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/bear.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenCabinetCornerInnerModel: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenCabinetCornerInner.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};
const KitchenCabinetDrawer1Model: React.FC<ModelProps> = props => {
  const { scene } = useGLTF("/models/furnitures/kitchenCabinetDrawer 1.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={[1, 1, 1]} {...props} />;
};

// Clickable wrapper that adds a black border overlay and navigates to chat summaries
const ClickableBooks: React.FC<{
  gltfPath: string;
  position: [number, number, number];
  rotation?: [number, number, number];
}> = ({ gltfPath, position, rotation = [0, 0, 0] }) => {
  const { scene } = useGLTF(gltfPath);
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const { boxSize, boxCenter } = useMemo(() => {
    const bbox = new Box3().setFromObject(scene);
    const size = new Vector3();
    bbox.getSize(size);
    const center = new Vector3();
    bbox.getCenter(center);
    return { boxSize: size, boxCenter: center };
  }, [scene]);

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => router.push("/chat-summaries")}
    >
      <primitive object={scene} />
      {/* Invisible hitbox to make clicking reliable across the whole book volume */}
      <mesh
        position={[boxCenter.x, boxCenter.y, boxCenter.z] as [number, number, number]}
        // events bubble to the parent group handlers
      >
        <boxGeometry args={[boxSize.x * 1.1, boxSize.y * 1.1, boxSize.z * 1.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* 3D border aligned to the book's bounding box; slightly padded */}
      <lineSegments position={[boxCenter.x, boxCenter.y, boxCenter.z] as [number, number, number]} visible>
        <edgesGeometry args={[new BoxGeometry(boxSize.x * 1.08, boxSize.y * 1.08, boxSize.z * 1.08)]} />
        <lineBasicMaterial color={"black"} linewidth={2} transparent opacity={hovered ? 1 : 0.8} />
      </lineSegments>
    </group>
  );
};
>>>>>>> 31d0cca9560144b41f8327a3004cecb8aea6556c
const RoomGeometry: React.FC<FloorProps> = ({ scale = [1, 1, 1] }) => {
  const floorRef = useRef<Group>(null);

  return (
    <group ref={floorRef} scale={scale}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0, 5]}>
        <planeGeometry args={[50, 40]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[5, 7.5, -15]}>
        <planeGeometry args={[50, 15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Side Wall */}
      <mesh position={[-20, 7.5, 5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[40, 15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Furniture Setup */}
      <TableModel position={[-15, 0, -11]} rotation={[0, Math.PI, 0]} />
      <RugModel position={[28, 0.01, -9]} />
      <ChairCushionModel position={[-10, 0, -10]} rotation={[0, Math.PI / 20, 0]} />
      <BookcaseClosedDoorsModel position={[-8, 0, -12]} rotation={[0, Math.PI, 0]} />
      <PlantModel position={[19, 3.3, -5]} />
      <PottedPlantModel position={[28, 0, -14]} />
      <CabinetTelevisionModel position={[15.5, 0, -12]} rotation={[0, Math.PI, 0]} />
      <TelevisionVintageModel position={[17.5, 3.2, -12]} rotation={[0, Math.PI, 0]} />
      <LampRoundFloorModel position={[-17, 0, -13]} />
      <LaptopModel position={[-13, 2.8, -11.5]} rotation={[0, Math.PI, 0]} />
      <TableClothModel position={[15.8, 0, -2.3]} rotation={[0, Math.PI / 1, 0]} />
      <LoungeSofaModel position={[25, 0, 2]} rotation={[0, Math.PI / 100000000, 0]} />
      <DeskModel position={[22, 0, 5.5]} rotation={[0, Math.PI / 100000000000, 0]} />
      <KitchenFridgeSmallModel position={[22.2, 0, 8.2]} rotation={[0, Math.PI, 0]} />
      <ClickableBooks gltfPath="/models/furnitures/books.glb" position={[19, 3.85, 7]} rotation={[0, Math.PI, 0]} />
      <ClickableBooks gltfPath="/models/furnitures/books2.glb" position={[18, 3.85, 7]} rotation={[0, Math.PI, 0]} />
      <LampRoundTableModel position={[21.2, 3.85, 6]} rotation={[0, Math.PI / 4, 0]} />
      <KitchenCoffeeMachineModel position={[-17, 4.3, 14.6]} rotation={[0, Math.PI / -2, 0]} />
      <PlantSmall2Model position={[17, 4, 7.5]} rotation={[0, Math.PI / 6, 0]} />
      <KitchenBarModel position={[-20, 0, -1]} rotation={[0, Math.PI / 2, 0]} />
      <KitchenBar2Model position={[-20, 0, -5]} rotation={[0, Math.PI / 2, 0]} />
      <KitchenBar3Model position={[-20, 0, -9]} rotation={[0, Math.PI / 2, 0]} />
      <KitchenBarEndModel position={[-20, 0, -10]} rotation={[0, Math.PI / 2, 0]} />
      <KitchenFridgeModel position={[-17, 0, 20.6]} rotation={[0, Math.PI / -2, 0]} />
      <KitchenCabinetUpperDoubleModel position={[-18, 8, 5]} rotation={[0, Math.PI / -2, 0]} />
      <KitchenCabinetUpperDouble2Model position={[-18, 8, 1]} rotation={[0, Math.PI / -2, 0]} />
      <KitchenCabinetUpperCornerModel position={[-18, 8, -5.4]} rotation={[0, Math.PI / 10000000, 0]} />
      <KitchenCabinetUpperModel position={[-18, 8, 9]} rotation={[0, Math.PI / -2, 0]} />
      <KitchenCabinetUpper2Model position={[-18, 8, 13]} rotation={[0, Math.PI / -2, 0]} />
      <KitchenCabinetCornerInnerModel position={[-15.5, 0, 11.8]} rotation={[0, Math.PI / 10000000, 0]} />
      <KitchenCabinetDrawer1Model position={[-15.5, 0, 11.8]} rotation={[0, Math.PI / -2, 0]} />
      <KitchenSinkModel position={[-15.5, 0, 7.5]} rotation={[0, Math.PI / -2, 0]} />
      <RugRectangleModel position={[-10, 0.01, -6]} rotation={[0, Math.PI / 2, 0]} />
      <TableRoundModel position={[15, 3, 14]} rotation={[0, Math.PI / 6, 0]} />
      <ChairRoundedModel position={[12, 0, 20]} rotation={[0, -Math.PI / 4, 0]} />
      <ChairRounded2Model position={[16, 0, 16]} rotation={[0, Math.PI / 2, 0]} />
      <PlantSmall3Model position={[15, 3.8, 18]} rotation={[0, Math.PI / 6, 0]} />
      <RadioModel position={[15, 4, 18.5]} rotation={[0, Math.PI / 6, 0]} />
      <BearModel position={[10, 7, -13]} rotation={[0, Math.PI / 1, 0]} scale={[0.8, 0.8, 0.8]} />
    </group>
  );
};

const Floor: React.FC<FloorProps> = props => {
  // Render all characters at once

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
      <Canvas
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: "default" }}
        dpr={1}
        shadows
      >
        <KeyboardControls />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />

        <RoomGeometry {...props} />

        {/* Character Models */}
        <Suspense fallback={null}>
          {characterModels.map(({ props: modelProps }, i) => {
            const {
              position: pos = [0, 0, 0],
              rotation: rot = [0, 0, 0],
              gatherPosition,
              modelPath,
              animationPath,
              idleAnimationPath,
              talkingAnimationPath,
              speechBubblePath,
              scale,
            } = modelProps as any;
            const pos3 = [pos[0] ?? 0, pos[1] ?? 0, pos[2] ?? 0] as [number, number, number];
            const rot3 = [rot[0] ?? 0, rot[1] ?? 0, rot[2] ?? 0] as [number, number, number];
            const gatherPos3 =
              gatherPosition && gatherPosition.length === 3
                ? ([gatherPosition[0], gatherPosition[1], gatherPosition[2]] as [number, number, number])
                : undefined;
            return (
              <Character
                key={i}
                modelPath={modelPath}
                animationPath={animationPath}
                idleAnimationPath={idleAnimationPath}
                talkingAnimationPath={talkingAnimationPath}
                speechBubblePath={speechBubblePath}
                scale={scale}
                position={pos3}
                rotation={rot3}
                gatherAndTalk={props.gatherAndTalk}
                {...(gatherPos3 ? { gatherPosition: gatherPos3 } : {})}
              />
            );
          })}
        </Suspense>

        <PerspectiveCamera makeDefault position={[25, 25, 25]} fov={60} />
        <OrbitControls enablePan enableZoom enableRotate minDistance={8} maxDistance={50} maxPolarAngle={Math.PI / 2} />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
};

export default Floor;
