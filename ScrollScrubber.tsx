import { useEffect, useRef, useState } from "react"
import { useViewportScroll, useTransform, motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerIntrinsicWidth 600
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicHeight 400
 */
export default function ScrollVideo({
    videoSourceType,
    videoSrcURL,
    videoSrcFile,
    scrollLength,
    videoAlignment,
    startOn,
    videoFit,
}) {
    const videoRef = useRef(null)
    const containerRef = useRef(null)
    const { scrollY } = useViewportScroll()
    const [containerTop, setContainerTop] = useState(0)
    const [containerHeight, setContainerHeight] = useState(0)

    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setContainerTop(window.pageYOffset + rect.top)
            setContainerHeight(rect.height)
        }
    }, [])

    const videoProgress = useTransform(
        scrollY,
        [containerTop, containerTop + containerHeight],
        [0, 1]
    )

    useEffect(() => {
        let observer
        let options = {}

        if (startOn === "top") {
            options = { threshold: 0 }
        } else if (startOn === "center") {
            options = { threshold: 0.5 }
        } else if (startOn === "bottom") {
            options = { threshold: 1 }
        }

        observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && videoRef.current) {
                const scrollPosition =
                    window.pageYOffset + entry.boundingClientRect.top
                const progress =
                    (scrollPosition - containerTop) / containerHeight
                videoRef.current.currentTime =
                    progress * videoRef.current.duration
            }
        }, options)

        if (videoRef.current) {
            observer.observe(videoRef.current)
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current)
            }
        }
    }, [startOn, containerTop, containerHeight])

    useEffect(() => {
        const updateVideoTime = () => {
            if (videoRef.current) {
                const scrollPosition = window.pageYOffset
                const progress =
                    (scrollPosition - containerTop) / containerHeight
                videoRef.current.currentTime =
                    Math.max(0, Math.min(1, progress)) *
                    videoRef.current.duration
            }
        }

        window.addEventListener("scroll", updateVideoTime)
        return () => window.removeEventListener("scroll", updateVideoTime)
    }, [containerTop, containerHeight])

    const videoSrc = videoSourceType === "url" ? videoSrcURL : videoSrcFile
    const alignmentStyles = {
        center: { top: "50%", transform: "translateY(-50%)" },
        top: { top: 0 },
        bottom: { bottom: 0 },
    }

    return (
        <motion.div
            ref={containerRef}
            style={{ height: scrollLength, position: "relative" }}
        >
            <video
                ref={videoRef}
                src={videoSrc}
                style={{
                    width: "100%",
                    height: "100vh",
                    position: "sticky",
                    objectFit: videoFit,
                    ...alignmentStyles[videoAlignment],
                }}
                muted
                playsInline
            />
        </motion.div>
    )
}

ScrollVideo.defaultProps = {
    videoSourceType: "url",
    videoSrcURL:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    scrollLength: 500,
    videoAlignment: "center",
    startOn: "top",
    videoFit: "cover",
}

addPropertyControls(ScrollVideo, {
    videoSourceType: {
        type: ControlType.Enum,
        title: "Source Type",
        options: ["url", "file"],
        optionTitles: ["URL", "File"],
        defaultValue: "url",
    },
    videoSrcURL: {
        type: ControlType.String,
        title: "Video URL",
        defaultValue:
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        hidden: ({ videoSourceType }) => videoSourceType !== "url",
    },
    videoSrcFile: {
        type: ControlType.File,
        title: "Video File",
        allowedFileTypes: ["mp4", "mov", "webm"],
        hidden: ({ videoSourceType }) => videoSourceType !== "file",
    },
    scrollLength: {
        type: ControlType.Number,
        title: "Scroll Length",
        defaultValue: 500,
        min: 100,
        max: 20000,
        step: 30,
    },
    videoAlignment: {
        type: ControlType.Enum,
        title: "Video Alignment",
        options: ["center", "top", "bottom"],
        optionTitles: ["Center", "Top", "Bottom"],
        defaultValue: "center",
    },
    videoFit: {
        type: ControlType.Enum,
        title: "Video Fit",
        options: ["cover", "contain", "fill"],
        optionTitles: ["Cover", "Contain", "Fill"],
        defaultValue: "cover",
    },
    startOn: {
        type: ControlType.Enum,
        title: "Start On",
        options: ["top", "center", "bottom"],
        optionTitles: ["Top", "Center", "Bottom"],
        defaultValue: "top",
        description: "v1.0 \n[via SegmentUI](https://www.segmentUI.com)",
    },
})
