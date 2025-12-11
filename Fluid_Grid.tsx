import * as React from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

type Props = {
    photos: string[]
    gap: number
    columns: number
    rows: number
    gridTransition: number
    hoverGridSize: number
}

export function GridHoverImage({
    photos = [],
    gap = 0.1,
    columns = 3,
    rows = 3,
    gridTransition = 0.7,
    hoverGridSize = 1.6,
}: Props) {
    // limit number of images to the grid size
    const maxImages = columns * rows
    const images = photos.slice(0, maxImages)

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gap: `${gap}rem`,
                width: "100%",
                height: "100%",
            }}
        >
            {images.map((src, i) => (
                <div
                    key={i}
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: 6,
                    }}
                >
                    <motion.img
                        src={src}
                        alt={`grid-img-${i}`}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                        initial={{ scale: 1 }}
                        whileHover={{ scale: hoverGridSize }}
                        transition={{
                            duration: gridTransition,
                            ease: "easeInOut",
                        }}
                    />
                </div>
            ))}
        </div>
    )
}

addPropertyControls(GridHoverImage, {
    photos: {
        type: ControlType.Array,
        title: "photos",
        propertyControl: { type: ControlType.Image },
    },
    gap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: 0.1,
        min: 0,
        max: 5,
        step: 0.1,
    },
    columns: {
        type: ControlType.Number,
        title: "Collumns",
        defaultValue: 3,
        min: 1,
        max: 12,
        step: 1,
    },
    rows: {
        type: ControlType.Number,
        title: "Rows",
        defaultValue: 3,
        min: 1,
        max: 12,
        step: 1,
    },
    gridTransition: {
        type: ControlType.Number,
        title: "Grid transition",
        defaultValue: 0.7,
        min: 0.1,
        max: 3,
        step: 0.1,
    },
    hoverGridSize: {
        type: ControlType.Number,
        title: "Hover Grid size",
        defaultValue: 1.6,
        min: 1,
        max: 3,
        step: 0.1,
    },
})
