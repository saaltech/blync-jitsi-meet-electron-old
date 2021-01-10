
export default {
    /**
     * The URL with extra information about the app / service.
     */
    aboutURL: 'https://jitsi.org/what-is-jitsi/',

    /**
     * The URL to the source code repository.
     */
    sourceURL: 'https://github.com/jitsi/jitsi-meet-electron',

    /**
     * Application name.
     */
    appName: 'JifMeet',

    /**
    * The prefix for application protocol.
    * You will also need to replace this in package.json.
    */
    appProtocolPrefix: 'jitsi-meet',

    /**
     * The default server URL of Jitsi Meet Deployment that will be used.
     */
    defaultServerURL: 'https://dev-jifmeet.saal.ai',

    /**
     * The default server Timeout in seconds.
     */
    defaultServerTimeout: 30,

    /**
     * URL to send feedback.
     */
    feedbackURL: 'mailto:support@jitsi.org',

    /**
     * The URL of Privacy Policy Page.
     */
    privacyPolicyURL: 'https://jitsi.org/meet/privacy',

    /**
     * The URL of Terms and Conditions Page.
     */
    termsAndConditionsURL: 'https://jitsi.org/meet/terms',

    enableCalendarIntegration: true,
    googleApiApplicationClientID: '143401360954-91aq4dbaj70tj4q6demjgsj5odk1bppt.apps.googleusercontent.com',


    config: {
        unauthenticatedIRP: "/irp",
        authenticatedIRP: "/authenticate-irp",
        conferenceManager: "/blync-mgmt",


        // ==== blync-mgmt Endpoints ====
        conferenceEP: "/auth/api/v1/conferences",
        unauthConferenceEP: "/unauth/api/v1/conferences",
        verifySecretEP: "/unauth/api/v1/conferences/validatesecret",
        jidEP: "/auth/api/v1/jid",
        unauthParticipantsEP: "/unauth/api/v1/participants",
        authParticipantsEP: "/auth/api/v1/participants",


        // IRP Endpoints
        signInEP: '/api/users/sign-in',
        socialSignInEP: '/api/users/social-sign-in',
        refreshToken: '/api/users/accesstoken/refresh'

    }
};


