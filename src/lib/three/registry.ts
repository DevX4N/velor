import type { Object3D } from "three";
import type { CalloutId } from "@/content/velor";
import type { PartName } from "./bottle-spec";

/**
 * Shared handles between the 3D scene and the DOM.
 * The bottle (procedural or GLB) registers its parts here; the callout projector reads them,
 * and the anatomy scene registers the DOM lines the projector draws.
 */
export const parts: Partial<Record<PartName, Object3D>> = {};

export type Point = { x: number; y: number };

export type CalloutDom = {
  line: SVGPolylineElement;
  dot: SVGCircleElement;
  /** Fixed part of the leader in stage pixels (the label's pin, then any elbows), cached on resize. */
  route: () => Point[];
};

export const callouts: Partial<Record<CalloutId, CalloutDom>> = {};
export const calloutStage: { el: HTMLElement | null } = { el: null };
