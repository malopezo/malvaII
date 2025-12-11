import type { ComponentType } from "react"
import { useState, useRef, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useInView } from "framer-motion"

function showOnce(Component, expiryHours): ComponentType {
    return (props: any) => {
        const COOKIE_NAME = `preload_${props.id}`
        const ref = useRef(null)
        const isInView = useInView(ref)
        const [cookies, setCookie] = useCookies([COOKIE_NAME])
        const [hasVisited, setHasVisited] = useState(false)

        useEffect(() => {
            setHasVisited(cookies[COOKIE_NAME] || false)
        }, [])
        useEffect(() => {
            if (isInView) {
                setCookie(COOKIE_NAME, true, {
                    expires: getExpirationDate(expiryHours),
                })
            }
        }, [isInView])

        // Apply all props directly to Component to preserve external styling and sizing
        return !hasVisited ? <Component {...props} ref={ref} /> : null
    }
}
const getExpirationDate = (hours) => {
    const expirationDate = new Date()
    expirationDate.setTime(expirationDate.getTime() + hours * 60 * 60 * 1000)
    return expirationDate
}
export const showOncePerHour = (Component): ComponentType =>
    showOnce(Component, 1)
export const showOncePerDay = (Component): ComponentType =>
    showOnce(Component, 24)
export const showOncePerWeek = (Component): ComponentType =>
    showOnce(Component, 24 * 7)
export const showOncePerMonth = (Component): ComponentType =>
    showOnce(Component, 24 * 30)
export const showOncePer3Months = (Component): ComponentType =>
    showOnce(Component, 24 * 30 * 3)
