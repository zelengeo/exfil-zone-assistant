import { add, cross, dot, mul, norm, sub, type Vec3 } from './bodyModel';

/**
 * The canvas projection both viewers share.
 *
 * Plain 2D canvas with its own perspective divide — no three.js, no WebGL. The scene is thirteen
 * capsules and a skeleton; a renderer would be more bytes than the model.
 *
 * Display space is (forward, right, up): +X out of the character's chest, +Y to their right,
 * +Z up. A camera is an azimuth and an elevation about the body's centre, which is all the four
 * view presets need to be.
 */

export interface Camera {
    /** Degrees around the body. 0 looks at the chest; 180 at the back. */
    azimuth: number;
    /** Degrees above the horizon. */
    elevation: number;
    distance: number;
    /** What the camera orbits. */
    target: Vec3;
    /** Vertical field of view, in degrees. */
    fov: number;
}

export interface Viewport {
    width: number;
    height: number;
}

export interface Projector {
    eye: Vec3;
    /** World point to canvas pixels, plus the depth used for painter ordering. */
    project: (p: Vec3) => { x: number; y: number; depth: number };
    /** Unit vector from the eye through a canvas pixel. */
    ray: (x: number, y: number) => Vec3;
    /** Canvas pixels one world unit spans at the target's depth — for sizing strokes. */
    scale: number;
}

const RAD = Math.PI / 180;

export function makeProjector(camera: Camera, viewport: Viewport): Projector {
    const az = camera.azimuth * RAD;
    const el = camera.elevation * RAD;

    // Camera position on the orbit sphere.
    const offset: Vec3 = [
        Math.cos(el) * Math.cos(az),
        Math.cos(el) * Math.sin(az),
        Math.sin(el),
    ];
    const eye = add(camera.target, mul(offset, camera.distance));

    // Right-handed camera basis. World up is +Z, degenerate only when looking straight down.
    const forward = norm(sub(camera.target, eye));
    const worldUp: Vec3 = Math.abs(forward[2]) > 0.999 ? [1, 0, 0] : [0, 0, 1];
    const right = norm(cross(forward, worldUp));
    const up = cross(right, forward);

    const focal = viewport.height / 2 / Math.tan((camera.fov * RAD) / 2);
    const cx = viewport.width / 2;
    const cy = viewport.height / 2;

    return {
        eye,
        scale: focal / camera.distance,
        project(p: Vec3) {
            const v = sub(p, eye);
            const depth = dot(v, forward);
            // Behind the eye: clamp rather than divide, so a capsule straddling the plane still
            // draws instead of flipping across the canvas.
            const z = Math.max(depth, 0.001);
            return {
                x: cx + (dot(v, right) / z) * focal,
                y: cy - (dot(v, up) / z) * focal,
                depth,
            };
        },
        ray(x: number, y: number) {
            return norm(
                add(
                    add(mul(right, (x - cx) / focal), mul(up, -(y - cy) / focal)),
                    forward,
                ),
            );
        },
    };
}

/** The four presets. The flanks are the whole point — a 90° wedge covers front and back, not side. */
export const VIEW_PRESETS = {
    front: { azimuth: 0, elevation: 0 },
    back: { azimuth: 180, elevation: 0 },
    left: { azimuth: -90, elevation: 0 },
    right: { azimuth: 90, elevation: 0 },
} as const;

export type ViewName = keyof typeof VIEW_PRESETS;
