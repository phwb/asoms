define([], function () {
    // заглушка для Google Analytics
    var ga = {
        trackView: function () {},
        trackEvent: function () {},
        startTrackerWithId: function () {}
    }

    return window.ga || ga
})
