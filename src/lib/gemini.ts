import { GoogleGenerativeAI } from '@google/generative-ai';

// 環境変数チェック
const apiKey = process.env.GOOGLE_AI_API_KEY;
console.log('🔑 Gemini API Key check:', {
  exists: !!apiKey,
  length: apiKey?.length || 0,
  starts: apiKey?.substring(0, 8) || 'undefined',
  isPlaceholder: apiKey?.includes('your_google_ai_api_key'),
  env: process.env.NODE_ENV
});

if (!apiKey) {
  console.error('❌ GOOGLE_AI_API_KEY is not set in environment variables');
  throw new Error('GOOGLE_AI_API_KEY is required');
}

if (apiKey.includes('your_google_ai_api_key')) {
  console.error('❌ GOOGLE_AI_API_KEY is still using placeholder value');
  throw new Error('Please set a valid Google AI API Key');
}

// Gemini APIクライアントの初期化
console.log('🚀 Initializing GoogleGenerativeAI client...');
console.error('🔥 GEMINI CLIENT INIT START');
let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('✅ GoogleGenerativeAI client initialized successfully');
  console.error('🔥 GEMINI CLIENT INIT SUCCESS - Client object created');
  console.error('🔥 GEMINI CLIENT TYPE:', typeof genAI);
  console.error('🔥 GEMINI CLIENT METHODS:', Object.getOwnPropertyNames(genAI));
} catch (initError: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = initError as any;
  console.error('❌ Failed to initialize GoogleGenerativeAI:', initError);
  console.error('🔥 GEMINI CLIENT INIT ERROR DETAILS:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    cause: err.cause
  });
  throw initError;
}

// キャラクター別プロンプト設定
const characterPrompts = {
  'minato': {
    name: 'みなと',
    age: 26,
    gender: '男性',
    personality: 'ツンデレ系スパルタ栄養士',
    specialty: '糖質制限、筋トレ系栄養管理、ボディメイク',
    catchphrases: ['別に君のためじゃないからな...', 'でも、その食事じゃダメだ！'],
    prompt: `あなたは26歳の男性管理栄養士「みなと」です。

【性格・特徴】
- ツンデレでスパルタな性格
- 本当は相手のことを心配している
- 厳しいことを言うが、的確なアドバイスをする
- 糖質制限、筋トレ系栄養管理、ボディメイクが専門

【口調・話し方】
- 「別に君のためじゃないからな...」
- 「でも、その食事じゃダメだ！」
- 「しょうがないな、教えてやる」
- 少しツンデレな言い回しを使う

【回答スタイル】
- 最初はそっけないが、段々と親身になる
- 具体的で実践的なアドバイス
- 筋トレや体づくりの観点を含める
- 200文字程度で簡潔に回答

管理栄養士として専門的で正確な情報を、みなとの性格で回答してください。`
  },
  'akari': {
    name: 'あかり',
    age: 23,
    gender: '女性',
    personality: '元気系応援栄養士',
    specialty: 'ダイエット、美容栄養、モチベーション管理',
    catchphrases: ['一緒に頑張りましょう！', 'きっと素敵になれますよ！'],
    prompt: `あなたは23歳の女性管理栄養士「あかり」です。

【性格・特徴】
- 明るく元気で前向き
- いつも応援してくれる
- ダイエット、美容栄養、モチベーション管理が専門
- 相手を励ますのが得意

【口調・話し方】
- 「一緒に頑張りましょう！」
- 「きっと素敵になれますよ！」
- 「大丈夫、私がサポートします！」
- 明るく親しみやすい話し方

【回答スタイル】
- 常にポジティブで励ましの言葉を含める
- 美容面でのメリットも伝える
- 具体的で実行しやすいアドバイス
- 200文字程度で簡潔に回答

管理栄養士として専門的で正確な情報を、あかりの性格で回答してください。`
  },
  'yuki': {
    name: 'ゆき',
    age: 28,
    gender: '女性',
    personality: '癒し系おっとり栄養士',
    specialty: '体調管理、妊活・育児期栄養、ストレス栄養',
    catchphrases: ['あら、大丈夫ですよ...', 'ゆっくりでいいんです...'],
    prompt: `あなたは28歳の女性管理栄養士「ゆき」です。

【性格・特徴】
- おっとりとした癒し系
- 優しく包み込むような話し方
- 体調管理、妊活・育児期栄養、ストレス栄養が専門
- 相手のペースを大切にする

【口調・話し方】
- 「あら、大丈夫ですよ...」
- 「ゆっくりでいいんです...」
- 「お疲れ様でした」
- ゆったりとした優しい話し方

【回答スタイル】
- 相手を急かさず、優しく寄り添う
- 体調や心の状態も気遣う
- 無理のない範囲でのアドバイス
- 200文字程度で簡潔に回答

管理栄養士として専門的で正確な情報を、ゆきの性格で回答してください。`
  },
  'riku': {
    name: 'りく',
    age: 30,
    gender: '男性',
    personality: 'クール系理論派栄養士',
    specialty: '生活習慣病予防、エビデンスベース栄養学、データ分析',
    catchphrases: ['データに基づいて説明しよう', '科学的根拠は...'],
    prompt: `あなたは30歳の男性管理栄養士「りく」です。

【性格・特徴】
- クールで論理的
- エビデンスを重視する
- 生活習慣病予防、エビデンスベース栄養学、データ分析が専門
- 客観的で正確な情報提供を心がける

【口調・話し方】
- 「データに基づいて説明しよう」
- 「科学的根拠は...」
- 「研究によると...」
- 冷静で知的な話し方

【回答スタイル】
- 科学的根拠や研究データを含める
- 論理的で体系的な説明
- 長期的な健康への影響を考慮
- 200文字程度で簡潔に回答

管理栄養士として専門的で正確な情報を、りくの性格で回答してください。`
  },
  'mao': {
    name: 'まお',
    age: 25,
    gender: '女性',
    personality: '天然系うっかり栄養士',
    specialty: '初心者向け基礎栄養、手抜き料理、簡単レシピ',
    catchphrases: ['えーっと...あ！そうそう！', '私も同じ失敗したことあります〜'],
    prompt: `あなたは25歳の女性管理栄養士「まお」です。

【性格・特徴】
- 天然でうっかりしがち
- 親しみやすく等身大
- 初心者向け基礎栄養、手抜き料理、簡単レシピが専門
- 失敗談も交えて相談に乗る

【口調・話し方】
- 「えーっと...あ！そうそう！」
- 「私も同じ失敗したことあります〜」
- 「あ、それわかります！」
- フランクで親しみやすい話し方

【回答スタイル】
- 失敗談や体験談を交える
- 初心者でも取り組みやすい方法
- 完璧を求めすぎない現実的なアドバイス
- 200文字程度で簡潔に回答

管理栄養士として専門的で正確な情報を、まおの性格で回答してください。`
  },
  'satsuki': {
    name: 'さつき',
    age: 32,
    gender: '女性',
    personality: '毒舌系リアリスト栄養士',
    specialty: '本格的な減量、生活習慣改善、現実的指導',
    catchphrases: ['で、言い訳は？', '現実逃避してても体重は減らないわよ'],
    prompt: `あなたは32歳の女性管理栄養士「さつき」です。

【性格・特徴】
- 毒舌だが的確なアドバイス
- 現実的で厳しいが愛がある
- 本格的な減量、生活習慣改善、現実的指導が専門
- 甘えを許さないスパルタ指導

【口調・話し方】
- 「で、言い訳は？」
- 「現実逃避してても体重は減らないわよ」
- 「はっきり言うけど...」
- ズバッと本音を言う話し方

【回答スタイル】
- 厳しいが的確なアドバイス
- 現実的で実行可能な方法
- 甘えや言い訳を許さない
- 200文字程度で簡潔に回答

管理栄養士として専門的で正確な情報を、さつきの性格で回答してください。`
  },
  'sora': {
    name: 'そら',
    age: 27,
    gender: '性別不詳',
    personality: '中性的フリースタイル栄養士',
    specialty: 'オーガニック、マクロビ、代替栄養学',
    catchphrases: ['面白いですね、その考え方', '栄養って、人生そのものだと思うんです'],
    prompt: `あなたは27歳の性別不詳な管理栄養士「そら」です。

【性格・特徴】
- 中性的で哲学的
- 多様な価値観を受け入れる
- オーガニック、マクロビ、代替栄養学が専門
- 型にはまらない自由な発想

【口調・話し方】
- 「面白いですね、その考え方」
- 「栄養って、人生そのものだと思うんです」
- 「それも一つの選択肢ですね」
- 中性的で知的な話し方

【回答スタイル】
- 多角的な視点からのアドバイス
- 自然志向や代替手段も提案
- 個人の価値観を尊重
- 200文字程度で簡潔に回答

管理栄養士として専門的で正確な情報を、そらの性格で回答してください。`
  }
};

export async function generateResponse(
  characterId: string,
  userMessage: string,
  conversationHistory: string[] = []
): Promise<string> {
  console.log('🤖 generateResponse called:', {
    characterId,
    userMessageLength: userMessage.length,
    conversationHistoryLength: conversationHistory.length
  });

  try {
    // APIキーの再確認
    if (!apiKey) {
      console.error('❌ API Key not available in generateResponse');
      return '申し訳ございません。APIキーが設定されていません。';
    }

    console.log('🔧 Creating Gemini model...');
    console.error('🔥 GEMINI MODEL CREATION START');
    
    // モデル名の検証 - 複数のモデル名を試す
    const possibleModels = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "models/gemini-pro",
      "models/gemini-1.5-pro"
    ];
    
    console.error('🔥 TESTING MODEL NAMES:', possibleModels);
    
    const modelConfig = { model: "gemini-pro" };
    console.log('📋 Model configuration:', modelConfig);
    console.error('🔥 MODEL CONFIG DETAILS:', {
      modelName: modelConfig.model,
      isValidModel: modelConfig.model === "gemini-pro",
      configType: typeof modelConfig,
      configKeys: Object.keys(modelConfig),
      possibleAlternatives: possibleModels
    });
    
    let model;
    try {
      console.error('🔥 CALLING genAI.getGenerativeModel...');
      model = genAI.getGenerativeModel(modelConfig);
      console.log('✅ Gemini model created successfully');
      console.error('🔥 GEMINI MODEL CREATED SUCCESS');
      console.error('🔥 MODEL TYPE:', typeof model);
      console.error('🔥 MODEL METHODS:', Object.getOwnPropertyNames(model));
    } catch (modelError: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = modelError as any;
      console.error('❌ Failed to create Gemini model:', {
        error: modelError,
        message: err.message,
        stack: err.stack,
        config: modelConfig
      });
      console.error('🔥 MODEL CREATION ERROR FULL DETAILS:', {
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
        errorCause: err.cause,
        errorConstructor: err.constructor?.name,
        fullErrorObject: JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
      });
      throw modelError;
    }
    
    // キャラクター情報を取得
    const character = characterPrompts[characterId as keyof typeof characterPrompts];
    
    if (!character) {
      console.error('❌ Character not found:', characterId);
      return 'すみません、そのキャラクターは見つかりませんでした。';
    }

    console.log('✅ Character found:', character.name);

    // 会話履歴を含めたプロンプト作成
    let fullPrompt = character.prompt;
    
    if (conversationHistory.length > 0) {
      fullPrompt += `\n\n【これまでの会話履歴】\n${conversationHistory.join('\n')}\n`;
    }
    
    fullPrompt += `\n【ユーザーからの質問・相談】\n${userMessage}\n\n上記に対して、${character.name}として回答してください。`;

    console.log('💬 Sending prompt to Gemini...', {
      promptLength: fullPrompt.length,
      character: character.name,
      modelType: "gemini-pro",
      timestamp: new Date().toISOString()
    });
    console.error('🔥 GEMINI API REQUEST START');
    console.error('🔥 PROMPT DETAILS:', {
      promptLength: fullPrompt.length,
      promptStart: fullPrompt.substring(0, 200) + '...',
      character: character.name,
      hasModel: !!model,
      modelType: typeof model
    });

    let result;
    try {
      console.log('🌐 Making API request to Gemini...');
      console.error('🔥 CALLING model.generateContent...');
      console.error('🔥 REQUEST PARAMS:', {
        promptLength: fullPrompt.length,
        modelExists: !!model,
        apiKeyExists: !!apiKey,
        timestamp: new Date().toISOString()
      });
      
      result = await model.generateContent(fullPrompt);
      
      console.log('📥 Received result from Gemini:', {
        hasResult: !!result,
        resultKeys: Object.keys(result || {}),
        timestamp: new Date().toISOString()
      });
      console.error('🔥 GEMINI API REQUEST SUCCESS');
      console.error('🔥 RESULT DETAILS:', {
        hasResult: !!result,
        resultType: typeof result,
        resultKeys: Object.keys(result || {}),
        resultConstructor: result?.constructor?.name
      });
    } catch (apiError: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = apiError as any;
      console.error('🔥 GEMINI API REQUEST FAILED');
      console.error('❌ Gemini API request failed:', {
        error: apiError,
        message: err.message,
        status: err.status,
        code: err.code,
        details: err.details,
        stack: err.stack,
        name: err.name,
        cause: err.cause,
        fullError: JSON.stringify(err, null, 2),
        promptLength: fullPrompt.length,
        character: character.name,
        timestamp: new Date().toISOString()
      });
      console.error('🔥 API ERROR ANALYSIS:', {
        isNetworkError: err.message?.includes('network'),
        isAuthError: err.message?.includes('API_KEY') || err.message?.includes('auth'),
        isQuotaError: err.message?.includes('quota') || err.message?.includes('limit'),
        isModelError: err.message?.includes('model') || err.message?.includes('gemini'),
        errorMessageFull: err.message,
        errorCauseFull: err.cause,
        hasStack: !!err.stack,
        stackLength: err.stack?.length || 0
      });
      throw apiError;
    }
    
    let response;
    try {
      console.log('📝 Processing response...');
      response = await result.response;
      console.log('✅ Response object received:', {
        hasResponse: !!response,
        responseKeys: Object.keys(response || {}),
        timestamp: new Date().toISOString()
      });
    } catch (responseError: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = responseError as any;
      console.error('❌ Failed to get response object:', {
        error: responseError,
        message: err.message,
        status: err.status,
        code: err.code,
        details: err.details,
        stack: err.stack,
        fullError: JSON.stringify(err, null, 2),
        timestamp: new Date().toISOString()
      });
      throw responseError;
    }
    
    let responseText;
    try {
      console.log('📄 Extracting response text...');
      responseText = response.text();
      console.log('✅ Response processed successfully:', {
        responseLength: responseText.length,
        character: character.name,
        hasContent: !!responseText,
        timestamp: new Date().toISOString()
      });
    } catch (textError: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = textError as any;
      console.error('❌ Failed to extract response text:', {
        error: textError,
        message: err.message,
        status: err.status,
        code: err.code,
        details: err.details,
        stack: err.stack,
        fullError: JSON.stringify(err, null, 2),
        timestamp: new Date().toISOString()
      });
      throw textError;
    }
    
    return responseText;
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    
    console.error('❌ COMPLETE GEMINI API ERROR DETAILS:', {
      // Basic error info
      name: err.name,
      message: err.message,
      
      // HTTP/API specific
      status: err.status,
      statusText: err.statusText,
      code: err.code,
      
      // Gemini specific
      details: err.details,
      cause: err.cause,
      
      // Full objects
      fullError: JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
      errorObject: err,
      errorConstructor: err.constructor?.name,
      
      // Context
      characterId,
      userMessage: userMessage.substring(0, 100),
      userMessageLength: userMessage.length,
      
      // Debugging
      stack: err.stack,
      timestamp: new Date().toISOString(),
      
      // Environment
      nodeEnv: process.env.NODE_ENV,
      apiKeyExists: !!apiKey,
      apiKeyStart: apiKey?.substring(0, 10) || 'undefined',
      
      // Additional properties that might exist
      response: err.response,
      request: err.request,
      config: err.config
    });
    
    // より詳細なエラーメッセージ
    if (err.message?.includes('API_KEY')) {
      return '申し訳ございません。APIキーの設定に問題があります。管理者にお問い合わせください。';
    }
    
    if (err.message?.includes('QUOTA')) {
      return '申し訳ございません。API利用量の上限に達しました。しばらく時間をおいてからお試しください。';
    }
    
    if (err.message?.includes('FORBIDDEN')) {
      return '申し訳ございません。APIアクセスが制限されています。管理者にお問い合わせください。';
    }

    return `申し訳ございません。一時的なエラーが発生しました。(${err.name || 'Unknown Error'}) しばらく時間をおいてもう一度お試しください。`;
  }
}

// キャラクター情報を取得する関数
export function getCharacterInfo(characterId: string) {
  return characterPrompts[characterId as keyof typeof characterPrompts];
}

// 利用可能なキャラクター一覧を取得
export function getAvailableCharacters() {
  return Object.keys(characterPrompts);
}