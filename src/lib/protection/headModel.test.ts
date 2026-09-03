/**
 * The head hit test, which nothing else in the app can check.
 *
 * This module is a port of the extraction repo's cone geometry, and the viewer reads surface
 * normals straight off it — so an error here does not throw, it draws a plausible head with the
 * protection in the wrong place. The specs below pin the geometry to a capsule whose answers can be
 * worked out by hand: upright, centred on the origin, radius 7 and half-length 5.
 */
import { describe, expect, it } from 'vitest';
import {
    headExtent, headNormal, headPoints, headRay, headSegment, headSurface,
    rotatorBasis, zoneOf, zoneOfDirection, HEAD_ZONE_NAMES,
    type HeadCapsule,
} from '@/lib/protection/headModel';
import type { Vec3 } from '@/lib/protection/bodyModel';

const head: HeadCapsule = { centre: [0, 0, 0], axis: [0, 0, 1], radius: 7, half: 5 };

/** Distance from a point to the capsule's axis segment — the radius test, done independently. */
function distanceToSegment(p: Vec3): number {
    const [a, b] = headSegment(head);
    const ab: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ap: Vec3 = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
    const abab = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
    const k = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / abab));
    return Math.hypot(ap[0] - ab[0] * k, ap[1] - ab[1] * k, ap[2] - ab[2] * k);
}

const length = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

describe('rotatorBasis', () => {
    it('faces down +X with no rotation', () => {
        const { F } = rotatorBasis(0, 0, 0);

        expect(F[0]).toBeCloseTo(1);
        expect(F[1]).toBeCloseTo(0);
        expect(F[2]).toBeCloseTo(0);
    });

    it('swings forward onto +Y at 90 degrees of yaw', () => {
        const { F } = rotatorBasis(0, 90, 0);

        expect(F[0]).toBeCloseTo(0);
        expect(F[1]).toBeCloseTo(1);
    });

    it.each([[0, 0, 0], [30, 45, 0], [-20, 170, 65], [89, -12, -140]])(
        'stays orthonormal at pitch %i yaw %i roll %i',
        (pitch, yaw, roll) => {
            const { F, R, U } = rotatorBasis(pitch, yaw, roll);

            for (const axis of [F, R, U]) expect(length(axis)).toBeCloseTo(1);
            expect(dot(F, R)).toBeCloseTo(0);
            expect(dot(F, U)).toBeCloseTo(0);
            expect(dot(R, U)).toBeCloseTo(0);
        },
    );
});

describe('the capsule', () => {
    it('spans the axis from end to end', () => {
        expect(headSegment(head)).toEqual([[0, 0, -5], [0, 0, 5]]);
    });

    it('reaches half a length plus a radius from the centre', () => {
        expect(headExtent(head)).toBe(12);
    });

    it('points its normal straight out from the axis', () => {
        const normal = headNormal(head, [7, 0, 0]);

        expect(normal[0]).toBeCloseTo(1);
        expect(normal[1]).toBeCloseTo(0);
        expect(normal[2]).toBeCloseTo(0);
        expect(length(normal)).toBeCloseTo(1);
    });
});

describe('headRay', () => {
    it('hits the near wall of a capsule it is aimed at', () => {
        const hit = headRay(head, [100, 0, 0], [-1, 0, 0]);

        expect(hit).not.toBeNull();
        expect(hit!.t).toBeCloseTo(93);
        expect(hit!.point[0]).toBeCloseTo(7);
        expect(hit!.normal[0]).toBeCloseTo(1);
    });

    it('misses when aimed away, rather than reporting a hit behind the origin', () => {
        expect(headRay(head, [100, 0, 0], [1, 0, 0])).toBeNull();
    });

    it('misses a ray that passes outside the radius', () => {
        expect(headRay(head, [100, 20, 0], [-1, 0, 0])).toBeNull();
    });

    it('hits the cap when coming down the axis', () => {
        const hit = headRay(head, [0, 0, 100], [0, 0, -1]);

        expect(hit).not.toBeNull();
        // Straight down onto the crown: the cap puts the surface a radius above the segment end.
        expect(hit!.point[2]).toBeCloseTo(12);
    });
});

describe('headSurface', () => {
    it.each<[string, Vec3]>([
        ['forward', [1, 0, 0]],
        ['lateral', [0, 1, 0]],
        ['up', [0, 0, 1]],
        ['oblique', [0.6, 0.48, 0.64]],
    ])('lands %s on the skin, one radius off the axis', (_label, dir) => {
        expect(distanceToSegment(headSurface(head, dir))).toBeCloseTo(head.radius);
    });
});

describe('headPoints', () => {
    it('returns the number of samples asked for', () => {
        expect(headPoints(head, 250)).toHaveLength(250);
    });

    it('puts every sample on the surface', () => {
        for (const sample of headPoints(head, 250)) {
            expect(distanceToSegment(sample.point)).toBeCloseTo(head.radius);
            expect(length(sample.normal)).toBeCloseTo(1);
        }
    });
});

describe('zoneOf', () => {
    it.each<[string, number, number]>([
        ['face', 0, 0],
        ['jaw', 0, -40],
        ['brow', 0, 35],
        ['crown', 0, 60],
        ['sides', 90, 0],
        ['nape', 180, 0],
    ])('reads %s off its own yaw and pitch', (zone, yaw, pitch) => {
        expect(zoneOf(yaw, pitch)).toBe(zone);
    });

    it('lets the crown win above 45 degrees, whichever way the yaw points', () => {
        // The crown test comes before sides and nape, and takes the whole cap.
        expect(zoneOf(180, 60)).toBe('crown');
        expect(zoneOf(90, 60)).toBe('crown');
    });

    it('falls through to other where the zones leave a gap', () => {
        // Steeply below, out to the side: too wide for the jaw, too low for the sides.
        expect(zoneOf(90, -60)).toBe('other');
    });

    it('names the forward direction the face', () => {
        expect(zoneOfDirection([1, 0, 0])).toBe('face');
    });

    it('agrees with zoneOf about a direction it can work out', () => {
        expect(zoneOfDirection([0, 0, 1])).toBe('crown');
        expect(zoneOfDirection([-1, 0, 0])).toBe('nape');
    });

    it('publishes every zone name it can return', () => {
        expect(HEAD_ZONE_NAMES).toEqual(['face', 'jaw', 'brow', 'crown', 'sides', 'nape']);
    });
});
