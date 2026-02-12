// ══════════════════════════════════════════════════════════
//  CircularHub — i18n Translation Module
//  Supports: English (en), Tamil (ta), Telugu (te)
// ══════════════════════════════════════════════════════════

const translations = {
    en: {
        // ── Top Bar ──
        hello: 'Hello',
        logout: 'Logout',
        newCircular: '+ New Circular',

        // ── Tabs ──
        tabCirculars: '📢 Circulars',
        tabCalendar: '📅 Calendar',
        tabFeedback: '💡 Feedback',
        tabAnalytics: '📊 Analytics',
        tabBus: '🚌 Bus',

        // ── Circulars ──
        noCirculars: 'No circulars to show.',
        failedCirculars: 'Failed to load circulars.',
        markAsRead: 'Mark as Read',
        read: '✓ Read',
        markedAsRead: 'Marked as read',
        pinned: '📌 Pinned',
        byYou: 'You',
        by: 'By',
        readLabel: 'read',

        // ── Create Circular ──
        backToDashboard: '← Back to Dashboard',
        createTitle: 'Create New Circular',
        titleLabel: 'Title',
        titlePlaceholder: 'Circular title',
        contentLabel: 'Content',
        contentPlaceholder: 'Write the circular content…',
        priorityLabel: 'Priority',
        priorityLow: 'Low',
        priorityMedium: 'Medium',
        priorityUrgent: 'Urgent',
        targetRole: 'Target Role',
        everyone: 'Everyone',
        studentsOnly: 'Students Only',
        staffOnly: 'Staff Only',
        targetDept: 'Target Department',
        allDepts: 'All Departments',
        targetYear: 'Target Year',
        allYears: 'All Years',
        attachmentLabel: '📎 Attachment (PDF or Image, max 10 MB)',
        attachmentHint: 'Optional — students will see this inside the circular detail view.',
        eventDateLabel: '📅 Event Date (optional)',
        eventDateHint: 'If set, this circular will appear on the calendar on this date.',
        eventTypeLabel: 'Event Type',
        eventGeneral: '🎯 General Event',
        eventCelebration: '🎉 Celebration',
        eventExam: '📝 Exam',
        eventHoliday: '🏖️ Holiday',
        eventWorkshop: '🔧 Workshop',
        eventSeminar: '🎤 Seminar',
        eventDeadline: '⏰ Deadline',
        publishBtn: 'Publish Circular',
        publishing: 'Publishing…',
        published: 'Circular published!',
        titleContentRequired: 'Title and content are required',

        // ── Calendar ──
        syncGoogle: 'Sync Google Calendar',
        eventsFor: 'Events for',
        failedCalendar: 'Failed to load calendar events.',
        noDescription: 'No description provided',

        // ── Bus ──
        busSchedule: '🚌 Bus Schedule',
        noBus: 'No bus schedules available.',
        failedBus: 'Failed to load bus schedule.',
        route: 'Route',
        time: 'Time',
        stops: 'Stops',

        // ── Feedback ──
        shareIdeas: '💡 Share Your Ideas',
        feedbackHint: 'Help us improve the college or this platform! Your feedback is visible to staff and administrators.',
        feedbackPlaceholder: 'Describe your idea or suggestion...',
        submitFeedback: 'Submit Feedback',
        sending: 'Sending…',
        feedbackSubmitted: 'Feedback submitted! Thank you 🙏',
        noFeedback: 'No feedback yet.',
        failedFeedback: 'Failed to load feedback.',
        studentFeedback: '💡 Student Feedback',
        categoryGeneral: 'General',
        categoryWebsite: 'Website Improvement',
        categoryCollege: 'College Improvement',
        categoryAcademics: 'Academics',
        categoryInfra: 'Infrastructure',

        // ── Analytics ──
        engagementTitle: '📊 Engagement Analytics',
        circulars: 'Circulars',
        totalReads: 'Total Reads',
        readRate: 'Read Rate',
        comments: 'Comments',
        overallReach: 'Overall Reach',
        recentPerformance: 'Recent Circulars Performance',
        colTitle: 'Title',
        colPriority: 'Priority',
        colAudience: 'Audience',
        colReads: 'Reads',
        colReadRate: 'Read Rate',
        colPublished: 'Published',
        noCircularsYet: 'No circulars yet.',
        failedAnalytics: 'Failed to load analytics.',

        // ── Detail Modal ──
        readAnalytics: '📊 Read Analytics',
        readWord: 'Read',
        unread: 'Unread',
        total: 'Total',
        publishedBy: 'Published by',
        on: 'on',
        commentsTitle: '💬 Comments & Feedback',
        loadingComments: 'Loading comments...',
        noComments: 'No comments yet. Be the first to share feedback!',
        failedComments: 'Failed to load comments.',
        writeComment: 'Write a comment...',
        send: 'Send',

        // ── Auth ──
        loginTitle: 'Login',
        signupTitle: 'Sign Up',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        nameLabel: 'Full Name',
        departmentLabel: 'Department',
        yearLabel: 'Year',
        roleLabel: 'Role',
        student: 'Student',
        staff: 'Staff',
        admin: 'Admin',
        loginBtn: 'Login',
        signupBtn: 'Sign Up',
        noAccount: "Don't have an account?",
        haveAccount: 'Already have an account?',
        langLabel: 'Language',
    },

    ta: {
        // ── Top Bar ──
        hello: 'வணக்கம்',
        logout: 'வெளியேறு',
        newCircular: '+ புதிய சுற்றறிக்கை',

        // ── Tabs ──
        tabCirculars: '📢 சுற்றறிக்கைகள்',
        tabCalendar: '📅 நாள்காட்டி',
        tabFeedback: '💡 கருத்து',
        tabAnalytics: '📊 பகுப்பாய்வு',
        tabBus: '🚌 பேருந்து',

        // ── Circulars ──
        noCirculars: 'காண்பிக்க சுற்றறிக்கைகள் இல்லை.',
        failedCirculars: 'சுற்றறிக்கைகளை ஏற்ற முடியவில்லை.',
        markAsRead: 'படித்ததாகக் குறிக்கவும்',
        read: '✓ படித்தது',
        markedAsRead: 'படித்ததாகக் குறிக்கப்பட்டது',
        pinned: '📌 பின் செய்யப்பட்டது',
        byYou: 'நீங்கள்',
        by: 'எழுதியவர்',
        readLabel: 'படித்தவர்கள்',

        // ── Create Circular ──
        backToDashboard: '← முகப்புக்குத் திரும்பு',
        createTitle: 'புதிய சுற்றறிக்கை உருவாக்கு',
        titleLabel: 'தலைப்பு',
        titlePlaceholder: 'சுற்றறிக்கை தலைப்பு',
        contentLabel: 'உள்ளடக்கம்',
        contentPlaceholder: 'சுற்றறிக்கை உள்ளடக்கத்தை எழுதுங்கள்…',
        priorityLabel: 'முன்னுரிமை',
        priorityLow: 'குறைவு',
        priorityMedium: 'நடுத்தரம்',
        priorityUrgent: 'அவசரம்',
        targetRole: 'இலக்கு பங்கு',
        everyone: 'அனைவரும்',
        studentsOnly: 'மாணவர்கள் மட்டும்',
        staffOnly: 'ஊழியர்கள் மட்டும்',
        targetDept: 'இலக்கு துறை',
        allDepts: 'அனைத்து துறைகளும்',
        targetYear: 'இலக்கு ஆண்டு',
        allYears: 'அனைத்து ஆண்டுகளும்',
        attachmentLabel: '📎 இணைப்பு (PDF அல்லது படம், அதிகபட்சம் 10 MB)',
        attachmentHint: 'விரும்பினால் — மாணவர்கள் சுற்றறிக்கை விவரத்தில் இதைப் பார்ப்பார்கள்.',
        eventDateLabel: '📅 நிகழ்வு தேதி (விரும்பினால்)',
        eventDateHint: 'அமைத்தால், இந்த சுற்றறிக்கை நாள்காட்டியில் இந்த தேதியில் தோன்றும்.',
        eventTypeLabel: 'நிகழ்வு வகை',
        eventGeneral: '🎯 பொது நிகழ்வு',
        eventCelebration: '🎉 கொண்டாட்டம்',
        eventExam: '📝 தேர்வு',
        eventHoliday: '🏖️ விடுமுறை',
        eventWorkshop: '🔧 பயிலரங்கம்',
        eventSeminar: '🎤 கருத்தரங்கம்',
        eventDeadline: '⏰ காலக்கெடு',
        publishBtn: 'சுற்றறிக்கை வெளியிடு',
        publishing: 'வெளியிடுகிறது…',
        published: 'சுற்றறிக்கை வெளியிடப்பட்டது!',
        titleContentRequired: 'தலைப்பு மற்றும் உள்ளடக்கம் தேவை',

        // ── Calendar ──
        syncGoogle: 'Google காலெண்டரை இணைக்கவும்',
        eventsFor: 'நிகழ்வுகள்',
        failedCalendar: 'நாள்காட்டி நிகழ்வுகளை ஏற்ற முடியவில்லை.',
        noDescription: 'விவரிப்பு எதுவும் கொடுக்கப்படவில்லை',

        // ── Bus ──
        busSchedule: '🚌 பேருந்து அட்டவணை',
        noBus: 'பேருந்து அட்டவணை கிடைக்கவில்லை.',
        failedBus: 'பேருந்து அட்டவணையை ஏற்ற முடியவில்லை.',
        route: 'வழித்தடம்',
        time: 'நேரம்',
        stops: 'நிறுத்தங்கள்',

        // ── Feedback ──
        shareIdeas: '💡 உங்கள் யோசனைகளைப் பகிருங்கள்',
        feedbackHint: 'கல்லூரியை அல்லது இந்த தளத்தை மேம்படுத்த உதவுங்கள்! உங்கள் கருத்து ஊழியர்களுக்கும் நிர்வாகிகளுக்கும் தெரியும்.',
        feedbackPlaceholder: 'உங்கள் யோசனையை விவரிக்கவும்...',
        submitFeedback: 'கருத்தை சமர்ப்பிக்கவும்',
        sending: 'அனுப்புகிறது…',
        feedbackSubmitted: 'கருத்து சமர்ப்பிக்கப்பட்டது! நன்றி 🙏',
        noFeedback: 'இதுவரை கருத்துகள் இல்லை.',
        failedFeedback: 'கருத்துகளை ஏற்ற முடியவில்லை.',
        studentFeedback: '💡 மாணவர் கருத்துகள்',
        categoryGeneral: 'பொது',
        categoryWebsite: 'இணையதள மேம்பாடு',
        categoryCollege: 'கல்லூரி மேம்பாடு',
        categoryAcademics: 'கல்வி',
        categoryInfra: 'உள்கட்டமைப்பு',

        // ── Analytics ──
        engagementTitle: '📊 ஈடுபாட்டு பகுப்பாய்வு',
        circulars: 'சுற்றறிக்கைகள்',
        totalReads: 'படிக்கப்பட்டவை',
        readRate: 'படிப்பு விகிதம்',
        comments: 'கருத்துகள்',
        overallReach: 'ஒட்டுமொத்த அடைவு',
        recentPerformance: 'சமீபத்திய சுற்றறிக்கை செயல்திறன்',
        colTitle: 'தலைப்பு',
        colPriority: 'முன்னுரிமை',
        colAudience: 'பார்வையாளர்கள்',
        colReads: 'படித்தவர்',
        colReadRate: 'படிப்பு விகிதம்',
        colPublished: 'வெளியிடப்பட்டது',
        noCircularsYet: 'இதுவரை சுற்றறிக்கைகள் இல்லை.',
        failedAnalytics: 'பகுப்பாய்வை ஏற்ற முடியவில்லை.',

        // ── Detail Modal ──
        readAnalytics: '📊 படிப்பு பகுப்பாய்வு',
        readWord: 'படித்தது',
        unread: 'படிக்கவில்லை',
        total: 'மொத்தம்',
        publishedBy: 'வெளியிட்டவர்',
        on: 'தேதி',
        commentsTitle: '💬 கருத்துகள் & பின்னூட்டம்',
        loadingComments: 'கருத்துகளை ஏற்றுகிறது...',
        noComments: 'இதுவரை கருத்துகள் இல்லை. முதலாவதாக பகிருங்கள்!',
        failedComments: 'கருத்துகளை ஏற்ற முடியவில்லை.',
        writeComment: 'கருத்தை எழுதுங்கள்...',
        send: 'அனுப்பு',

        // ── Auth ──
        loginTitle: 'உள்நுழைவு',
        signupTitle: 'பதிவு',
        emailLabel: 'மின்னஞ்சல்',
        passwordLabel: 'கடவுச்சொல்',
        nameLabel: 'முழு பெயர்',
        departmentLabel: 'துறை',
        yearLabel: 'ஆண்டு',
        roleLabel: 'பங்கு',
        student: 'மாணவர்',
        staff: 'ஊழியர்',
        admin: 'நிர்வாகி',
        loginBtn: 'உள்நுழைக',
        signupBtn: 'பதிவு செய்க',
        noAccount: 'கணக்கு இல்லையா?',
        haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
        langLabel: 'மொழி',
    },

    te: {
        // ── Top Bar ──
        hello: 'నమస్కారం',
        logout: 'లాగ్ అవుట్',
        newCircular: '+ కొత్త సర్క్యులర్',

        // ── Tabs ──
        tabCirculars: '📢 సర్క్యులర్లు',
        tabCalendar: '📅 క్యాలెండర్',
        tabFeedback: '💡 ఫీడ్‌బ్యాక్',
        tabAnalytics: '📊 అనలిటిక్స్',
        tabBus: '🚌 బస్సు',

        // ── Circulars ──
        noCirculars: 'చూపించడానికి సర్క్యులర్లు లేవు.',
        failedCirculars: 'సర్క్యులర్లు లోడ్ చేయడం విఫలమైంది.',
        markAsRead: 'చదివినట్లు గుర్తించు',
        read: '✓ చదివారు',
        markedAsRead: 'చదివినట్లు గుర్తించబడింది',
        pinned: '📌 పిన్ చేయబడింది',
        byYou: 'మీరు',
        by: 'రాసిన',
        readLabel: 'చదివారు',

        // ── Create Circular ──
        backToDashboard: '← డాష్‌బోర్డ్‌కు తిరిగి వెళ్ళు',
        createTitle: 'కొత్త సర్క్యులర్ సృష్టించు',
        titleLabel: 'శీర్షిక',
        titlePlaceholder: 'సర్క్యులర్ శీర్షిక',
        contentLabel: 'కంటెంట్',
        contentPlaceholder: 'సర్క్యులర్ కంటెంట్ రాయండి…',
        priorityLabel: 'ప్రాధాన్యత',
        priorityLow: 'తక్కువ',
        priorityMedium: 'మధ్యస్థం',
        priorityUrgent: 'అత్యవసరం',
        targetRole: 'లక్ష్య పాత్ర',
        everyone: 'అందరూ',
        studentsOnly: 'విద్యార్థులు మాత్రమే',
        staffOnly: 'సిబ్బంది మాత్రమే',
        targetDept: 'లక్ష్య విభాగం',
        allDepts: 'అన్ని విభాగాలు',
        targetYear: 'లక్ష్య సంవత్సరం',
        allYears: 'అన్ని సంవత్సరాలు',
        attachmentLabel: '📎 అటాచ్‌మెంట్ (PDF లేదా చిత్రం, గరిష్టంగా 10 MB)',
        attachmentHint: 'ఐచ్ఛికం — విద్యార్థులు సర్క్యులర్ వివరాల్లో చూస్తారు.',
        eventDateLabel: '📅 ఈవెంట్ తేదీ (ఐచ్ఛికం)',
        eventDateHint: 'సెట్ చేస్తే, ఈ సర్క్యులర్ క్యాలెండర్‌లో ఈ తేదీన కనిపిస్తుంది.',
        eventTypeLabel: 'ఈవెంట్ రకం',
        eventGeneral: '🎯 సాధారణ ఈవెంట్',
        eventCelebration: '🎉 వేడుక',
        eventExam: '📝 పరీక్ష',
        eventHoliday: '🏖️ సెలవు',
        eventWorkshop: '🔧 వర్క్‌షాప్',
        eventSeminar: '🎤 సెమినార్',
        eventDeadline: '⏰ గడువు',
        publishBtn: 'సర్క్యులర్ ప్రచురించు',
        publishing: 'ప్రచురిస్తోంది…',
        published: 'సర్క్యులర్ ప్రచురించబడింది!',
        titleContentRequired: 'శీర్షిక మరియు కంటెంట్ అవసరం',

        // ── Calendar ──
        syncGoogle: 'Google క్యాలెండర్ సింక్ చేయండి',
        eventsFor: 'ఈవెంట్‌లు',
        failedCalendar: 'క్యాలెండర్ ఈవెంట్‌లు లోడ్ చేయడం విఫలమైంది.',
        noDescription: 'వివరణ అందించబడలేదు',

        // ── Bus ──
        busSchedule: '🚌 బస్సు షెడ్యూల్',
        noBus: 'బస్సు షెడ్యూల్ అందుబాటులో లేదు.',
        failedBus: 'బస్సు షెడ్యూల్ లోడ్ చేయడం విఫలమైంది.',
        route: 'రూట్',
        time: 'సమయం',
        stops: 'స్టాప్‌లు',

        // ── Feedback ──
        shareIdeas: '💡 మీ ఆలోచనలు పంచుకోండి',
        feedbackHint: 'కళాశాల లేదా ఈ ప్లాట్‌ఫారమ్‌ను మెరుగుపరచడంలో సహాయపడండి! మీ ఫీడ్‌బ్యాక్ సిబ్బంది మరియు నిర్వాహకులకు కనిపిస్తుంది.',
        feedbackPlaceholder: 'మీ ఆలోచన లేదా సూచనను వివరించండి...',
        submitFeedback: 'ఫీడ్‌బ్యాక్ సమర్పించండి',
        sending: 'పంపుతోంది…',
        feedbackSubmitted: 'ఫీడ్‌బ్యాక్ సమర్పించబడింది! ధన్యవాదాలు 🙏',
        noFeedback: 'ఇంకా ఫీడ్‌బ్యాక్ లేదు.',
        failedFeedback: 'ఫీడ్‌బ్యాక్ లోడ్ చేయడం విఫలమైంది.',
        studentFeedback: '💡 విద్యార్థి ఫీడ్‌బ్యాక్',
        categoryGeneral: 'సాధారణం',
        categoryWebsite: 'వెబ్‌సైట్ మెరుగుదల',
        categoryCollege: 'కళాశాల మెరుగుదల',
        categoryAcademics: 'అకాడమిక్స్',
        categoryInfra: 'మౌలిక సదుపాయాలు',

        // ── Analytics ──
        engagementTitle: '📊 ఎంగేజ్‌మెంట్ అనలిటిక్స్',
        circulars: 'సర్క్యులర్లు',
        totalReads: 'మొత్తం రీడ్‌లు',
        readRate: 'రీడ్ రేట్',
        comments: 'కామెంట్లు',
        overallReach: 'మొత్తం రీచ్',
        recentPerformance: 'ఇటీవలి సర్క్యులర్ పనితీరు',
        colTitle: 'శీర్షిక',
        colPriority: 'ప్రాధాన్యత',
        colAudience: 'ప్రేక్షకులు',
        colReads: 'రీడ్‌లు',
        colReadRate: 'రీడ్ రేట్',
        colPublished: 'ప్రచురించబడింది',
        noCircularsYet: 'ఇంకా సర్క్యులర్లు లేవు.',
        failedAnalytics: 'అనలిటిక్స్ లోడ్ చేయడం విఫలమైంది.',

        // ── Detail Modal ──
        readAnalytics: '📊 రీడ్ అనలిటిక్స్',
        readWord: 'చదివారు',
        unread: 'చదవలేదు',
        total: 'మొత్తం',
        publishedBy: 'ప్రచురించినది',
        on: 'న',
        commentsTitle: '💬 కామెంట్లు & ఫీడ్‌బ్యాక్',
        loadingComments: 'కామెంట్లు లోడ్ అవుతున్నాయి...',
        noComments: 'ఇంకా కామెంట్లు లేవు. మొదటివారు కండి!',
        failedComments: 'కామెంట్లు లోడ్ చేయడం విఫలమైంది.',
        writeComment: 'కామెంట్ రాయండి...',
        send: 'పంపు',

        // ── Auth ──
        loginTitle: 'లాగిన్',
        signupTitle: 'సైన్ అప్',
        emailLabel: 'ఇమెయిల్',
        passwordLabel: 'పాస్‌వర్డ్',
        nameLabel: 'పూర్తి పేరు',
        departmentLabel: 'విభాగం',
        yearLabel: 'సంవత్సరం',
        roleLabel: 'పాత్ర',
        student: 'విద్యార్థి',
        staff: 'సిబ్బంది',
        admin: 'నిర్వాహకుడు',
        loginBtn: 'లాగిన్',
        signupBtn: 'సైన్ అప్',
        noAccount: 'ఖాతా లేదా?',
        haveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
        langLabel: 'భాష',
    },
};

let currentLang = localStorage.getItem('ch_lang') || 'en';

/**
 * Get translation for a key
 */
export function t(key) {
    return (translations[currentLang] && translations[currentLang][key])
        || translations.en[key]
        || key;
}

/**
 * Get current language code
 */
export function getLang() {
    return currentLang;
}

/**
 * Set language and persist to localStorage
 */
export function setLang(lang) {
    if (translations[lang]) {
        currentLang = lang;
        localStorage.setItem('ch_lang', lang);
    }
}

/**
 * Available languages
 */
export const languages = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
];
