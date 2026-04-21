export type Language = 'en' | 'vi';

export interface Translations {
    // Common
    solilo: string;
    subtitle: string;
    welcome: string;

    // Idle Panel
    micChecking: string;
    micReady: string;
    micNeeded: string;
    micDenied: string;
    startMockTest: string;
    prepDuration: string;
    speakDuration: string;
    noPausing: string;

    // Preparation
    prepTime: string;
    prepLabel: string;
    notesPlaceholder: string;
    skip: string;
    autoStartInfo: string;

    // Recording
    recording: string;
    recLabel: string;
    talkingPoints: string;
    tapWhenCovered: string;
    covered: string;
    noNotes: string;
    transcript: string;
    startSpeaking: string;
    pressSpace: string;
    fillersDetected: string;
    addFiller: string;
    removeFiller: string;

    // Evaluation
    evaluateYourself: string;
    listenBack: string;
    listenBackHonest: string;
    downloadRecording: string;
    submitEvaluation: string;
    submit: string;
    rateAllCriteria: string;
    tips: string;

    // Result
    yourResult: string;
    yourScore: string;
    breakdown: string;
    tryAgain: string;
    oratioPromo: string;
    oratioPromoSub: string;

    // Criteria
    fluency: string;
    lexical: string;
    grammar: string;
    pronunciation: string;

    // Rubric Details
    rubricFluencyQuestion: string;
    rubricFluency1_3Desc: string;
    rubricFluency1_3Examples: string;
    rubricFluency4_5Desc: string;
    rubricFluency4_5Examples: string;
    rubricFluency6_7Desc: string;
    rubricFluency6_7Examples: string;
    rubricFluency8_9Desc: string;
    rubricFluency8_9Examples: string;

    rubricLexicalQuestion: string;
    rubricLexical1_3Desc: string;
    rubricLexical1_3Examples: string;
    rubricLexical4_5Desc: string;
    rubricLexical4_5Examples: string;
    rubricLexical6_7Desc: string;
    rubricLexical6_7Examples: string;
    rubricLexical8_9Desc: string;
    rubricLexical8_9Examples: string;

    rubricGrammarQuestion: string;
    rubricGrammar1_3Desc: string;
    rubricGrammar1_3Examples: string;
    rubricGrammar4_5Desc: string;
    rubricGrammar4_5Examples: string;
    rubricGrammar6_7Desc: string;
    rubricGrammar6_7Examples: string;
    rubricGrammar8_9Desc: string;
    rubricGrammar8_9Examples: string;

    rubricPronunciationQuestion: string;
    rubricPronunciation1_3Desc: string;
    rubricPronunciation1_3Examples: string;
    rubricPronunciation4_5Desc: string;
    rubricPronunciation4_5Examples: string;
    rubricPronunciation6_7Desc: string;
    rubricPronunciation6_7Examples: string;
    rubricPronunciation8_9Desc: string;
    rubricPronunciation8_9Examples: string;

    // User Guide
    guideWelcome: string;
    guideIntro: string;
    guideStep1Title: string;
    guideStep1Desc: string;
    guideStep2Title: string;
    guideStep2Desc: string;
    guideStep3Title: string;
    guideStep3Desc: string;
    guideStep3Tip: string;
    guideStep4Title: string;
    guideStep4Desc: string;
    guideStep4Tip: string;
    guideStep5Title: string;
    guideStep5Desc: string;
    guideTipsTitle: string;
    guideTip1: string;
    guideTip2: string;
    guideTip3: string;
    guideTip4: string;
    guideGotIt: string;

    // Cue Card
    youShouldSay: string;
    andExplain: string;
    youWillHave: string;
    toThinkAbout: string;
}

export const translations: Record<Language, Translations> = {
    en: {
        // Common
        solilo: 'SOLILO',
        subtitle: 'IELTS Speaking Part 2 Simulator',
        welcome: 'Welcome to SOLILO',

        // Idle Panel
        micChecking: 'Checking microphone…',
        micReady: 'Microphone ready',
        micNeeded: 'Microphone permission needed',
        micDenied: 'Microphone access denied — check browser settings',
        startMockTest: 'Start Mock Test',
        prepDuration: '60 seconds to prepare.',
        speakDuration: '120 seconds to speak.',
        noPausing: 'No pausing. No excuses.',

        // Preparation
        prepTime: 'Preparation Time',
        prepLabel: 'PREP',
        notesPlaceholder: 'Jot down key points…',
        skip: 'Skip →',
        autoStartInfo: 'Recording begins automatically when time runs out.',

        // Recording
        recording: 'Recording',
        recLabel: 'REC',
        talkingPoints: 'Talking points — tap when covered',
        tapWhenCovered: 'tap when covered',
        covered: 'covered',
        noNotes: 'No notes added',
        transcript: 'Transcript',
        startSpeaking: 'Start speaking... your words will appear here',
        pressSpace: 'Press Space to mark a filler • Fillers are underlined',
        fillersDetected: 'fillers detected',
        addFiller: '+filler',
        removeFiller: 'Remove this filler',

        // Evaluation
        evaluateYourself: 'Self-Evaluation',
        listenBack: 'Listen back',
        listenBackHonest: 'Listen back. Be honest.',
        downloadRecording: 'Download Recording',
        submitEvaluation: 'Submit Evaluation',
        submit: 'Submit',
        rateAllCriteria: 'Rate all 4 criteria to continue.',
        tips: 'tips',

        // Result
        yourResult: 'Your Result',
        yourScore: 'Your Score',
        breakdown: 'Breakdown',
        tryAgain: '← Try Again',
        oratioPromo: 'Ready to step into the light?',
        oratioPromoSub: 'Practice this topic with a real human on ORATIO →',

        // Criteria
        fluency: 'Fluency & Coherence',
        lexical: 'Lexical Resource',
        grammar: 'Grammatical Range & Accuracy',
        pronunciation: 'Pronunciation',

        // Rubric Details
        rubricFluencyQuestion: 'How smoothly did you speak? Could a listener follow your ideas easily?',
        rubricFluency1_3Desc: 'Long pauses, very repetitive, hard to follow',
        rubricFluency1_3Examples: 'Frequent stops, starts over, disconnected ideas',
        rubricFluency4_5Desc: 'Noticeable pauses, some self-correction, basic linking',
        rubricFluency4_5Examples: '"And… um… so basically… yeah." Some ideas connect but flow breaks often',
        rubricFluency6_7Desc: 'Generally fluent with occasional hesitation, good use of connectors',
        rubricFluency6_7Examples: 'Speaks at length, uses "however", "for instance", minor stumbles only',
        rubricFluency8_9Desc: 'Effortless flow, natural pace, seamless topic development',
        rubricFluency8_9Examples: 'Rare hesitation, varied discourse markers, ideas build logically',

        rubricLexicalQuestion: 'How varied and precise was your vocabulary?',
        rubricLexical1_3Desc: 'Very basic words, frequent repetition, meaning unclear',
        rubricLexical1_3Examples: '"It was good… very good… I like it because it\'s good"',
        rubricLexical4_5Desc: 'Adequate for basic topics, some wrong word choices',
        rubricLexical4_5Examples: 'Can describe but lacks precision. Says "nice" instead of "captivating"',
        rubricLexical6_7Desc: 'Good range, some less common vocabulary, occasional errors',
        rubricLexical6_7Examples: 'Uses words like "fascinating", "rewarding", attempts collocations',
        rubricLexical8_9Desc: 'Wide range, precise word choice, natural idiomatic expressions',
        rubricLexical8_9Examples: '"A pivotal moment", "It left a lasting impression on me"',

        rubricGrammarQuestion: 'Did you use varied sentence structures? Were there noticeable errors?',
        rubricGrammar1_3Desc: 'Mostly memorised phrases, frequent errors distort meaning',
        rubricGrammar1_3Examples: '"Yesterday I go…", "He have tell me…" – basic structure fails',
        rubricGrammar4_5Desc: 'Simple structures mostly correct, complex ones often wrong',
        rubricGrammar4_5Examples: 'Can use past tense but struggles with conditionals or passive voice',
        rubricGrammar6_7Desc: 'Mix of simple & complex structures, errors don\'t impede understanding',
        rubricGrammar6_7Examples: 'Uses relative clauses, conditionals; occasional subject-verb agreement slips',
        rubricGrammar8_9Desc: 'Wide range of structures used accurately and flexibly',
        rubricGrammar8_9Examples: 'Inverted conditionals, passive voice, cleft sentences — all natural',

        rubricPronunciationQuestion: 'How clear was your speech? Could a native speaker understand you without effort?',
        rubricPronunciation1_3Desc: 'Very difficult to understand, many mispronounced words',
        rubricPronunciation1_3Examples: 'Listener would need to guess most words from context',
        rubricPronunciation4_5Desc: 'Generally understandable but with noticeable L1 influence',
        rubricPronunciation4_5Examples: 'Some words unclear, flat intonation, limited stress variation',
        rubricPronunciation6_7Desc: 'Clear most of the time, some effective use of stress and intonation',
        rubricPronunciation6_7Examples: 'Natural rhythm on familiar topics, occasional unclear words',
        rubricPronunciation8_9Desc: 'Easy to understand throughout, natural use of features of connected speech',
        rubricPronunciation8_9Examples: 'Appropriate word stress, intonation conveys meaning, linking sounds natural',

        // User Guide
        guideWelcome: 'Welcome to SOLILO',
        guideIntro: 'SOLILO is your IELTS Speaking Part 2 practice companion. Here\'s how it works:',
        guideStep1Title: 'Mic Check',
        guideStep1Desc: 'Allow microphone access when prompted. Test your mic to ensure clear audio.',
        guideStep2Title: 'Preparation (60s)',
        guideStep2Desc: 'Read your topic card and make notes. Use the notepad to jot down key points you want to cover.',
        guideStep3Title: 'Speaking (2min)',
        guideStep3Desc: 'Speak about the topic for up to 2 minutes. Check off talking points as you cover them.',
        guideStep3Tip: '💡 Filler words (um, uh, like, etc.) are automatically detected. Press Space to mark additional fillers.',
        guideStep4Title: 'Self-Evaluation',
        guideStep4Desc: 'Rate your performance on the four IELTS criteria: Fluency, Lexical Resource, Grammar, and Pronunciation.',
        guideStep4Tip: '💡 Use the official IELTS rubric as your guide. Be honest — this is for your improvement!',
        guideStep5Title: 'Review Results',
        guideStep5Desc: 'See your estimated band score and areas for improvement. Download your recording to review later.',
        guideTipsTitle: 'Pro Tips',
        guideTip1: 'Use a quiet environment for best speech recognition',
        guideTip2: 'Speak clearly and at a natural pace',
        guideTip3: 'Try different themes from the theme switcher in the top-right corner',
        guideTip4: 'Practice regularly to track your progress over time',
        guideGotIt: 'Got it!',

        // Cue Card
        youShouldSay: 'You should say:',
        andExplain: 'and explain',
        youWillHave: 'You will have',
        toThinkAbout: 'to think about this topic.',
    },
    vi: {
        // Common
        solilo: 'SOLILO',
        subtitle: 'Trình mô phỏng IELTS Speaking Part 2',
        welcome: 'Chào mừng bạn đến với SOLILO',

        // Idle Panel
        micChecking: 'Đang kiểm tra micro…',
        micReady: 'Micro đã sẵn sàng',
        micNeeded: 'Yêu cầu quyền truy cập micro',
        micDenied: 'Từ chối truy cập micro — vui lòng kiểm tra cài đặt trình duyệt',
        startMockTest: 'Bắt đầu thi thử',
        prepDuration: '60 giây chuẩn bị.',
        speakDuration: '120 giây trả lời.',
        noPausing: 'Không tạm dừng. Tập trung tối đa.',

        // Preparation
        prepTime: 'Thời gian chuẩn bị',
        prepLabel: 'CHUẨN BỊ',
        notesPlaceholder: 'Phác thảo các ý chính…',
        skip: 'Bỏ qua →',
        autoStartInfo: 'Hệ thống sẽ tự động ghi âm khi hết thời gian chuẩn bị.',

        // Recording
        recording: 'Đang ghi âm',
        recLabel: 'REC',
        talkingPoints: 'Dàn ý — chạm để đánh dấu ý đã nói',
        tapWhenCovered: 'chạm khi xong ý',
        covered: 'đã xong',
        noNotes: 'Chưa có ghi chú',
        transcript: 'Transcript',
        startSpeaking: 'Hãy bắt đầu nói... nội dung sẽ hiển thị tại đây',
        pressSpace: 'Nhấn Space để đánh dấu từ thừa (filler) • Từ thừa sẽ được gạch chân',
        fillersDetected: 'từ thừa được phát hiện',
        addFiller: '+ từ thừa',
        removeFiller: 'Xóa đánh dấu này',

        // Evaluation
        evaluateYourself: 'Tự đánh giá',
        listenBack: 'Nghe lại bài nói',
        listenBackHonest: 'Nghe lại và đánh giá thật khách quan nhé.',
        downloadRecording: 'Tải bản ghi âm',
        submitEvaluation: 'Gửi đánh giá',
        submit: 'Hoàn thành',
        rateAllCriteria: 'Vui lòng đánh giá đủ 4 tiêu chí để tiếp tục.',
        tips: 'mẹo nhỏ',

        // Result
        yourResult: 'Kết quả của bạn',
        yourScore: 'Điểm số ước tính',
        breakdown: 'Phân tích chi tiết',
        tryAgain: '← Làm lại bài mới',
        oratioPromo: 'Bạn đã sẵn sàng để tỏa sáng?',
        oratioPromoSub: 'Luyện tập chủ đề này với người thật trên ORATIO →',

        // Criteria
        fluency: 'Độ lưu loát & Mạch lạc',
        lexical: 'Vốn từ vựng',
        grammar: 'Độ đa dạng & Chính xác Ngữ pháp',
        pronunciation: 'Phát âm',

        // Rubric Details (Chỉnh cho giống văn phong giám khảo)
        rubricFluencyQuestion: 'Bạn nói có trôi chảy không? Người nghe có dễ dàng nắm bắt ý tưởng của bạn không?',
        rubricFluency1_3Desc: 'Ngắt quãng dài, lặp từ nhiều, rất khó theo dõi',
        rubricFluency1_3Examples: 'Thường xuyên khựng lại, phải nói lại từ đầu, ý tưởng rời rạc',
        rubricFluency4_5Desc: 'Nhiều chỗ ngập ngừng, có tự sửa lỗi, sử dụng liên từ cơ bản',
        rubricFluency4_5Examples: '"And… um… so basically…". Ý tưởng có kết nối nhưng luồng nói hay bị đứt đoạn',
        rubricFluency6_7Desc: 'Khá lưu loát, thi thoảng mới do dự, sử dụng tốt các từ nối',
        rubricFluency6_7Examples: 'Nói được các đoạn dài, biết dùng "however", "for instance", chỉ vấp nhẹ',
        rubricFluency8_9Desc: 'Nói trôi chảy tự nhiên, tốc độ ổn định, phát triển chủ đề mạch lạc',
        rubricFluency8_9Examples: 'Hiếm khi ngập ngừng, sử dụng đa dạng các từ dẫn dắt, ý tưởng logic',

        rubricLexicalQuestion: 'Vốn từ vựng của bạn có đa dạng và chính xác không?',
        rubricLexical1_3Desc: 'Từ vựng rất hạn chế, lặp từ liên tục, ý nghĩa không rõ ràng',
        rubricLexical1_3Examples: '"It was good… very good… I like it because it\'s good"',
        rubricLexical4_5Desc: 'Đủ dùng cho các chủ đề cơ bản, còn dùng sai từ khá nhiều',
        rubricLexical4_5Examples: 'Diễn đạt được ý nhưng thiếu tinh tế. Dùng "nice" thay vì "captivating"',
        rubricLexical6_7Desc: 'Vốn từ tốt, có sử dụng từ vựng nâng cao, thỉnh thoảng còn lỗi nhỏ',
        rubricLexical6_7Examples: 'Biết dùng "fascinating", "rewarding", bước đầu biết kết hợp từ (collocations)',
        rubricLexical8_9Desc: 'Vốn từ phong phú, dùng từ cực kỳ chính xác, sử dụng thành ngữ tự nhiên',
        rubricLexical8_9Examples: '"A pivotal moment", "It left a lasting impression on me"',

        rubricGrammarQuestion: 'Bạn có dùng đa dạng cấu trúc câu không? Có mắc lỗi nghiêm trọng nào không?',
        rubricGrammar1_3Desc: 'Chủ yếu dùng các câu học thuộc lòng, lỗi sai làm biến đổi ý nghĩa',
        rubricGrammar1_3Examples: '"Yesterday I go…", "He have tell me…" – sai cấu trúc cơ bản',
        rubricGrammar4_5Desc: 'Câu đơn hầu như đúng, nhưng câu phức thường xuyên mắc lỗi',
        rubricGrammar4_5Examples: 'Dùng được thì quá khứ nhưng lúng túng với câu điều kiện hoặc câu bị động',
        rubricGrammar6_7Desc: 'Phối hợp tốt câu đơn và câu phức, lỗi sai không gây khó hiểu',
        rubricGrammar6_7Examples: 'Dùng tốt mệnh đề quan hệ, câu điều kiện; thi thoảng sai chia động từ',
        rubricGrammar8_9Desc: 'Sử dụng linh hoạt và chính xác rất nhiều cấu trúc phức tạp',
        rubricGrammar8_9Examples: 'Đảo ngữ, câu bị động, câu chẻ — tất cả đều rất tự nhiên',

        rubricPronunciationQuestion: 'Cách phát âm có rõ ràng không? Người bản ngữ có hiểu bạn dễ dàng không?',
        rubricPronunciation1_3Desc: 'Rất khó hiểu, phát âm sai nhiều từ trọng tâm',
        rubricPronunciation1_3Examples: 'Người nghe phải đoán ý dựa trên ngữ cảnh là chính',
        rubricPronunciation4_5Desc: 'Nhìn chung là hiểu được nhưng bị ảnh hưởng nặng bởi tiếng mẹ đẻ',
        rubricPronunciation4_5Examples: 'Nhiều từ chưa rõ, giọng đều đều, thiếu nhấn nhá trọng âm',
        rubricPronunciation6_7Desc: 'Phát âm rõ ràng, biết nhấn trọng âm và ngữ điệu khá hiệu quả',
        rubricPronunciation6_7Examples: 'Nhịp điệu tự nhiên với chủ đề quen thuộc, thi thoảng có từ chưa chuẩn',
        rubricPronunciation8_9Desc: 'Dễ hiểu xuyên suốt bài nói, sử dụng tự nhiên các kỹ thuật nối âm',
        rubricPronunciation8_9Examples: 'Nhấn trọng âm chuẩn, ngữ điệu giàu cảm xúc, nối âm mượt mà',

        // User Guide
        guideWelcome: 'Chào mừng bạn đến với SOLILO',
        guideIntro: 'SOLILO là người bạn đồng hành giúp bạn luyện IELTS Speaking Part 2. Cách thức hoạt động như sau:',
        guideStep1Title: 'Kiểm tra Micro',
        guideStep1Desc: 'Cấp quyền truy cập micro và kiểm tra lại âm thanh để đảm bảo ghi âm rõ nét.',
        guideStep2Title: 'Chuẩn bị (60 giây)',
        guideStep2Desc: 'Đọc yêu cầu đề bài và ghi chú nhanh các ý chính vào sổ tay điện tử.',
        guideStep3Title: 'Nói (2 phút)',
        guideStep3Desc: 'Trình bày chủ đề trong tối đa 2 phút. Chạm vào các ý chính để đánh dấu tiến độ.',
        guideStep3Tip: '💡 Các từ thừa (um, uh, like...) sẽ được tự động nhận diện. Nhấn Space để tự đánh dấu thêm.',
        guideStep4Title: 'Tự đánh giá',
        guideStep4Desc: 'Chấm điểm bài nói của mình dựa trên 4 tiêu chí IELTS: Lưu loát, Từ vựng, Ngữ pháp và Phát âm.',
        guideStep4Tip: '💡 Hãy dùng thang điểm (rubric) IELTS làm chuẩn. Càng trung thực, bạn càng nhanh tiến bộ!',
        guideStep5Title: 'Xem kết quả',
        guideStep5Desc: 'Xem điểm Band dự kiến và những điểm cần cải thiện. Bạn có thể tải bản ghi âm để nghe lại.',
        guideTipsTitle: 'Mẹo nhỏ cho bạn',
        guideTip1: 'Chọn không gian yên tĩnh để công nhận diện giọng nói hoạt động tốt nhất',
        guideTip2: 'Nói rõ ràng với tốc độ tự nhiên như đang trò chuyện',
        guideTip3: 'Thay đổi giao diện (theme) ở góc trên bên phải để tạo cảm hứng nhé',
        guideTip4: 'Luyện tập đều đặn mỗi ngày để thấy rõ sự tiến bộ',
        guideGotIt: 'Bắt đầu thôi!',

        // Cue Card
        youShouldSay: 'Bạn nên đề cập đến:',
        andExplain: 'và giải thích',
        youWillHave: 'Bạn sẽ có',
        toThinkAbout: 'để suy nghĩ về chủ đề này.',
    },
};
