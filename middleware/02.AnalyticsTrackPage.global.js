export default defineNuxtRouteMiddleware((to, from) => {
    // skip middleware on server
    if (import.meta.server) return
    const mixpanel = useMixpanel()
    mixpanel.track_pageview({
        "page": to.path
    });
    return;
})