// AnimatedCodeBlock — wrapped-lines aware + custom theme + loop toggle
// - Lines wrap (no horizontal scrollbar). "Lines Shown" counts *visual rows*.
// - Sliding window uses measured row-heights (hidden measurer + ResizeObserver).
// - Optional custom theme: background, border, text.
// - New: `loop` toggle; when off, plays once and stops at the end (no reset).

import { useState, useEffect, useMemo, useRef, type CSSProperties } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"

interface CodeBlockProps {
    code: string
    language: string
    theme: "dark" | "light" | "custom"
    showLineNumbers: boolean
    characterDelay: number
    font: any
    padding: string
    radius: string
    animationType: "typewriter" | "fade" | "slide"
    linesShown: number // visual rows to display
    loop: boolean
    customBackgroundColor?: string
    customBorderColor?: string
    customTextColor?: string
    style?: CSSProperties
}

// ---- mini highlighter -------------------------------------------------------
const syntaxHighlight = (
    code: string,
    language: string,
    theme: "dark" | "light" | "custom",
    customTextColor?: string
) => {
    const colors =
        theme === "dark"
            ? {
                  keyword: "#569CD6",
                  string: "#CE9178",
                  comment: "#6A9955",
                  function: "#DCDCAA",
                  number: "#B5CEA8",
                  operator: "#D4D4D4",
                  default: "#D4D4D4",
              }
            : theme === "light"
              ? {
                    keyword: "#0000FF",
                    string: "#A31515",
                    comment: "#008000",
                    function: "#795E26",
                    number: "#098658",
                    operator: "#000000",
                    default: "#000000",
                }
              : {
                    keyword: customTextColor || "#000000",
                    string: customTextColor || "#000000",
                    comment: customTextColor || "#000000",
                    function: customTextColor || "#000000",
                    number: customTextColor || "#000000",
                    operator: customTextColor || "#000000",
                    default: customTextColor || "#000000",
                }

    const keywords: Record<string, string[]> = {
        javascript: [
            "import",
            "export",
            "function",
            "const",
            "let",
            "var",
            "return",
            "if",
            "else",
            "for",
            "while",
            "class",
            "extends",
            "async",
            "await",
        ],
        jsx: [
            "import",
            "export",
            "function",
            "const",
            "let",
            "var",
            "return",
            "if",
            "else",
            "for",
            "while",
            "class",
            "extends",
            "async",
            "await",
        ],
        typescript: [
            "import",
            "export",
            "function",
            "const",
            "let",
            "var",
            "return",
            "if",
            "else",
            "for",
            "while",
            "class",
            "extends",
            "interface",
            "type",
            "async",
            "await",
        ],
        python: [
            "def",
            "class",
            "import",
            "from",
            "return",
            "if",
            "else",
            "elif",
            "for",
            "while",
            "try",
            "except",
            "with",
            "as",
        ],
        java: [
            "public",
            "private",
            "protected",
            "class",
            "interface",
            "extends",
            "implements",
            "return",
            "if",
            "else",
            "for",
            "while",
            "try",
            "catch",
        ],
        css: [
            "color",
            "background",
            "margin",
            "padding",
            "border",
            "font",
            "display",
            "position",
            "width",
            "height",
        ],
    }

    const escapeHtml = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

    const langKeywords = keywords[language.toLowerCase()] || keywords.javascript
    let out = escapeHtml(code)

    // Avoid "$1" in this file's transport by composing it.
    const g1 = "$" + "1"

    out = out.replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        '<span style="color:' + colors.comment + '">' + g1 + "</span>"
    )
    out = out.replace(
        /((?:"[^"\\]*(?:\\.[^"\\]*)*")|(?:'[^'\\]*(?:\\.[^'\\]*)*')|(?:`[^`\\]*(?:\\.[^`\\]*)*`))/g,
        '<span style="color:' + colors.string + '">' + g1 + "</span>"
    )
    out = out.replace(
        /\b(\d+\.?\d*)\b/g,
        '<span style="color:' + colors.number + '">' + g1 + "</span>"
    )
    langKeywords.forEach((k) => {
        out = out.replace(
            new RegExp("\\b(" + k + ")\\b", "g"),
            '<span style="color:' + colors.keyword + '">' + g1 + "</span>"
        )
    })
    return out
}

/**
 * Enhanced animated code block (visual-row aware with wrapping)
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function AnimatedCodeBlock(props: CodeBlockProps) {
    const {
        code = `import { motion } from "framer-motion";

function Component() {
  return (
    <motion.div
      transition={{ ease: "linear" }}
      animate={{ rotate: 360, scale: 2 }}
    />
  );
}

// This component creates a sleek writing effect
// Text flows from top to bottom smoothly
// As new text appears at the bottom
// Older text gradually fades away from the top
// Creating a continuous scrolling effect
// Perfect for displaying long content
// Like JSON, code, or extensive text blocks
// Features typewriter effect with character animation
// Automatic line management with fade transitions`,
        language = "jsx",
        theme = "dark",
        showLineNumbers = true,
        characterDelay = 30,
        font,
        padding = "20px",
        radius = "8px",
        animationType = "typewriter",
        linesShown = 10,
        loop = true,
        customBackgroundColor = "#000000",
        customBorderColor = "#333333",
        customTextColor = "#D4D4D4",
    } = props

    const isStatic = useIsStaticRenderer()

    // Split code preserving blank lines
    const allLines = useMemo(() => code.split("\n"), [code])

    // Typography
    const baseLineHeight = parseFloat(font?.lineHeight) || 1.4
    const fontSize = parseFloat(font?.fontSize) || 14
    const fixedLineHeight = Math.max(fontSize * baseLineHeight, 20)
    const lineHeightPx = fixedLineHeight + "px"

    // Refs + measurement
    const containerRef = useRef<HTMLDivElement | null>(null)
    const measurerRef = useRef<HTMLDivElement | null>(null)
    const [containerWidth, setContainerWidth] = useState(0)

    useEffect(() => {
        if (!containerRef.current) return
        const ro = new (window as any).ResizeObserver((entries: any) => {
            for (const e of entries) setContainerWidth(e.contentRect.width)
        })
        ro.observe(containerRef.current)
        setContainerWidth(containerRef.current.clientWidth)
        return () => ro.disconnect()
    }, [])

    // How many visual rows does `text` occupy?
    const measureRows = (text: string) => {
        const measurer = measurerRef.current
        if (!measurer) return 1
        measurer.textContent = text.length ? text : " "
        const h = (measurer as any).scrollHeight as number
        return Math.max(1, Math.round(h / fixedLineHeight))
    }

    // Pre-compute rows for complete lines
    const rowsPerLine = useMemo(() => {
        if (!containerWidth) return allLines.map(() => 1)
        return allLines.map((ln) => measureRows(ln))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allLines, containerWidth, fixedLineHeight, showLineNumbers])

    // Animation state
    const [currentLineIndex, setCurrentLineIndex] = useState(0)
    const [currentCharIndex, setCurrentCharIndex] = useState(0)
    const [loopCount, setLoopCount] = useState(0)

    useEffect(() => {
        if (!isStatic) {
            setCurrentLineIndex(0)
            setCurrentCharIndex(0)
            setLoopCount(0)
        }
    }, [code, linesShown, isStatic])

    const currentLine =
        currentLineIndex < allLines.length ? allLines[currentLineIndex] : ""
    const partialLine =
        currentLine.length > 0 ? currentLine.slice(0, currentCharIndex) : ""

    // Compute visible window using visual rows
    const visible = useMemo(() => {
        let startAbs = 0
        let rowsSoFar = 0

        if (currentLineIndex < allLines.length) {
            const partialRows = partialLine ? measureRows(partialLine) : 1
            rowsSoFar += partialRows
            let idx = currentLineIndex - 1
            while (idx >= 0 && rowsSoFar < linesShown) {
                const r = rowsPerLine[idx] || 1
                rowsSoFar += r
                startAbs = idx
                idx--
            }
        }

        const out: { absIndex: number; text: string; isPartial?: boolean }[] =
            []
        let total = 0
        let abs = startAbs
        while (total < linesShown && abs <= currentLineIndex) {
            if (abs < currentLineIndex) {
                const text = allLines[abs] ?? ""
                const r = rowsPerLine[abs] || 1
                out.push({ absIndex: abs, text })
                total += r
            } else {
                const text = partialLine || ""
                const r = Math.max(1, measureRows(text))
                out.push({ absIndex: abs, text, isPartial: true })
                total += r
                break
            }
            abs++
        }

        while (total < linesShown) {
            out.unshift({ absIndex: -1 - total, text: "" })
            total += 1
        }

        return out
    }, [
        allLines,
        rowsPerLine,
        partialLine,
        currentLineIndex,
        linesShown,
        containerWidth,
        fixedLineHeight,
    ])

    // Animation loop — plays through ALL lines, reset only if loop=true
    useEffect(() => {
        if (isStatic) return

        const atEnd = currentLineIndex >= allLines.length
        if (atEnd) {
            if (!loop) return // stop here when not looping
            const t = setTimeout(() => {
                setCurrentLineIndex(
                    Math.min(linesShown - 1, allLines.length - 1)
                )
                setCurrentCharIndex(0)
                setLoopCount((p) => p + 1)
            }, 1000)
            return () => clearTimeout(t)
        }

        const id = setInterval(() => {
            if (currentLine.length === 0) {
                if (currentCharIndex === 0) setCurrentCharIndex(1)
                else {
                    setCurrentLineIndex((p) => p + 1)
                    setCurrentCharIndex(0)
                }
                return
            }
            if (currentCharIndex >= currentLine.length) {
                setCurrentLineIndex((p) => p + 1)
                setCurrentCharIndex(0)
            } else {
                setCurrentCharIndex((p) => p + 1)
            }
        }, characterDelay)

        return () => clearInterval(id)
    }, [
        currentLineIndex,
        currentCharIndex,
        currentLine,
        characterDelay,
        isStatic,
        allLines.length,
        linesShown,
        loop,
    ])

    const isTyping = currentLineIndex < allLines.length && currentCharIndex > 0

    // Theme
    const themeColors = {
        dark: {
            background: "#000000",
            text: "#D4D4D4",
            lineNumber: "#858585",
            border: "#333333",
        },
        light: {
            background: "#FFFFFF",
            text: "#000000",
            lineNumber: "#999999",
            border: "#E1E1E1",
        },
        custom: {
            background: customBackgroundColor,
            text: customTextColor,
            lineNumber: customTextColor,
            border: customBorderColor,
        },
    } as const
    const currentTheme = themeColors[theme]
    const normalizedLanguage = (language || "javascript").toLowerCase()

    // ---- Static mode ----------------------------------------------------------
    if (isStatic) {
        let shown: string[] = []
        let used = 0
        for (let i = 0; i < allLines.length && used < linesShown; i++) {
            const r = rowsPerLine[i] || 1
            shown.push(allLines[i])
            used += r
        }

        return (
            <div
                ref={containerRef}
                style={{
                    ...props.style,
                    backgroundColor: currentTheme.background,
                    color: currentTheme.text,
                    border: "1px solid " + currentTheme.border,
                    borderRadius: radius,
                    padding: padding,
                    overflow: "hidden",
                    position: "relative",
                    height: "100%",
                    boxSizing: "border-box",
                    fontFamily:
                        font?.fontFamily ||
                        "Monaco, Menlo, 'Ubuntu Mono', monospace",
                    fontSize: font?.fontSize || "14px",
                }}
            >
                {/* Hidden measurer */}
                <div
                    ref={measurerRef}
                    style={{
                        position: "absolute",
                        visibility: "hidden",
                        pointerEvents: "none",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        left: 0,
                        top: 0,
                        right: 0,
                        fontFamily:
                            font?.fontFamily ||
                            "Monaco, Menlo, 'Ubuntu Mono', monospace",
                        fontSize: font?.fontSize || "14px",
                        lineHeight: lineHeightPx,
                        padding: 0,
                        margin: 0,
                    }}
                />

                <div
                    style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        overflowX: "hidden",
                    }}
                >
                    {shown.map((line, i) => (
                        <div
                            key={"static-" + i}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                minHeight: lineHeightPx,
                                lineHeight: lineHeightPx,
                            }}
                        >
                            {showLineNumbers && (
                                <span
                                    style={{
                                        color: currentTheme.lineNumber,
                                        marginRight: "16px",
                                        minWidth: "24px",
                                        textAlign: "right",
                                        userSelect: "none",
                                        flexShrink: 0,
                                    }}
                                >
                                    {i + 1}
                                </span>
                            )}
                            <span
                                style={{
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    overflowWrap: "anywhere",
                                    flex: 1,
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: line.length
                                        ? syntaxHighlight(
                                              line,
                                              normalizedLanguage,
                                              theme,
                                              customTextColor
                                          )
                                        : "&nbsp;",
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // ---- Animated mode --------------------------------------------------------
    return (
        <div
            ref={containerRef}
            style={{
                ...props.style,
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                border: "1px solid " + currentTheme.border,
                borderRadius: radius,
                padding: padding,
                overflow: "hidden",
                position: "relative",
                height: "100%",
                boxSizing: "border-box",
                fontFamily:
                    font?.fontFamily ||
                    "Monaco, Menlo, 'Ubuntu Mono', monospace",
                fontSize: font?.fontSize || "14px",
            }}
        >
            {/* Hidden measurer */}
            <div
                ref={measurerRef}
                style={{
                    position: "absolute",
                    visibility: "hidden",
                    pointerEvents: "none",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    left: 0,
                    top: 0,
                    right: 0,
                    fontFamily:
                        font?.fontFamily ||
                        "Monaco, Menlo, 'Ubuntu Mono', monospace",
                    fontSize: font?.fontSize || "14px",
                    lineHeight: lineHeightPx,
                    padding: 0,
                    margin: 0,
                }}
            />

            <div
                style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    overflowX: "hidden",
                }}
            >
                {visible.map((row, i) => {
                    const isCurrentlyTyping = isTyping && row.isPartial
                    const displayLineNumber =
                        row.absIndex >= 0 ? row.absIndex + 1 : ""

                    const motionProps: any =
                        animationType === "typewriter"
                            ? {
                                  animate: { opacity: 1 },
                                  transition: {
                                      opacity: {
                                          duration: 0.25,
                                          ease: "easeInOut",
                                      },
                                  },
                              }
                            : animationType === "fade"
                              ? {
                                    initial: { opacity: 0 },
                                    animate: { opacity: 1 },
                                    transition: {
                                        opacity: {
                                            duration: 0.4,
                                            ease: "easeOut",
                                        },
                                    },
                                }
                              : {
                                    initial: { x: -12, opacity: 0 },
                                    animate: { x: 0, opacity: 1 },
                                    transition: {
                                        x: { duration: 0.25, ease: "easeOut" },
                                        opacity: {
                                            duration: 0.25,
                                            ease: "easeInOut",
                                        },
                                    },
                                }

                    return (
                        <motion.div
                            key={
                                String(loopCount) +
                                "-" +
                                String(row.absIndex) +
                                "-" +
                                String(i)
                            }
                            {...motionProps}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                minHeight: lineHeightPx,
                                lineHeight: lineHeightPx,
                            }}
                        >
                            {showLineNumbers && (
                                <span
                                    style={{
                                        color: currentTheme.lineNumber,
                                        marginRight: "16px",
                                        minWidth: "24px",
                                        textAlign: "right",
                                        userSelect: "none",
                                        flexShrink: 0,
                                    }}
                                >
                                    {displayLineNumber}
                                </span>
                            )}
                            <span
                                style={{
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    overflowWrap: "anywhere",
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: row.text.length
                                            ? syntaxHighlight(
                                                  row.text,
                                                  normalizedLanguage,
                                                  theme,
                                                  customTextColor
                                              )
                                            : "&nbsp;",
                                    }}
                                />
                                {isCurrentlyTyping && (
                                    <motion.span
                                        animate={{ opacity: [1, 0] }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                        }}
                                        style={{
                                            display: "inline-block",
                                            width: "2px",
                                            height: "1em",
                                            backgroundColor: currentTheme.text,
                                            marginLeft: "2px",
                                        }}
                                    />
                                )}
                            </span>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

addPropertyControls(AnimatedCodeBlock, {
    code: {
        type: ControlType.String,
        title: "Code",
        defaultValue: `import { motion } from "framer-motion";`,
        displayTextArea: true,
    },
    language: {
        type: ControlType.Enum,
        title: "Language",
        options: [
            "javascript",
            "jsx",
            "typescript",
            "python",
            "java",
            "css",
            "html",
        ],
        optionTitles: [
            "JavaScript",
            "JSX",
            "TypeScript",
            "Python",
            "Java",
            "CSS",
            "HTML",
        ],
        defaultValue: "jsx",
    },
    theme: {
        type: ControlType.Enum,
        title: "Theme",
        options: ["dark", "light", "custom"],
        optionTitles: ["Dark", "Light", "Custom"],
        defaultValue: "dark",
    },
    customBackgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#1E1E1E",
        hidden: (p: any) => p.theme !== "custom",
    },
    customBorderColor: {
        type: ControlType.Color,
        title: "Border",
        defaultValue: "#333333",
        hidden: (p: any) => p.theme !== "custom",
    },
    customTextColor: {
        type: ControlType.Color,
        title: "Text",
        defaultValue: "#D4D4D4",
        hidden: (p: any) => p.theme !== "custom",
    },
    showLineNumbers: {
        type: ControlType.Boolean,
        title: "Line Numbers",
        defaultValue: true,
    },
    font: {
        type: ControlType.Font,
        title: "Font",
        defaultValue: {
            fontSize: "14px",
            letterSpacing: "0em",
            lineHeight: "1.4em",
        },
        controls: "extended",
        defaultFontType: "monospace",
    },
    animationType: {
        type: ControlType.Enum,
        title: "Animation",
        options: ["typewriter", "fade", "slide"],
        optionTitles: ["Typewriter", "Fade", "Slide"],
        defaultValue: "typewriter",
    },
    characterDelay: {
        type: ControlType.Number,
        title: "Speed",
        defaultValue: 30,
        min: 10,
        max: 200,
        step: 10,
        unit: "ms",
    },
    padding: {
        type: ControlType.Padding,
        title: "Padding",
        defaultValue: "20px",
    },
    radius: {
        type: ControlType.BorderRadius,
        title: "Radius",
        defaultValue: "8px",
    },
    linesShown: {
        type: ControlType.Number,
        title: "Lines Shown",
        defaultValue: 10,
        min: 1,
        max: 100,
        step: 1,
        displayStepper: true,
    },
    loop: { type: ControlType.Boolean, title: "Loop", defaultValue: true },
})
