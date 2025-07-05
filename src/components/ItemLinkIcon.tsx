import Image from "next/image";
import Link from "next/link";
import {ExternalLink} from "lucide-react";
import {Item} from "@/types/items";


export default function ItemLinkIcon({item}: { item: Item, }) {
    return <Link
        href={`/items/${item?.id}`}
        target='_blank'
        className="relative w-12 h-12 flex-shrink-0 bg-black/50 rounded-sm
                               border border-military-700 hover:border-olive-600 transition-all
                               overflow-hidden group/icon"
    >
        <Image
            src={item?.images.icon || '/images/missing-item.png'}
            alt={item?.name || "missing-item"}
            unoptimized={true}
            fill
            sizes="full"
            className="object-contain p-1 group-hover/icon:scale-110 transition-transform"
        />
        <div
            className="absolute inset-0 bg-olive-400/0 group-hover/icon:bg-olive-400/10 transition-colors"/>
        <ExternalLink
            size={12}
            className="absolute top-1 right-1 text-tan-400 opacity-0 group-hover/icon:opacity-100 transition-opacity"
        />
    </Link>
}