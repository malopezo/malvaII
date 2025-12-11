import * as React from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

const easingMap = {
    Gentle: [0.25, 0.1, 0.25, 1],
    Balanced: [0.42, 0, 0.58, 1],
    Strong: [0.7, 0, 0.3, 1],
}

export function PhotoGalleryGrid({
    images = [],
    easeType = "Balanced",
    borderRadius = 6,
    transitionDuration = 0.7,
    padding = 8,
}) {
    const easing = easingMap[easeType] || easingMap.Balanced

    return (
        <motion.div
            layout
            transition={{
                layout: { duration: transitionDuration, ease: easing },
            }}
            style={{
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
                gap: `${padding}px`,
                padding: `${padding}px`,
            }}
        >
            {images.map((src, i) => (
                <motion.div
                    key={src ?? i}
                    layout
                    transition={{
                        layout: { duration: transitionDuration, ease: easing },
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                        borderRadius,
                    }}
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0 }}
                        style={{
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url(${src})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            willChange: "transform",
                        }}
                    />
                </motion.div>
            ))}
        </motion.div>
    )
}

addPropertyControls(PhotoGalleryGrid, {
    images: {
        type: ControlType.Array,
        title: "Gallery",
        propertyControl: {
            type: ControlType.Image,
        },
        defaultValue: Array(9).fill(
            "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg"
        ),
    },
    easeType: {
        type: ControlType.Enum,
        title: "Ease",
        options: ["Gentle", "Balanced", "Strong"],
        optionTitles: ["Gentle", "Balanced", "Strong"],
        defaultValue: "Balanced",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 6,
        min: 0,
        max: 40,
        step: 1,
    },
    transitionDuration: {
        type: ControlType.Number,
        title: "Duration",
        defaultValue: 0.7,
        min: 0.1,
        max: 3,
        step: 0.1,
    },
    padding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: 8,
        min: 0,
        max: 40,
        step: 1,
    },
})
