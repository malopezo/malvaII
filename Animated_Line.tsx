import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

export function AnimatedLine({
    direction = "horizontal", // "horizontal" or "vertical"
    duration = 2, // Time in seconds
    delay = 0, // Delay in seconds
    lineColor = "#000000", // Default line color
    triggerOnVisibility = false, // Whether to trigger animation only when in viewport
    replay = true, // Whether the animation should replay every time in view
    transitionType = "ease", // Type of transition ("ease", "linear", etc.)
    customCurve = "cubic-bezier(0.25, 0.8, 0.25, 1)", // Custom cubic-bezier curve
}) {
    const [animate, setAnimate] = useState("start")
    const [hasAnimated, setHasAnimated] = useState(false)
    const ref = useRef(null)

    const handleVisibility = (entries) => {
        const [entry] = entries

        if (entry.isIntersecting) {
            if (!triggerOnVisibility || replay || !hasAnimated) {
                setTimeout(() => setAnimate("end"), delay * 1000) // Apply delay
                setHasAnimated(true)
            }
        } else if (replay && triggerOnVisibility) {
            setAnimate("start") // Reset animation state
        }
    }

    useEffect(() => {
        const observer = new IntersectionObserver(handleVisibility, {
            threshold: 0.1, // Trigger when 10% of the element is in view
        })
        if (ref.current) {
            observer.observe(ref.current)
        }
        return () => observer.disconnect()
    }, [triggerOnVisibility, replay, delay])

    useEffect(() => {
        if (!triggerOnVisibility) {
            setTimeout(() => setAnimate("end"), delay * 1000) // Apply delay for non-visibility-triggered animations
        }
    }, [triggerOnVisibility, delay])

    const variants = {
        start: {
            width: direction === "horizontal" ? "0%" : "100%", // Start at 0% width for horizontal
            height: direction === "vertical" ? "0%" : "100%", // Start at 0% height for vertical
            transition: {
                duration,
                ease:
                    transitionType === "custom" ? customCurve : transitionType,
            },
        },
        end: {
            width: direction === "horizontal" ? "100%" : "100%", // Expand to full width for horizontal
            height: direction === "vertical" ? "100%" : "100%", // Expand to full height for vertical
            transition: {
                duration,
                ease:
                    transitionType === "custom" ? customCurve : transitionType,
            },
        },
    }

    return (
        <motion.div
            ref={ref}
            className="animated-line"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
            }}
        >
            <motion.div
                variants={variants}
                initial="start"
                animate={animate}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: lineColor,
                    width: direction === "horizontal" ? "0%" : "100%", // Default dimensions
                    height: direction === "vertical" ? "0%" : "100%",
                }}
            />
        </motion.div>
    )
}

// Exposing properties for the property panel
addPropertyControls(AnimatedLine, {
    direction: {
        type: ControlType.SegmentedEnum,
        title: "Direction",
        options: ["horizontal", "vertical"],
        defaultValue: "horizontal",
    },
    duration: {
        type: ControlType.Number,
        title: "Duration (s)",
        min: 0.1,
        max: 10,
        step: 0.1,
        defaultValue: 2,
    },
    delay: {
        type: ControlType.Number,
        title: "Delay (s)",
        min: 0,
        max: 10,
        step: 0.1,
        defaultValue: 0,
    },
    lineColor: {
        type: ControlType.Color,
        title: "Line Color",
        defaultValue: "#000000",
    },
    triggerOnVisibility: {
        type: ControlType.Boolean,
        title: "Trigger on Visibility",
        defaultValue: false,
    },
    replay: {
        type: ControlType.Boolean,
        title: "Replay Animation",
        defaultValue: true,
    },
    transitionType: {
        type: ControlType.Enum,
        title: "Transition Type",
        options: [
            "ease",
            "linear",
            "ease-in",
            "ease-out",
            "ease-in-out",
            "custom",
        ],
        defaultValue: "ease",
    },
    customCurve: {
        type: ControlType.String,
        title: "Custom Curve",
        defaultValue: "cubic-bezier(0.25, 0.8, 0.25, 1)",
        hidden(props) {
            return props.transitionType !== "custom"
        },
    },
})
