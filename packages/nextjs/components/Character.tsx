"use client";

import React, { useEffect, useRef, useState } from "react";
import SpeechBubble from "./SpeechBubble";
import { useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { AnimationMixer, Group, Vector3 } from "three";

interface CharacterProps {
  modelPath: string;
  animationPath?: string;
  idleAnimationPath?: string;
  talkingAnimationPath?: string;
  speechBubblePath?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  gatherAndTalk?: boolean;
  gatherPosition?: [number, number, number];
}

const Character: React.FC<CharacterProps> = props => {
  const {
    modelPath,
    animationPath,
    idleAnimationPath,
    talkingAnimationPath,
    speechBubblePath,
    position,
    rotation = [0, 0, 0],
    scale = 1,
    gatherAndTalk,
    gatherPosition,
  } = props;

  const [state, setState] = useState<"walking" | "idle" | "gathering" | "talking">("walking");

  const characterRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);

  const walkDuration = useRef(Math.random() * 3 + 2);
  const idleDuration = useRef(Math.random() * 2 + 1);
  const timer = useRef(0);

  const positionRef = useRef(new Vector3(...position));
  const initialDirection = (() => {
    const v = new Vector3(Math.random() - 0.5, 0, Math.random() - 0.5);
    return v.length() === 0 ? new Vector3(1, 0, 0) : v.normalize();
  })();
  const directionRef = useRef(initialDirection);
  const currentYRotation = useRef(rotation[1] ?? 0);
  const targetYRotation = useRef(rotation[1] ?? 0);
  const rotationSpeed = 0.05;

  const smoothRotate = (current: number, target: number, speed: number): number => {
    let diff = target - current;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    return current + diff * speed;
  };

  // Load main character FBX (hook must be unconditional)
  const fbx = useFBX(modelPath);

  // Optional animations loaded via FBXLoader in effects (not hooks)
  const walkAnimRef = useRef<Group | null>(null);
  const idleAnimRef = useRef<Group | null>(null);
  const talkingAnimRef = useRef<Group | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadOptionalAnimations() {
      const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
      const loader = new FBXLoader();
      const promises: Promise<void>[] = [];

      if (animationPath) {
        promises.push(
          loader.loadAsync(animationPath).then(obj => {
            if (!cancelled) walkAnimRef.current = obj as unknown as Group;
          }),
        );
      }
      if (idleAnimationPath) {
        promises.push(
          loader.loadAsync(idleAnimationPath).then(obj => {
            if (!cancelled) idleAnimRef.current = obj as unknown as Group;
          }),
        );
      }
      if (talkingAnimationPath) {
        promises.push(
          loader.loadAsync(talkingAnimationPath).then(obj => {
            if (!cancelled) talkingAnimRef.current = obj as unknown as Group;
          }),
        );
      }

      await Promise.all(promises);
    }

    loadOptionalAnimations();
    return () => {
      cancelled = true;
    };
  }, [animationPath, idleAnimationPath, talkingAnimationPath]);

  // Setup mixer and play actions based on state
  useEffect(() => {
    if (!fbx) return;

    const mixer = new AnimationMixer(fbx);

    const play = () => {
      mixer.stopAllAction();
      if ((state === "walking" || state === "gathering") && walkAnimRef.current) {
        const anim = (walkAnimRef.current as any).animations?.[0];
        if (anim) mixer.clipAction(anim, fbx).play();
      } else if (state === "idle" && idleAnimRef.current) {
        const anim = (idleAnimRef.current as any).animations?.[0];
        if (anim) mixer.clipAction(anim, fbx).play();
      } else if (state === "talking" && talkingAnimRef.current) {
        const anim = (talkingAnimRef.current as any).animations?.[0];
        if (anim) mixer.clipAction(anim, fbx).play();
      } else if (idleAnimRef.current) {
        // Fallback to idle if requested clip not available
        const anim = (idleAnimRef.current as any).animations?.[0];
        if (anim) mixer.clipAction(anim, fbx).play();
      }
    };

    play();
    mixerRef.current = mixer;

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [fbx, state]);

  // Handle gather/talk transitions
  useEffect(() => {
    if (gatherAndTalk) {
      setState("gathering");
    } else if (state === "gathering" || state === "talking") {
      setState("walking");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gatherAndTalk]);

  const FURNITURE_COLLIDERS = [
    { center: [-15, 0, -11], radius: 2.5 },
    { center: [-10, 0, -10], radius: 1.2 },
    { center: [-8, 0, -12], radius: 2 },
    { center: [19, 3.3, -5], radius: 1 },
    { center: [28, 0, -14], radius: 1 },
    { center: [15.5, 0, -12], radius: 2 },
    { center: [17.5, 3.2, -12], radius: 1 },
    { center: [-17, 0, -13], radius: 1 },
    { center: [25, 0, 2], radius: 3 },
    { center: [22, 0, 5.5], radius: 2 },
    { center: [22.2, 0, 8.2], radius: 1.2 },
    { center: [17, 4, 7.5], radius: 1 },
    { center: [-20, 0, -1], radius: 2 },
    { center: [-20, 0, -5], radius: 2 },
    { center: [-20, 0, -9], radius: 2 },
    { center: [-20, 0, -10], radius: 2 },
    { center: [-17, 0, 20.6], radius: 1.5 },
    { center: [-15.5, 0, 7.5], radius: 1.2 },
    { center: [15, 3, 14], radius: 2 },
    { center: [12, 0, 20], radius: 1 },
    { center: [16, 0, 16], radius: 1 },
    { center: [15, 3.8, 18], radius: 1 },
    { center: [10, 7, -13], radius: 1.2 },
  ];

  // Animate
  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
    timer.current += delta;

    if (state === "gathering" && gatherAndTalk && gatherPosition) {
      const gatherVec = new Vector3(...gatherPosition);
      const pos = positionRef.current.clone();
      const dist = pos.distanceTo(gatherVec);
      if (dist > 0.1) {
        const direction = gatherVec.clone().sub(pos).normalize();
        const walkSpeed = 0.04; // move a bit faster to gather
        const newPos = pos.add(direction.multiplyScalar(walkSpeed));
        positionRef.current = newPos;
        if (characterRef.current) {
          characterRef.current.position.copy(newPos);
          targetYRotation.current = Math.atan2(direction.x, direction.z);
          currentYRotation.current = smoothRotate(currentYRotation.current, targetYRotation.current, rotationSpeed);
          characterRef.current.rotation.y = currentYRotation.current;
        }
      } else {
        setState("talking");
      }
      return;
    }

    if (state === "talking" && gatherAndTalk && gatherPosition) {
      const gatherVec = new Vector3(...gatherPosition);
      const center = new Vector3(0, 0, 6);
      positionRef.current = gatherVec;
      if (characterRef.current) {
        characterRef.current.position.copy(gatherVec);
        const dirToCenter = center.clone().sub(gatherVec);
        targetYRotation.current = Math.atan2(dirToCenter.x, dirToCenter.z);
        currentYRotation.current = smoothRotate(currentYRotation.current, targetYRotation.current, rotationSpeed);
        characterRef.current.rotation.y = currentYRotation.current;
      }
      return;
    }

    if (!gatherAndTalk) {
      if (state === "walking") {
        const pos = positionRef.current.clone();
        const dir = directionRef.current.clone();
        const nextPos = pos.clone().add(dir.clone().multiplyScalar(0.02));
        const WALK_CENTER = new Vector3(0, 0, 6);
        const WALK_RADIUS = 10;
        let collided = false;
        if (nextPos.distanceTo(WALK_CENTER) > WALK_RADIUS) {
          collided = true;
        }
        for (const f of FURNITURE_COLLIDERS) {
          const fCenter = new Vector3(...(f.center as [number, number, number]));
          if (nextPos.distanceTo(fCenter) < f.radius + 0.5) {
            collided = true;
            break;
          }
        }
        if (collided) {
          setState("idle");
          timer.current = 0;
          idleDuration.current = Math.random() * 2 + 1;
        } else {
          positionRef.current = nextPos;
          if (characterRef.current) {
            characterRef.current.position.copy(nextPos);
            currentYRotation.current = smoothRotate(currentYRotation.current, targetYRotation.current, rotationSpeed);
            characterRef.current.rotation.y = currentYRotation.current;
          }
          if (timer.current > walkDuration.current) {
            setState("idle");
            timer.current = 0;
            idleDuration.current = Math.random() * 2 + 1;
          }
        }
      } else if (state === "idle") {
        if (characterRef.current) {
          currentYRotation.current = smoothRotate(currentYRotation.current, targetYRotation.current, rotationSpeed);
          characterRef.current.rotation.y = currentYRotation.current;
        }
        if (timer.current > idleDuration.current) {
          setState("walking");
          timer.current = 0;
          walkDuration.current = Math.random() * 3 + 2;
          const v = new Vector3(Math.random() - 0.5, 0, Math.random() - 0.5);
          directionRef.current = v.length() === 0 ? new Vector3(1, 0, 0) : v.normalize();
          targetYRotation.current = Math.atan2(directionRef.current.x, directionRef.current.z);
        }
      }
    }
  });

  return fbx ? (
    <group ref={characterRef} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={fbx} />
      {speechBubblePath && (
        <SpeechBubble
          modelPath={speechBubblePath}
          position={[0, 350, 0]}
          scale={0.25}
          visible={(state === "talking" || state === "gathering") && !!gatherAndTalk}
        />
      )}
    </group>
  ) : null;
};

export default Character;
