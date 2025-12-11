import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

const CounterStyles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
}

export function Counter(props) {
    const {
        start,
        end,
        speed,
        gapSize,
        prefixText,
        suffixText,
        prefixFont,
        suffixFont,
        prefixColor,
        suffixColor,
        loop,
        decimalSeparatorType,
        textSize,
        selectedFont,
        textColor,
        startOnViewport,
        restartOnViewport,
        incrementType,
        letterSpacing, // Added letter spacing prop
    } = props

    const [count, setCount] = useState(start)
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0]
            setIsVisible(entry.isIntersecting)
        })

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current)
            }
        }
    }, [])

    useEffect(() => {
        const updateCount = () => {
            const increment = incrementType === "integer" ? 1 : 0.1
            setCount((prevCount) => {
                const nextCount = parseFloat((prevCount + increment).toFixed(2))
                return nextCount >= end ? end : nextCount
            })
        }

        if (isVisible || (!startOnViewport && start !== end)) {
            const intervalId = setInterval(updateCount, speed)

            return () => {
                clearInterval(intervalId)
            }
        } else if (startOnViewport && isVisible) {
            setCount(start)
        }
    }, [
        count,
        start,
        end,
        loop,
        isVisible,
        speed,
        startOnViewport,
        incrementType,
    ])

    useEffect(() => {
        if (restartOnViewport && isVisible) {
            setCount(start) // Restart the animation when re-entering the viewport
        }
    }, [isVisible, restartOnViewport, start])

    const formatNumber = (number) => {
        if (decimalSeparatorType === "comma") {
            return number.toLocaleString("en-US")
        } else if (decimalSeparatorType === "period") {
            return number.toLocaleString("en-US").replace(/,/g, ".")
        } else {
            return number.toFixed(incrementType === "integer" ? 0 : 1)
        }
    }

    return (
        <motion.div
            ref={containerRef}
            style={{
                ...CounterStyles.container,
                gap: `${gapSize}px`,
                flexDirection: "row",
                alignItems: "center",
                fontSize: `${textSize}px`,
                fontFamily: selectedFont.fontFamily,
                fontWeight: selectedFont.fontWeight,
                color: textColor,
                letterSpacing: `${letterSpacing}em`, // Applied letter spacing
            }}
        >
            <span
                style={{
                    fontFamily: prefixFont.fontFamily,
                    fontWeight: prefixFont.fontWeight,
                    color: prefixColor,
                }}
            >
                {prefixText}
            </span>
            <span>{formatNumber(count)}</span>
            <span
                style={{
                    fontFamily: suffixFont.fontFamily,
                    fontWeight: suffixFont.fontWeight,
                    color: suffixColor,
                }}
            >
                {suffixText}
            </span>
        </motion.div>
    )
}

Counter.defaultProps = {
    start: 0,
    end: 100,
    speed: 100,
    prefixText: "",
    suffixText: "",
    loop: false,
    decimalSeparatorType: "comma",
    textSize: 36,
    selectedFont: {
        fontFamily: "Inter",
        fontWeight: 500,
        systemFont: true,
    },
    textColor: "#D3D3D3",
    startOnViewport: false,
    incrementType: "integer",
    letterSpacing: 0, // Default letter spacing
}

addPropertyControls(Counter, {
    startOnViewport: {
        type: ControlType.Boolean,
        title: "Viewport",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    restartOnViewport: {
        type: ControlType.Boolean,
        title: "Replay",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    selectedFont: {
        title: "Font",
        type: ControlType.Font,
        defaultValue: {
            fontFamily: "Inter",
            fontWeight: 500,
            systemFont: true,
        },
    },
    textSize: {
        title: "Font Size",
        type: ControlType.Number,
        min: 8,
        max: 240,
        step: 1,
    },
    textColor: {
        type: ControlType.Color,
        title: "Font Color",
    },
    start: {
        type: ControlType.Number,
        title: "Start Number",
        defaultValue: 0,
        displayStepper: true,
    },
    end: {
        type: ControlType.Number,
        title: "End Number",
        defaultValue: 10,
        displayStepper: true,
    },
    decimalSeparatorType: {
        type: ControlType.Enum,
        title: "Separator",
        defaultValue: "comma",
        options: ["comma", "period", "none"],
        optionTitles: ["Comma (1,000)", "Decimal (1.000)", "None"],
    },
    incrementType: {
        type: ControlType.Enum,
        title: "Increment Type",
        defaultValue: "integer",
        options: ["integer", "decimal"],
        optionTitles: ["Integer", "Decimal"],
    },
    prefixText: {
        type: ControlType.String,
        title: "Prefix",
        defaultValue: "",
    },
    prefixFont: {
        title: "Prefix Font",
        type: ControlType.Font,
        defaultValue: {
            fontFamily: "Inter",
            fontWeight: 500,
            systemFont: true,
        },
    },
    prefixColor: {
        type: ControlType.Color,
        title: "Prefix Color",
    },
    suffixText: {
        type: ControlType.String,
        title: "Suffix",
        defaultValue: "",
    },
    suffixFont: {
        title: "Suffix Font",
        type: ControlType.Font,
        defaultValue: {
            fontFamily: "Inter",
            fontWeight: 500,
            systemFont: true,
        },
    },
    suffixColor: {
        type: ControlType.Color,
        title: "Suffix Color",
    },
    gapSize: {
        type: ControlType.Number,
        title: "Gap Size",
        defaultValue: 4,
        min: 0,
        max: 100,
        step: 4,
    },
    speed: {
        type: ControlType.Number,
        title: "Speed (ms)",
        defaultValue: 100,
        min: 0,
        max: 2000,
        step: 10,
    },
    loop: {
        type: ControlType.Boolean,
        title: "Loop Animation",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    letterSpacing: {
        // Added property control
        type: ControlType.Number,
        title: "Letter Spacing",
        defaultValue: 0,
        min: -1,
        max: 1,
        step: 0.01,
    },
})
