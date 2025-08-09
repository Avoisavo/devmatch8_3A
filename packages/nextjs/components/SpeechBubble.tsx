"use client";

import React, { useEffect, useRef } from "react";
import { useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { AnimationMixer, Group } from "three";

interface SpeechBubbleProps {
  modelPath: string;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  modelPath,
  position = [0, 120, 0],
  scale = 0.3,
  visible = true,
}) => {
  const speechBubble = useFBX(modelPath) as Group & { animations?: any[] };
  const mixerRef = useRef<AnimationMixer | null>(null);

  useEffect(() => {
    if (!speechBubble) return;
    if (speechBubble.animations && speechBubble.animations.length > 0) {
      const mixer = new AnimationMixer(speechBubble);
      const clip = speechBubble.animations[0];
      mixer.clipAction(clip, speechBubble).play();
      mixerRef.current = mixer;
      return () => {
        mixer.stopAllAction();
        mixerRef.current = null;
      };
    }
  }, [speechBubble]);

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
  });

  if (!visible || !speechBubble) {
    return null;
  }

  return <primitive object={speechBubble} position={position} scale={[scale, scale, scale]} />;
};

export default SpeechBubble;
