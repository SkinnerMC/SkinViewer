import * as skinview3d from 'skinview3d';
import { HTMLAttributes, useEffect, useRef, useState } from 'react';
import { SkinViewerOptions } from 'skinview3d/libs/viewer';
import { Animation as AnimationRoot } from 'skinview3d/libs/animation';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export enum Animation {
    IDLE = 'idle',
    WALK = 'walk',
    RUN = 'run',
    FLY = 'fly',
    ROTATE = 'rotate'
}
export type AnimationUnion = `${Animation}`;

const animationTemplates = new Map<Animation | AnimationUnion, AnimationRoot>([
    [Animation.IDLE, skinview3d.IdleAnimation],
    [Animation.WALK, skinview3d.WalkingAnimation],
    [Animation.RUN, skinview3d.RunningAnimation],
    [Animation.FLY, skinview3d.FlyingAnimation],
    [Animation.ROTATE, skinview3d.RotatingAnimation]
]);

export interface ISkinViewerProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Render element height
     */
    height: SkinViewerOptions['height'];
    /**
     * Render element width
     */
    width: SkinViewerOptions['width'];
    /**
     * Skin source
     */
    skin: SkinViewerOptions['skin'];
    /**
     * Use slim skin model, auto-detect skin mode by default
     */
    isSlim?: boolean;
    /**
     * Cape source
     */
    cape?: SkinViewerOptions['cape'];
    /**
     * Allow model render zooming
     */
    enableZoom?: boolean;
    /**
     * Allow model render rotating
     */
    enableRotate?: boolean;
    /**
     * Use pan mode for model render
     */
    enablePan?: boolean;
    /**
     * Current animation name
     */
    animation?: Animation | AnimationUnion | skinview3d.Animation;
    /**
     * Animation speed
     */
    animationSpeed?: number;
    /**
     * Paused status for animation
     */
    paused?: boolean;
    /**
     * Function called after rendering is finished
     */
    onReady?: (skinViewer: skinview3d.SkinViewer) => unknown;
}

export function SkinViewer({ skin, isSlim, cape, height, width, enableZoom, enableRotate, enablePan, animation, animationSpeed = 0.5, paused, style, ...rest }: ISkinViewerProps) {
    const ref = useRef<HTMLCanvasElement>(null);

    const [viewer, setViewer] = useState<skinview3d.SkinViewer>();
    const [controls, setControls] = useState<OrbitControls>();

    const resetAnimation = () => {
        if (!viewer) {
            return;
        }

        viewer.animations.reset();
    };

    useEffect(() => {
        const viewer = new skinview3d.SkinViewer({
            canvas: ref.current!,
            width,
            height
        });

        setViewer(viewer);

        const controls = skinview3d.createOrbitControls(viewer);

        setControls(controls);

        return () => {
            viewer.renderer.forceContextLoss();
        };
    }, []);

    useEffect(() => {
        if (!viewer) {
            return;
        }

        const model = typeof isSlim !== 'undefined' ?
            isSlim ?
                'slim'
                :
                'default'
            :
            'auto-detect';

        if (skin) {
            viewer.loadSkin(skin, model);
        } else {
            viewer.resetSkin();
        }
    }, [viewer, skin, isSlim]);

    useEffect(() => {
        if (!viewer) {
            return;
        }

        if (cape) {
            viewer.loadCape(cape);

            return;
        }

        viewer.resetCape();
    }, [viewer, cape]);

    useEffect(() => {
        if (!viewer || !width || !height) {
            return;
        }

        viewer.setSize(width, height);
    }, [viewer, width, height]);

    useEffect(() => {
        if (controls) {
            controls.enableRotate = Boolean(enableRotate);
            controls.enableZoom = Boolean(enableZoom);
            controls.enablePan = Boolean(enablePan);
        }

        if (viewer) {
            viewer.animations.speed = animationSpeed;
            viewer.animations.paused = Boolean(paused);
        }
    }, [controls, viewer, enableZoom, enableRotate, enablePan, animationSpeed, paused]);

    useEffect(() => {
        if (!viewer) {
            return;
        }

        if (animation) {
            resetAnimation();

            if (typeof animation === 'string') {
                const animationTemplate = animationTemplates.get(animation)!;

                viewer.animations.add(animationTemplate);

                return;
            }

            viewer.animations.add(animation as skinview3d.IAnimation);

            return;
        }

        resetAnimation();
    }, [viewer, animation]);

    return (
        <div
            style={{
                width,
                height,
                ...style
            }}
            {...rest}
        >
            <canvas ref={ref}/>
        </div>
    );
}
