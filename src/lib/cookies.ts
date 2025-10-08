import Cookies from "js-cookie"

export const getCsrfToken = () => Cookies.get("csrftoken")
export const getSessionId = () => Cookies.get("sessionid")
export const setSessionCookies = (headers: Headers) => {
}
