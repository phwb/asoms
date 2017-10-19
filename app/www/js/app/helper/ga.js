define([], function () {
    // заглушка для Google Analytics
    var ga = {
        trackView: console.log,
        trackEvent: console.log,
        startTrackerWithId: console.log
    }

    return window.ga || ga
})
