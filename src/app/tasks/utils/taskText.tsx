import React from 'react';
import {
    BookUp2, Camera, Crosshair, Flag, MapPin, Package, Plane, Search, Sparkle, Target, Wrench,
} from 'lucide-react';
import type { TaskType } from '@/types/tasks';

/**
 * Turning a task's fields into something readable.
 *
 * Split out of the components so the chain row, the detail pane and the standalone task page all
 * spell a task the same way.
 */

/**
 * The mark for a task type.
 *
 * `gunsmith` is the one the old helper missed — the 19 bench tasks fell through to the generic
 * target, which is exactly the group that most needed telling apart from the story chain.
 */
export function getTaskTypeIcon(type: TaskType, size = 12): React.ReactElement {
    switch (type) {
        case 'reach': return <MapPin size={size} />;
        case 'extract': return <Plane size={size} />;
        case 'retrieve': return <Search size={size} />;
        case 'eliminate': return <Crosshair size={size} />;
        case 'submit': return <BookUp2 size={size} />;
        case 'mark': return <Flag size={size} />;
        case 'place': return <Package size={size} />;
        case 'photo': return <Camera size={size} />;
        case 'signal': return <Sparkle size={size} />;
        case 'gunsmith': return <Wrench size={size} />;
        default: return <Target size={size} />;
    }
}
