import React from "react";
import {ChevronsLeftRight, ChevronsUpDown, Crosshair, HelpCircle, Info, Shield, Snail, Timer, Zap} from "lucide-react";
import {FIRE_MODE_CONFIG, Weapon} from "@/types/items";


export default function WeaponSpecificStats({item} : {item: Weapon}) {
    return                 <>
        <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
                <Zap size={18} className="text-olive-400"/>
                <span className="text-tan-300">Fire Rate:</span>
                <span className="text-tan-100">{item.stats.fireRate} rpm</span>
            </div>
            <div className="flex items-center gap-2">
                <Crosshair size={18} className="text-olive-400"/>
                <span className="text-tan-300">MOA:</span>
                <span className="text-tan-100">{item.stats.MOA?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
                <Shield size={18} className="text-olive-400"/>
                <span className="text-tan-300">Caliber:</span>
                <span className="text-tan-100">{item.stats.caliber}</span>
            </div>
            <div className="flex items-center gap-2">
                <Timer size={18} className="text-olive-400"/>
                <span className="text-tan-300">Ergonomics:</span>
                <span className="text-tan-100">{(item.stats.ergonomics * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
                <Info size={18} className="text-olive-400"/>
                <span className="text-tan-300">Fire Mode:</span>
                <span className="text-tan-100">{FIRE_MODE_CONFIG[item.stats.fireMode]}</span>
            </div>
            <div className="flex items-center gap-2">
                <Snail size={18} className="text-olive-400"/>
                <span className="text-tan-300">ADS speed:</span>
                <span className="text-tan-100">{(item.stats.ADSSpeed * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
                <ChevronsUpDown size={18} className="text-olive-400"/>
                <span className="text-tan-400">Vertical Recoil:</span>
                <span className="text-tan-100 font-mono">
                                        {(item.stats.recoilParameters.verticalRecoilControl * 100).toFixed(0)}%
                                    </span>
            </div>
            <div className="flex items-center gap-2">
                <ChevronsLeftRight size={18} className="text-olive-400"/>
                <span className="text-tan-400">Horizontal Recoil:</span>
                <span className="text-tan-100 font-mono">
                                        {(item.stats.recoilParameters.horizontalRecoilControl * 100).toFixed(0)}%
                                    </span>
            </div>
            {/* Fire Power with tooltip */}
            <div className="flex items-center gap-2 relative group  cursor-help">
                <HelpCircle size={18} className="text-olive-400 hover:text-olive-300"/>
                <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-military-800 border border-military-600 rounded-sm text-xs text-tan-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    The more - the better. Ammo penetration power is affected by <span
                    className="text-olive-400">firing power - 0.5</span>.
                </div>
                <span className="text-tan-400">Fire Power:</span>
                <span className="text-tan-100 font-mono">{item.stats.firingPower}</span>
            </div>
        </div>
        {/*{item.stats.recoilParameters && (
                        <WeaponRecoilDisplay
                            recoilParameters={item.stats.recoilParameters}
                            className="mt-6"
                        />
                    )}*/}
    </>

}