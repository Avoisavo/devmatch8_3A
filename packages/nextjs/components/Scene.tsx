"use client";

import React, { Suspense, useEffect, useState } from "react";
import Character from "./Character";
import { Environment, OrbitControls, PerspectiveCamera, useFBX } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

interface LazyModelProps {
  Component: React.ComponentType<any>;
  props: {
    modelPath?: string;
    position?: number[];
    rotation?: number[];
    scale?: number;
    [key: string]: any;
  };
  onLoaded?: () => void;
}

function LazyModel({ Component, props, onLoaded }: LazyModelProps) {
  // Always call the hook, but conditionally pass the modelPath
  const modelPath = props.modelPath && props.modelPath.endsWith(".fbx") ? props.modelPath : undefined;
  const model = useFBX(modelPath as string);
  const loaded = !!model;

  useEffect(() => {
    if (onLoaded && loaded) onLoaded();
  }, [onLoaded, loaded]);

  if (model) {
    return <primitive object={model} {...props} />;
  }
  // Pass all props to the Component, including speechBubblePath
  return <Component {...props} />;
}

const characterModels = [
  {
    Component: Character,
    props: {
      modelPath: "/models/characters/Casual_Male.fbx",
      animationPath: "/models/characters/animations/WalkingForCasualMale.fbx",
      idleAnimationPath: "/models/characters/animations/IdleCasualMale.fbx",
      talkingAnimationPath: "/models/characters/animations/TalkingForCasualMale.fbx",
      speechBubblePath: "/models/characters/speechbubble1.fbx",
      position: [0, 0.5, 0],
      rotation: [0, Math.PI / 4, 0],
      scale: 0.01,
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
      position: [3, 0.5, 0],
      rotation: [0, -Math.PI / 4, 0],
      scale: 0.01,
    },
  },
  {
    Component: Character,
    props: {
      modelPath: "/models/characters/Casual2_Male.fbx",
      animationPath: "/models/characters/animations/WalkingForCasualMale.fbx",
      idleAnimationPath: "/models/characters/animations/IdleCasualMale.fbx",
      talkingAnimationPath: "/models/characters/animations/TalkingForCasualMale.fbx",
      speechBubblePath: "/models/characters/speechbubble1.fbx",
      position: [-3, 0.5, 0],
      rotation: [0, Math.PI / 2, 0],
      scale: 0.01,
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
      position: [0, 0.5, 3],
      rotation: [0, -Math.PI / 2, 0],
      scale: 0.01,
    },
  },
];

export default function Scene() {
  const [charactersToShow, setCharactersToShow] = useState(0);

  // Sequential loading for characters
  const handleCharacterLoaded = () => setCharactersToShow(charactersToShow + 1);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        <Suspense fallback={null}>
          {characterModels.slice(0, charactersToShow + 1).map(({ Component, props }, i) => (
            <LazyModel key={i} Component={Component} props={props} onLoaded={handleCharacterLoaded} />
          ))}
        </Suspense>

        <PerspectiveCamera makeDefault position={[10, 10, 10]} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={5} maxDistance={50} />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
}
