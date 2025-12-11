import * as React from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

interface GridHoverImageProps {
    photos: string[]
    gap: number
    columns: number
    rows: number
    transition: number
    hoverSize: number
}

export function GridHoverImage({
    photos = [],
    gap = 10,
    columns = 3,
    rows = 3,
    transition = 0.3,
    hoverSize = 2,
}: GridHoverImageProps) {
    const [hovered, setHovered] = React.useState<number | null>(null)

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 200px)`,
                gap: gap,
                width: "100%",
                height: "100%",
            }}
        >
            {photos.map((src, i) => {
                const isHovered = hovered === i

                return (
                    <motion.div
                        key={i}
                        onHoverStart={() => setHovered(i)}
                        onHoverEnd={() => setHovered(null)}
                        animate={{
                            gridColumn: isHovered
                                ? `span ${hoverSize}`
                                : "span 1",
                            gridRow: isHovered ? `span ${hoverSize}` : "span 1",
                        }}
                        transition={{ duration: transition }}
                        style={{
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            borderRadius: 4,
                            cursor: "pointer",
                        }}
                    >
                        <img
                            src={src}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                            }}
                        />
                    </motion.div>
                )
            })}
        </div>
    )
}

addPropertyControls(GridHoverImage, {
    photos: {
        type: ControlType.Array,
        propertyControl: { type: ControlType.Image },
        title: "photos",
    },
    gap: { type: ControlType.Number, defaultValue: 10 },
    columns: { type: ControlType.Number, defaultValue: 3 },
    rows: { type: ControlType.Number, defaultValue: 3 },
    transition: {
        type: ControlType.Number,
        defaultValue: 0.3,
        title: "Grid transition",
    },
    hoverSize: {
        type: ControlType.Number,
        defaultValue: 2,
        title: "Hover Grid size",
    },
})
