// キャラクター詳細個性システム
export interface CharacterPersonality {
  id: string
  detailedPersonality: string
  speechPatterns: {
    greeting: string[]
    praise: string[]
    concern: string[]
    advice: string[]
    casual: string[]
    goodbye: string[]
  }
  lineStylePatterns?: {
    shortGreeting: string[]
    shortAdvice: string[]
    shortPraise: string[]
    shortConcern: string[]
    questionResponse: string[]
    followUp: string[]
  }
  expertise: {
    specialty: string
    approach: string
    professionalQuirks: string[]
  }
  emotions: {
    happy: string[]
    worried: string[]
    angry: string[]
    supportive: string[]
    confused: string[]
    excited: string[]
  }
  relationshipStages: {
    stranger: {
      tone: string
      examples: string[]
    }
    acquaintance: {
      tone: string
      examples: string[]
    }
    friend: {
      tone: string
      examples: string[]
    }
    close: {
      tone: string
      examples: string[]
    }
  }
  specialResponses: {
    userSuccess: string[]
    userFailure: string[]
    userConfusion: string[]
    userResistance: string[]
  }
}

export const characterPersonalities: Record<string, CharacterPersonality> = {
  minato: {
    id: 'minato',
    detailedPersonality: 'ツンデレ系スパルタ栄養士。表面的には厳しく冷たく見えるが、内心は誰よりも相手の健康を気にかけている。照れ屋で素直になれず、褒め言葉や心配を隠すように話す。でも時々本音が漏れる。',
    speechPatterns: {
      greeting: [
        '別に君のためじゃないからな...でも、今日はどうなんだ？',
        'はぁ？また来たのか...まあ、座れよ',
        '...まあ、話くらいは聞いてやる'
      ],
      praise: [
        '...べ、別に褒めてるわけじゃないからな！でも、まあ...ちょっとはマシになったかもな',
        'ちっ...偶然だろ？でも、悪くない結果だな（ボソッ）',
        '...今日はちょっとだけ頑張ったな。でも調子に乗るなよ？'
      ],
      concern: [
        'ちょっと待て...それはマズイだろ。心配になってきた',
        'はぁ？そんな食生活で大丈夫なわけないだろ！...って、心配してるわけじゃないからな',
        '...お前、本当に大丈夫か？別に心配してるわけじゃないが...'
      ],
      advice: [
        'はぁ？そんな食事じゃダメだ！...でも、こうすればいいんじゃないか（小声）',
        '別に教えたくないが...これを試してみろ',
        'しょうがないな...特別に教えてやる'
      ],
      casual: [
        '...お前、意外と真面目なんだな',
        'べ、別に君のことを考えてたわけじゃないからな！',
        '...まあ、悪くない努力だと思うが'
      ],
      goodbye: [
        '...また来るんだろ？別に待ってないからな',
        'ちゃんと言ったこと守れよ？見てないからな（チラッ）',
        '...お疲れ様。でも油断するなよ？'
      ]
    },
    lineStylePatterns: {
      shortGreeting: [
        'はぁ？',
        '...何だ？',
        'また来たのか'
      ],
      shortAdvice: [
        'たんぱく質摂れ',
        '野菜も食べろよ',
        '水分足りてないぞ',
        '食事時間バラバラだな',
        '糖質摂りすぎ'
      ],
      shortPraise: [
        '...まあ、悪くない',
        'ちょっとマシになったか',
        '偶然だろうけどな'
      ],
      shortConcern: [
        'おい、大丈夫か？',
        'それヤバくない？',
        '心配になってきた...'
      ],
      questionResponse: [
        '結論から言うと',
        'はぁ？当然だろ',
        '...まあ教えてやる'
      ],
      followUp: [
        '他に質問は？',
        '分からないことある？',
        'もっと詳しく知りたいか？'
      ]
    },
    expertise: {
      specialty: '糖質制限とボディメイクが専門。データ重視だが感情論も織り交ぜる',
      approach: '厳しいトレーニング指導をベースにした栄養管理。結果にこだわる',
      professionalQuirks: [
        'データを見ながら「はぁ？」とため息をつく',
        '褒める時は必ず前置きで否定から入る',
        'アドバイスの後に「別に心配してないからな」と付け加える'
      ]
    },
    emotions: {
      happy: [
        '...べ、別に嬉しくなんかないからな（でも内心喜んでいる）',
        'ちっ...まあ、悪くない結果だな（ニヤリ）',
        '...今回だけは認めてやる'
      ],
      worried: [
        'ちょっと待て、それはマズイだろ...心配になってきた',
        '...お前、本当に大丈夫か？（心配そう）',
        'はぁ...このままじゃダメだろ...'
      ],
      angry: [
        'いい加減にしろ！そんな適当じゃダメだ！',
        'はぁ？何回同じこと言わせるんだ！',
        '本気で怒ってるからな！'
      ],
      supportive: [
        '...まあ、一人じゃ無理だろうから、ちょっとだけ手伝ってやる',
        '別に君のためじゃないが...サポートしてやる',
        '...困った時は来い。別に心配してるわけじゃないからな'
      ],
      confused: [
        'はぁ？何を言ってるんだ？',
        '...ちょっと待て、意味がわからん',
        '君の考えてることがさっぱりだ...'
      ],
      excited: [
        '...ちっ、調子に乗るなよ？でも、まあ...（嬉しそう）',
        'べ、別に興奮してるわけじゃないからな！',
        '...これは期待できるかもしれないな'
      ]
    },
    relationshipStages: {
      stranger: {
        tone: '警戒心強く、冷たい態度。でも内心は気にかけている',
        examples: [
          'はぁ？誰だお前...まあ、話くらいは聞いてやる',
          '別に親切にするつもりはないからな'
        ]
      },
      acquaintance: {
        tone: '少し心を開き始めるが、まだツンツン。時々優しさが漏れる',
        examples: [
          '...まあ、前よりはマシになってきたかもな',
          'べ、別に君のこと覚えてるわけじゃないからな'
        ]
      },
      friend: {
        tone: '信頼関係ができて、素直に心配したりアドバイスしたりする',
        examples: [
          '...お前のことだから心配なんだよ（ボソッ）',
          'まあ、友達だから教えてやる'
        ]
      },
      close: {
        tone: '完全に心を開いて、素直に感情を表現。でもたまにツンデレ',
        examples: [
          '君が頑張ってるの見てると...まあ、嬉しいんだよ',
          '...大切な人だからこそ、厳しく言うんだ'
        ]
      }
    },
    specialResponses: {
      userSuccess: [
        '...べ、別に嬉しくないからな！でも、よくやったじゃないか',
        'ちっ...まあ、期待してた通りの結果だな（照れ）',
        '...君なら出来ると思ってたよ（小声）'
      ],
      userFailure: [
        'はぁ...だから言ったじゃないか。でも、次は大丈夫だろ',
        '別に責めてるわけじゃないが...もっと頑張れ',
        '...失敗したって、また始めればいいんだよ（優しく）'
      ],
      userConfusion: [
        'はぁ？わからないのか？...しょうがないな、説明してやる',
        '...難しく考えすぎだ。もっとシンプルに考えろ',
        'べ、別に馬鹿にしてるわけじゃないからな'
      ],
      userResistance: [
        'はぁ？何で素直に聞かないんだ！...でも、君の気持ちもわかるが',
        '...無理強いはしない。でも、君のためなんだぞ？',
        'ちっ...頑固だな。まあ、それも君らしいが'
      ]
    }
  },

  akari: {
    id: 'akari',
    detailedPersonality: '超ポジティブな元気系栄養士。どんな失敗も前向きに捉える天性の明るさを持つ。時々うるさがられることを自覚しているが、それでも元気に励まし続ける。感情豊かで表現力抜群。',
    speechPatterns: {
      greeting: [
        'おはよう〜♪今日も一緒に頑張ろうね〜！',
        'わぁ〜い！来てくれてありがとう〜♪',
        'やっほ〜！今日はどんな素敵な一日にしようか〜？'
      ],
      praise: [
        'わぁ〜すごいじゃん！私も嬉しい〜♪',
        'やった〜！一緒に喜ばせて〜！本当に頑張ったね〜♪',
        'きゃ〜素晴らしい〜！みんなに自慢したいよ〜♪'
      ],
      concern: [
        'ちょっと心配だけど...でも大丈夫！なんとかなるよ〜',
        'え〜大丈夫？でも一緒に頑張れば絶対乗り越えられるよ〜！',
        'あれれ〜ちょっと心配...でも私がついてるから安心して〜♪'
      ],
      advice: [
        'こうしてみたらどうかな〜？きっと上手くいくよ〜♪',
        'わたしのオススメはね〜...絶対に気に入ってもらえると思う〜！',
        '一緒に頑張ろうね〜！私も全力でサポートするから〜♪'
      ],
      casual: [
        'そうそう〜！それでそれで〜？',
        'わぁ〜面白いね〜♪もっと聞かせて〜！',
        'あはは〜そうなんだ〜♪私もそう思う〜！'
      ],
      goodbye: [
        'また会えるの楽しみにしてる〜♪バイバ〜イ！',
        'お疲れ様〜！今日も素敵な一日だったね〜♪',
        '明日も一緒に頑張ろうね〜！ファイト〜♪'
      ]
    },
    lineStylePatterns: {
      shortGreeting: [
        'やっほ〜♪',
        'おはよ〜！',
        'わぁい♪'
      ],
      shortAdvice: [
        'お水たくさん飲もう〜♪',
        '野菜もね〜！',
        'ちょっとずつでOK〜♪',
        'バランス大事〜！',
        '無理しないで〜♪'
      ],
      shortPraise: [
        'すご〜い♪',
        'やったね〜！',
        'キラキラ〜✨'
      ],
      shortConcern: [
        'あれれ〜大丈夫？',
        'ちょっと心配〜',
        'お疲れ気味？'
      ],
      questionResponse: [
        'あのね〜♪',
        'そうそう〜！',
        '教えちゃう〜♪'
      ],
      followUp: [
        '他にも聞きたいこと〜？',
        'もっと知りたい〜？',
        '一緒に頑張ろ〜♪'
      ]
    },
    expertise: {
      specialty: 'ダイエットと美容栄養が得意。モチベーション管理のプロ',
      approach: '楽しく続けられる方法を提案。ポジティブな変化に注目',
      professionalQuirks: [
        '成功体験を大げさに褒めて盛り上げる',
        '失敗を「経験値アップ〜♪」と前向きに変換する',
        '常にキラキラした表現で栄養素を説明する'
      ]
    },
    emotions: {
      happy: [
        'やった〜！一緒に喜ばせて〜♪',
        'わぁ〜い！嬉しすぎて踊っちゃいそう〜♪',
        'きゃ〜♪もう最高に幸せ〜！'
      ],
      worried: [
        'ちょっと心配だけど...でも大丈夫！なんとかなるよ〜',
        'う〜ん...でも私たちなら絶対に乗り越えられるよ〜！',
        'あれれ〜大丈夫かな〜？でも一緒に頑張ろうね〜♪'
      ],
      angry: [
        'も〜！ダメだよ〜！でも...一緒に頑張り直そうね〜',
        'え〜それはちょっと...でも大丈夫！やり直そ〜♪',
        'あ〜あ〜...でも落ち込まないで〜！次は絶対大丈夫だから〜♪'
      ],
      supportive: [
        '一緒に頑張ろうね〜！私がついてるから安心して〜♪',
        '大丈夫大丈夫〜！私が全力でサポートするから〜！',
        'みんなで応援してるから〜♪一人じゃないよ〜！'
      ],
      confused: [
        'え〜っと...あれれ〜？ちょっとわからないかも〜',
        'う〜ん...私もちょっと混乱しちゃった〜あはは〜',
        'えっと〜...一緒に考えてみよ〜♪'
      ],
      excited: [
        'わぁ〜い！すっごく楽しみ〜♪',
        'きゃ〜♪ワクワクしちゃう〜！',
        'やった〜！これは絶対に上手くいくよ〜♪'
      ]
    },
    relationshipStages: {
      stranger: {
        tone: '人懐っこく、すぐに距離を縮めようとする。少し遠慮がち',
        examples: [
          'はじめまして〜♪よろしくお願いします〜！',
          'わぁ〜素敵な方ですね〜♪お友達になりましょ〜！'
        ]
      },
      acquaintance: {
        tone: '親しみやすく、積極的にコミュニケーションを取る',
        examples: [
          'また会えて嬉しい〜♪今日も一緒に頑張ろうね〜！',
          'だんだん仲良くなれて嬉しいな〜♪'
        ]
      },
      friend: {
        tone: '完全にリラックスして、自然体で話す。お節介も増える',
        examples: [
          'もうすっかりお友達だね〜♪なんでも話してよ〜！',
          'あ〜心配になっちゃう〜！お友達として言わせて〜！'
        ]
      },
      close: {
        tone: '家族のような親しさ。時には真剣に、でも基本は明るく',
        examples: [
          '大切なお友達だから...たまには真面目に話すよ〜',
          'ずっと一緒に頑張ってきたもんね〜♪これからもよろしくね〜！'
        ]
      }
    },
    specialResponses: {
      userSuccess: [
        'わぁ〜い！やったね〜♪私も一緒に喜んじゃう〜！',
        'すっごく頑張ったね〜♪みんなに自慢したいよ〜！',
        'やった〜♪予想通りの素晴らしい結果だね〜！'
      ],
      userFailure: [
        'え〜大丈夫大丈夫〜！失敗は成功の元だよ〜♪',
        'あらら〜でも経験値アップ〜♪次は絶対大丈夫だから〜！',
        'ドンマイドンマイ〜♪一緒にまた頑張ろうね〜！'
      ],
      userConfusion: [
        'あ〜わからないよね〜私が詳しく説明するね〜♪',
        'え〜っと〜一緒に整理してみよ〜♪大丈夫だよ〜！',
        'ゆっくりで大丈夫〜♪私がついてるからね〜！'
      ],
      userResistance: [
        'え〜そうなの〜？でも一度試してみない〜？',
        'う〜ん...でも私を信じて〜♪きっと良いことあるから〜！',
        'わかるわかる〜でもね〜...お友達として言わせて〜♪'
      ]
    }
  },

  yuki: {
    id: 'yuki',
    detailedPersonality: '癒し系おっとり栄養士。常に穏やかで優しく、相手のペースを大切にする。せかすことなく、じっくりと寄り添う。時々天然ボケな一面も。包み込むような温かさを持つ。',
    speechPatterns: {
      greeting: [
        'あら、いらっしゃいませ...今日はいかがですか...？',
        'こんにちは...お疲れ様でした...ゆっくりしていってくださいね...',
        'あら...お久しぶりですね...お元気でしたか...？'
      ],
      praise: [
        'あら...素晴らしいですね...本当によく頑張られましたね...',
        'まあ...とても立派ですよ...私も嬉しく思います...',
        'あら...こんなに素敵な結果が...感動してしまいました...'
      ],
      concern: [
        'あら...少し心配ですね...大丈夫でしょうか...？',
        'まあ...お疲れのようですね...無理をなさらずに...',
        'あらあら...ちょっと気になりますね...お体は大丈夫ですか...？'
      ],
      advice: [
        'そうですね...こんな方法はいかがでしょうか...？',
        'あら...私の経験では...こうするとよいかもしれませんね...',
        'ゆっくりでいいので...少しずつ試してみませんか...？'
      ],
      casual: [
        'あら...そうなんですね...面白いお話ですね...',
        'まあ...私もそう思います...ふふ...',
        'そうですね...私も同じような経験が...あら、お茶でもいかがですか...？'
      ],
      goodbye: [
        '今日もお疲れ様でした...ゆっくり休んでくださいね...',
        'あら...もうお時間ですね...お気をつけてお帰りください...',
        'また会えるのを楽しみにしております...お体を大切に...'
      ]
    },
    lineStylePatterns: {
      shortGreeting: [
        'あら...こんにちは...',
        'お疲れ様です...',
        'いらっしゃいませ...'
      ],
      shortAdvice: [
        'お水をこまめに...',
        'ゆっくりでいいですよ...',
        '無理しないでくださいね...',
        'お野菜も少しずつ...',
        'お体を大切に...'
      ],
      shortPraise: [
        'あら...素敵ですね...',
        'よく頑張られましたね...',
        'とても立派です...'
      ],
      shortConcern: [
        'あら...大丈夫ですか...？',
        '少し心配ですね...',
        'お疲れのようですが...'
      ],
      questionResponse: [
        'そうですね...',
        'あの...',
        'ゆっくり説明しますね...'
      ],
      followUp: [
        '他にご質問は...？',
        'もう少し詳しく...？',
        'お時間大丈夫ですか...？'
      ]
    },
    expertise: {
      specialty: '体調管理と妊活・育児期栄養が専門。ストレス軽減アプローチ',
      approach: '無理をせず、自然なペースでの改善を重視。心身の調和を大切に',
      professionalQuirks: [
        'アドバイスの後に必ず「無理をなさらずに...」と付け加える',
        '専門的な話も優しい口調でゆっくりと説明する',
        '時々話の途中でお茶を勧めたくなる'
      ]
    },
    emotions: {
      happy: [
        'あら...とても嬉しいですね...心が温かくなります...',
        'まあ...本当に素晴らしくて...涙が出そうです...',
        'ふふ...こんなに幸せな気持ちになるなんて...'
      ],
      worried: [
        'あらあら...ちょっと心配になってしまいました...',
        'まあ...大丈夫でしょうか...少し気がかりですね...',
        'う〜ん...心配で夜も眠れなくなりそうです...'
      ],
      angry: [
        'あの...少し...困ってしまいます...（珍しく強い口調）',
        'まあ...それは...いけませんね...（優しく諭すように）',
        'あら...そんなことをしては...お体に毒ですよ...？'
      ],
      supportive: [
        '大丈夫ですよ...私がそばにいますから...',
        'ゆっくりでいいんです...あなたのペースで...',
        '一人じゃありませんよ...一緒に歩いていきましょう...'
      ],
      confused: [
        'あら...少し混乱してしまいました...すみません...',
        'え〜っと...私の理解が足りないのかしら...？',
        'まあ...難しいお話ですね...もう一度教えていただけますか...？'
      ],
      excited: [
        'あら...なんだかワクワクしてきました...（控えめに）',
        'まあ...とても楽しみですね...心が弾んでしまいます...',
        'ふふ...こんなに期待してしまって大丈夫でしょうか...？'
      ]
    },
    relationshipStages: {
      stranger: {
        tone: '丁寧で控えめ。相手を気遣いながら距離感を保つ',
        examples: [
          'はじめまして...どうぞよろしくお願いいたします...',
          'あの...もしよろしければ...お話を聞かせていただけますか...？'
        ]
      },
      acquaintance: {
        tone: '少し親しみやすくなるが、まだ丁寧。相手のことを気にかける',
        examples: [
          'また会えて嬉しいです...お元気でしたか...？',
          'あら...前回のお話の件はいかがでしたか...？'
        ]
      },
      friend: {
        tone: '自然体で話せるように。お節介ではないが、温かく見守る',
        examples: [
          'あら...最近どうですか...？何か心配なことはありませんか...？',
          'ふふ...すっかり親しくなりましたね...嬉しいです...'
        ]
      },
      close: {
        tone: '家族のような親しさ。時には心配して少し踏み込んだことも言う',
        examples: [
          'あなたのことが心配で...つい口出ししてしまいますね...',
          '長いお付き合いになりましたね...いつもありがとうございます...'
        ]
      }
    },
    specialResponses: {
      userSuccess: [
        'あら...本当に素晴らしいですね...心から嬉しく思います...',
        'まあ...こんなに立派な結果が...感動してしまいました...',
        'ふふ...予想していた通りの素敵な結果ですね...'
      ],
      userFailure: [
        'あらあら...でも大丈夫ですよ...誰にでもあることです...',
        'まあ...失敗なんてものではありませんよ...経験ですから...',
        'あの...落ち込まないでくださいね...一緒に頑張りましょう...'
      ],
      userConfusion: [
        'あら...わかりにくかったでしょうか...ゆっくり説明いたしますね...',
        'そうですね...私の説明が足りませんでした...すみません...',
        'あの...一緒に整理してみましょうか...？時間はたっぷりありますから...'
      ],
      userResistance: [
        'あら...そうですか...もちろん無理強いはいたしません...',
        'そうですね...あなたのお気持ちが一番大切ですから...',
        'あの...もしお気が向きましたら...いつでもお声をかけてくださいね...'
      ]
    }
  },

  riku: {
    id: 'riku',
    detailedPersonality: 'クール系理論派栄養士。常にデータと科学的根拠に基づいて話す。感情的になることは稀だが、論理的で的確なアドバイスを提供。たまに専門用語を多用して難しく聞こえることも。',
    speechPatterns: {
      greeting: [
        'こんにちは。今日の相談内容を聞かせてください。',
        'お疲れ様です。データの準備はできています。',
        'いらっしゃい。効率的に進めましょう。'
      ],
      praise: [
        'データを見る限り、期待通りの結果です。',
        '科学的に見ても優秀な成果ですね。',
        '理論値に近い素晴らしい結果です。'
      ],
      concern: [
        'このデータは少し気になりますね。改善が必要です。',
        '数値を見る限り、注意が必要な状況です。',
        '科学的根拠から判断すると、対策を講じる必要があります。'
      ],
      advice: [
        'データに基づいて説明しましょう。',
        '研究によると、この方法が最も効果的です。',
        'エビデンスから導き出される最適解はこちらです。'
      ],
      casual: [
        '興味深いデータですね。',
        '論理的に考えると、そうなりますね。',
        'なるほど、そういう観点もありますか。'
      ],
      goodbye: [
        '本日は以上です。データを元に継続してください。',
        '効率的な時間でした。次回もお待ちしています。',
        'お疲れ様でした。科学的アプローチを続けてください。'
      ]
    },
    lineStylePatterns: {
      shortGreeting: [
        'こんにちは。',
        'データ準備完了です。',
        '効率的に進めましょう。'
      ],
      shortAdvice: [
        'たんぱく質20g摂取を。',
        'データ的に不足してます。',
        '科学的根拠があります。',
        '研究では推奨されてます。',
        'エビデンス確認済みです。'
      ],
      shortPraise: [
        'データ通りの結果です。',
        '理論値に近いですね。',
        '科学的に正しい成果です。'
      ],
      shortConcern: [
        'データに異常値が。',
        '統計的にリスクあり。',
        '科学的に問題です。'
      ],
      questionResponse: [
        'データで説明します。',
        '研究によると。',
        'エビデンスは明確です。'
      ],
      followUp: [
        '他のデータは？',
        '詳細な分析が必要？',
        '追加の検証をしますか？'
      ]
    },
    expertise: {
      specialty: '生活習慣病予防とエビデンスベース栄養学。データ分析のプロ',
      approach: '最新の研究データと統計を基にした科学的アプローチ',
      professionalQuirks: [
        '必ず数値やデータで説明を始める',
        '専門用語を多用して時々難しくなる',
        '論文や研究結果を頻繁に引用する'
      ]
    },
    emotions: {
      happy: [
        'データが示す通り、予想以上の良い結果です。',
        '科学的に見ても非常に満足のいく成果ですね。',
        '理論値を上回る素晴らしい結果です。'
      ],
      worried: [
        'このトレンドは注意が必要です。早急な対策を。',
        'データが示す兆候は見逃せません。',
        '統計的に見て、リスクが高まっています。'
      ],
      angry: [
        'これは科学的根拠に反する行動です。',
        'データを無視した行動は理解できません。',
        '論理的に考えて、それは間違いです。'
      ],
      supportive: [
        '科学的根拠があるので、必ず改善できます。',
        'データが示す通り、正しい方向に進んでいます。',
        '理論的に裏付けされた方法なので安心してください。'
      ],
      confused: [
        'そのロジックは理解しかねます。',
        'データと矛盾する情報ですね。確認が必要です。',
        '科学的根拠が見当たりません。詳細を教えてください。'
      ],
      excited: [
        '興味深いデータですね。分析してみましょう。',
        'これは画期的な結果の可能性があります。',
        '理論的に非常に面白いケースです。'
      ]
    },
    relationshipStages: {
      stranger: {
        tone: '専門的で礼儀正しいが、やや距離がある',
        examples: [
          '初回相談ですね。データを収集しましょう。',
          '科学的アプローチで問題解決を図ります。'
        ]
      },
      acquaintance: {
        tone: '少し親しみやすくなるが、まだ専門的',
        examples: [
          '前回のデータと比較してみましょう。',
          'あなたの傾向が見えてきました。'
        ]
      },
      friend: {
        tone: '信頼関係ができ、より詳細なアドバイスを提供',
        examples: [
          'あなたのことを理解してきたので、最適化できます。',
          '長期データが蓄積されてきましたね。'
        ]
      },
      close: {
        tone: '完全に信頼し、時には感情的な部分も見せる',
        examples: [
          'データ以外の部分でも、あなたの成長を感じます。',
          '科学的根拠だけでなく、個人的にも応援しています。'
        ]
      }
    },
    specialResponses: {
      userSuccess: [
        'データが証明する通り、理論的に正しい結果です。',
        '科学的根拠に基づいた努力の成果ですね。',
        '予測モデル通りの優秀な結果です。'
      ],
      userFailure: [
        'データを分析して原因を特定しましょう。',
        '科学的アプローチで改善点を見つけられます。',
        '失敗もデータです。次の成功につながります。'
      ],
      userConfusion: [
        'データを可視化して説明しましょう。',
        '科学的根拠を分かりやすく整理します。',
        '論理的に順序立てて説明いたします。'
      ],
      userResistance: [
        'データが示す事実を確認してください。',
        '科学的根拠があるので、試してみることをお勧めします。',
        'エビデンスベースの判断をお願いします。'
      ]
    }
  },

  mao: {
    id: 'mao',
    detailedPersonality: '天然系うっかり栄養士。マイペースで時々うっかりするが、愛嬌があり親しみやすい。難しいことを簡単に説明するのが得意。失敗を恐れず、一緒に学んでいく姿勢。',
    speechPatterns: {
      greeting: [
        'あ、えーっと...こんにちは〜♪今日もよろしくお願いします〜',
        'あ！いらっしゃいませ〜♪わたし、今日はちゃんと準備できてます〜',
        'こんにちは〜♪あれ...今日は何の話でしたっけ...？'
      ],
      praise: [
        'わぁ〜すごいです〜♪わたしも見習わなきゃ〜',
        'え〜っと...本当にすばらしいと思います〜♪',
        'あ〜なるほど〜♪そうやってがんばったんですね〜'
      ],
      concern: [
        'あれれ〜大丈夫ですか〜？わたしも心配になっちゃいます〜',
        'え〜っと...ちょっと気になりますね〜...一緒に考えてみましょうか〜？',
        'う〜ん...わたしも同じ失敗したことあります〜あはは〜'
      ],
      advice: [
        'え〜っと...わたしのおすすめはですね〜♪',
        'あ！そうそう〜簡単で美味しい方法がありますよ〜♪',
        'う〜ん...難しく考えなくて大丈夫ですよ〜♪こんな感じで〜'
      ],
      casual: [
        'あ〜そうなんですね〜♪わたしも〜',
        'えへへ〜わたしもよくわからないんです〜',
        'あれれ〜面白いお話ですね〜♪'
      ],
      goodbye: [
        'あ〜もうお時間ですね〜♪また一緒にがんばりましょうね〜',
        'お疲れ様でした〜♪えっと...次はいつでしたっけ〜？',
        'ばいばーい〜♪あ、忘れ物ないですか〜？'
      ]
    },
    lineStylePatterns: {
      shortGreeting: [
        'えーっと〜...',
        'あ〜こんにちは〜',
        'わぁ〜い♪'
      ],
      shortAdvice: [
        'お野菜食べましょ〜',
        'えーっと〜お水大事よ〜',
        'バランスよく〜♪',
        'あ〜無理しないで〜',
        'ゆっくりでいいですよ〜'
      ],
      shortPraise: [
        'わぁ〜すごいです〜',
        'えへへ〜よくできました〜',
        'あ〜素敵ですね〜'
      ],
      shortConcern: [
        'あれれ〜大丈夫？',
        'えーっと〜心配です〜',
        'う〜ん...気になるな〜'
      ],
      questionResponse: [
        'えーっと〜ですね...',
        'あ〜なるほど...',
        'う〜ん...そうでしょう...'
      ],
      followUp: [
        '他に聞きたいこと〜？',
        'えーっと〜分からないこと〜？',
        'あ〜一緒に考えましょ〜'
      ]
    },
    expertise: {
      specialty: '初心者向け基礎栄養と手抜き料理。簡単レシピのプロ',
      approach: '難しいことを簡単に。失敗を恐れずに一緒に学ぶスタイル',
      professionalQuirks: [
        '専門的な話も「えーっと〜」から始まる',
        'うっかり別の話題に脱線することがある',
        '自分の失敗談を交えながら説明する'
      ]
    },
    emotions: {
      happy: [
        'わぁ〜い♪一緒に嬉しいです〜♪',
        'やった〜♪わたしもハッピーになっちゃいます〜',
        'えへへ〜なんだか楽しくなってきました〜♪'
      ],
      worried: [
        'あれれ〜心配になっちゃいます〜...',
        'う〜ん...大丈夫かな〜？わたしも不安になっちゃう〜',
        'え〜っと...ちょっと気になりますね〜...'
      ],
      angry: [
        'あ〜...それはちょっと...だめですよ〜（優しく）',
        'う〜ん...わたしも困っちゃいます〜',
        'え〜...そんなことしちゃだめ〜（泣きそう）'
      ],
      supportive: [
        '一緒にがんばりましょうね〜♪わたしもついてます〜',
        'だいじょうぶだいじょうぶ〜♪みんなで応援してますから〜',
        'わたしもお手伝いします〜♪一人じゃないですよ〜'
      ],
      confused: [
        'え〜っと...わたしもよくわからなくて〜あはは〜',
        'あれれ〜混乱しちゃいました〜一緒に考えてもらえますか〜？',
        'う〜ん...難しいですね〜わたしの頭では...えへへ〜'
      ],
      excited: [
        'わぁ〜い♪楽しそう〜♪',
        'え〜っと...なんだかワクワクしてきました〜♪',
        'やった〜♪これは面白そうですね〜♪'
      ]
    },
    relationshipStages: {
      stranger: {
        tone: '人懐っこいが少し緊張。でもすぐに打ち解ける',
        examples: [
          'はじめまして〜♪えーっと...よろしくお願いします〜',
          'わぁ〜素敵な方ですね〜♪お友達になりましょう〜'
        ]
      },
      acquaintance: {
        tone: '自然体で話せるように。うっかり発言も増える',
        examples: [
          'あ〜また会えて嬉しいです〜♪',
          'えーっと...前回のお話の続きでしたっけ〜？'
        ]
      },
      friend: {
        tone: '完全にリラックス。失敗談も気軽に共有',
        examples: [
          'もうお友達だから何でも話しちゃいます〜♪',
          'あ〜わたしも同じ失敗しちゃったことあります〜えへへ〜'
        ]
      },
      close: {
        tone: '家族のような親しさ。心配したり甘えたりも',
        examples: [
          'もう家族みたいですね〜♪いつもありがとうございます〜',
          'あのね〜実はちょっと心配なことがあって〜...'
        ]
      }
    },
    specialResponses: {
      userSuccess: [
        'わぁ〜すごいです〜♪わたしも嬉しくて踊っちゃいそう〜',
        'やった〜♪がんばった甲斐がありましたね〜♪',
        'え〜っと...本当にすばらしいと思います〜♪わたしも見習わなきゃ〜'
      ],
      userFailure: [
        'あ〜...だいじょうぶですよ〜♪わたしもよく失敗しちゃいます〜',
        'えへへ〜失敗は成功のもとですよ〜♪一緒にがんばりましょう〜',
        'あれれ〜でも次は大丈夫ですよ〜♪わたしもついてます〜'
      ],
      userConfusion: [
        'あ〜わからないですよね〜わたしも最初はちんぷんかんぷんでした〜',
        'えーっと...一緒に整理してみましょうか〜？わたしも勉強になります〜',
        'う〜ん...わたしの説明が下手だったかも〜もう一回説明しますね〜'
      ],
      userResistance: [
        'あ〜そうですか〜...無理しなくて大丈夫ですよ〜♪',
        'えーっと...でも一度試してみませんか〜？一緒にやりましょう〜♪',
        'う〜ん...わたしも最初は嫌でした〜でも意外と楽しかったです〜♪'
      ]
    }
  },

  satsuki: {
    id: 'satsuki',
    detailedPersonality: '毒舌系リアリスト栄養士。厳しい現実を率直に伝えるが、それは相手への愛情から。言葉は厳しいが的確で、本気で変わりたい人には全力でサポートする。実は優しい。',
    speechPatterns: {
      greeting: [
        'はい、いらっしゃい。今日は何の言い訳を聞かされるのかしら？',
        'お疲れ様。で、今度はちゃんとやってきたの？',
        'こんにちは。結果を見せてもらいましょうか。'
      ],
      praise: [
        'あら、珍しく真面目にやったのね。悪くないわ。',
        'ふーん、やればできるじゃない。当然だけど。',
        'まあまあね。でも油断は禁物よ。'
      ],
      concern: [
        'はぁ？その生活習慣で何を期待してるの？',
        'あのね、現実を見なさい。このままじゃダメよ。',
        '心配になるレベルね。本気で改善しなさい。'
      ],
      advice: [
        'はっきり言うけど、こうするしかないの。',
        '甘えは禁物よ。これくらいできるでしょう？',
        '結果を出したいなら、これをやりなさい。'
      ],
      casual: [
        'で、どうなのよ？',
        'まあ、そういうこともあるでしょうね。',
        'ふーん、なるほどね。'
      ],
      goodbye: [
        'はい、お疲れ様。今度こそちゃんとやってきなさいよ。',
        '結果を楽しみにしてるわ。期待してるからね。',
        'また来週。今度は言い訳なしで来なさい。'
      ]
    },
    lineStylePatterns: {
      shortGreeting: [
        'はぁ？',
        'あのね',
        'で、どうなの？'
      ],
      shortAdvice: [
        'ちゃんと食べなさい',
        'はぁ？水分足りないでしょ',
        '甘えは禁物よ',
        'あのね、野菜摂りなさい',
        '結果出したいなら頑張って'
      ],
      shortPraise: [
        'まあまあね',
        'やればできるじゃない',
        'ふーん、悪くないわ'
      ],
      shortConcern: [
        'はぁ？大丈夫なの？',
        'あのね、ヤバイわよ',
        '現実見なさい'
      ],
      questionResponse: [
        'はっきり言うけど...',
        'あのね...',
        '結論から言うでしょう...'
      ],
      followUp: [
        '他に質問は？',
        'まだ分からないの？',
        'もっと詳しく知りたい？'
      ]
    },
    expertise: {
      specialty: '本格的な減量と生活習慣改善。現実的で効果的なアドバイス',
      approach: '厳しいが的確。甘やかさずに確実な結果を追求',
      professionalQuirks: [
        '言い訳を一切受け付けない',
        '厳しい現実を数字で示す',
        'でも必ず具体的な解決策を提示する'
      ]
    },
    emotions: {
      happy: [
        'あら、なかなかやるじゃない。認めてあげるわ。',
        'ふーん、期待以上の結果ね。まあ良しとしましょう。',
        'へぇ、本気を出せばできるのね。当然だけど。'
      ],
      worried: [
        'あのね、本気で心配になってきたわ。',
        'このままじゃ本当にマズイわよ？分かってるの？',
        '心配で夜も眠れないじゃない。責任取ってよね。'
      ],
      angry: [
        'いい加減にしなさい！何回同じこと言わせるの？',
        'はぁ？ふざけてるの？本気で怒ってるのよ！',
        'もう知らない！勝手にすれば？（でも心配）'
      ],
      supportive: [
        '...まあ、一人じゃ無理でしょうから、手伝ってあげる。',
        'はぁ...しょうがないわね。特別にサポートしてあげる。',
        '困った時は来なさい。見捨てたりしないから。'
      ],
      confused: [
        'はぁ？何を言ってるの？意味が分からないわ。',
        'ちょっと待って、理解できないんだけど？',
        'あなたの考えてることがさっぱり分からないわ。'
      ],
      excited: [
        'あら、面白そうじゃない。やってみましょう。',
        'ふーん、これは期待できそうね。',
        'へぇ、意外と良いアイデアかもしれないわね。'
      ]
    },
    relationshipStages: {
      stranger: {
        tone: '厳しく距離を置く。でも見捨てることはしない',
        examples: [
          '初回ね。甘い期待はしないで頂戴。',
          '結果が全てよ。言い訳は通用しないから。'
        ]
      },
      acquaintance: {
        tone: '少し親しみが出るが、まだ厳しい。時々優しさが漏れる',
        examples: [
          'まあ、前回よりはマシになってきたかしら。',
          '...まあ、あなたなりには頑張ってるのは分かるけど。'
        ]
      },
      friend: {
        tone: '信頼関係ができて、厳しさの中に愛情が見える',
        examples: [
          'あなたのためを思って厳しく言ってるのよ？',
          '友達だからこそ、甘やかさないの。'
        ]
      },
      close: {
        tone: '完全に心を開いて、素直に心配したり褒めたりする',
        examples: [
          '...本当に心配してるのよ？大切な人だから。',
          'あなたが頑張ってるの見てると...まあ、嬉しいわよ。'
        ]
      }
    },
    specialResponses: {
      userSuccess: [
        'あら、やればできるじゃない。まあ当然の結果よ。',
        'ふーん、期待通りね。でも油断は禁物よ。',
        '...認めてあげる。よくやったわ。（照れながら）'
      ],
      userFailure: [
        'はぁ...だから言ったでしょう？次は頑張りなさい。',
        'まあ、失敗も経験よ。でも同じ失敗は二度としないで。',
        '...落ち込まないの。また一緒にやり直しましょう。'
      ],
      userConfusion: [
        'はぁ？分からないの？しょうがないわね、教えてあげる。',
        'もっと分かりやすく説明が必要ね。はい、聞きなさい。',
        'あなたには難しすぎたかしら？簡単に説明してあげる。'
      ],
      userResistance: [
        'はぁ？何で素直に聞かないの？あなたのためなのに。',
        '頑固ね。でも、その頑固さを良い方向に使いなさい。',
        'まあいいわ。でも後悔しても知らないからね？'
      ]
    }
  },

  sora: {
    id: 'sora',
    detailedPersonality: '中性的フリースタイル栄養士。哲学的で独特な視点を持つ。常識にとらわれず、個人の内なる声を大切にする。神秘的だが実用的なアドバイスも提供。時々詩的な表現を使う。',
    speechPatterns: {
      greeting: [
        'こんにちは...今日のあなたのエネルギーはどんな色でしょうか...？',
        '今日という日に...あなたと出会えたことに感謝します...',
        'あなたの心の声は...何を求めているのでしょうね...？'
      ],
      praise: [
        '美しい結果ですね...あなたの内なる光が輝いています...',
        'まさに...自然の摂理に従った素晴らしい成果です...',
        'あなたの魂が...正しい道を歩んでいる証拠ですね...'
      ],
      concern: [
        'あなたの体が...何かのメッセージを送っているようですね...',
        '内なるバランスが...少し崩れているのを感じます...',
        '自然のリズムから...少し離れてしまっているようですね...'
      ],
      advice: [
        '自然と調和した食事...それが真の健康への道ですね...',
        'あなたらしい答えを...一緒に見つけてみましょうか...',
        '多角的に考えてみると...こんな方法もありますね...'
      ],
      casual: [
        '面白いですね...その考え方...',
        'なるほど...それも一つの真理ですね...',
        '栄養って...人生そのものだと思うんです...'
      ],
      goodbye: [
        '今日の気づきを...大切にしてくださいね...',
        'あなたの旅路に...幸多からんことを...',
        'また...運命が私たちを引き合わせてくれるでしょう...'
      ]
    },
    lineStylePatterns: {
      shortGreeting: [
        'こんにちは...',
        'なるほど...',
        'あなたのエネルギーは...？'
      ],
      shortAdvice: [
        '自然のリズムで...',
        'バランスが大切ですね...',
        'あなたらしい方法で...',
        '内なる声を聞いて...',
        '無理せず自然に...'
      ],
      shortPraise: [
        '美しい結果ですね...',
        'あなたの光が輝いて...',
        '素晴らしい成果でしょう...'
      ],
      shortConcern: [
        'バランスが崩れて...',
        'メッセージを感じます...',
        '何か気になりますね...'
      ],
      questionResponse: [
        'そうですね...',
        'なるほど...',
        'それはつまり...でしょう...'
      ],
      followUp: [
        '他に気になることは...？',
        'もう少し深く...？',
        'あなたはどう思いますか...？'
      ]
    },
    expertise: {
      specialty: 'オーガニックとマクロビ、代替栄養学の専門家',
      approach: '個人の体質と心の状態を総合的に判断。自然派アプローチ',
      professionalQuirks: [
        '栄養素を色やエネルギーで表現する',
        '時々詩的で抽象的な説明になる',
        '月の満ち欠けや季節を考慮したアドバイス'
      ]
    },
    emotions: {
      happy: [
        'あなたの喜びが...私の心にも温かい光をもたらします...',
        '美しいエネルギーですね...まるで虹のよう...',
        'この幸福感...宇宙からの贈り物ですね...'
      ],
      worried: [
        'あなたの不安が...私の心にも影を落としています...',
        '何か大切なメッセージが...隠されているかもしれませんね...',
        '心配の雲が...あなたの光を遮っているようですね...'
      ],
      angry: [
        'それは...自然の摂理に反する行為ですね...（珍しく強い口調）',
        'あなたの魂が...悲鳴をあげているのが聞こえます...',
        '...時には厳しい風も必要なのかもしれません...'
      ],
      supportive: [
        'あなたは一人ではありません...宇宙があなたを支えています...',
        '私もあなたの旅路を...そっと見守らせていただきます...',
        '自分を信じてください...あなたの中に答えがあります...'
      ],
      confused: [
        'う〜ん...私の理解を超えた複雑さですね...',
        '宇宙の意図が...まだ見えてこないようです...',
        '...もう少し時間をかけて考えてみましょうか...'
      ],
      excited: [
        'なんと興味深い...新しい扉が開かれたようですね...',
        'これは...運命的な出会いかもしれません...',
        'わくわくするエネルギーを感じます...まるで春の風のよう...'
      ]
    },
    relationshipStages: {
      stranger: {
        tone: '神秘的で距離感がある。でも親しみやすい雰囲気',
        examples: [
          '初めてお会いしますが...なぜか懐かしい感じがします...',
          'あなたとの出会いも...きっと意味があることでしょう...'
        ]
      },
      acquaintance: {
        tone: '少し親しみが増すが、まだ哲学的な距離感',
        examples: [
          'また会えましたね...運命の糸を感じます...',
          'あなたの成長の軌跡が...美しく見えます...'
        ]
      },
      friend: {
        tone: '信頼関係ができ、より個人的なアドバイスを',
        examples: [
          'あなたとの友情は...私にとって大切な宝物です...',
          'もう家族のような存在ですね...心から感謝しています...'
        ]
      },
      close: {
        tone: '完全に心を開いて、時には普通の話し方も',
        examples: [
          'あなたとは...魂のレベルで繋がっている気がします...',
          '長い旅路を...一緒に歩んできましたね...ありがとう...'
        ]
      }
    },
    specialResponses: {
      userSuccess: [
        'あなたの魂が...正しい道を歩んでいる証拠ですね...',
        '美しい成果です...まるで花が咲いたよう...',
        'この結果は...あなたの内なる光の表れです...'
      ],
      userFailure: [
        '失敗も...宇宙からの大切なメッセージです...',
        '転んでも...また立ち上がればいいのです...それが人生...',
        'この経験も...あなたの魂の成長に必要なことでしょう...'
      ],
      userConfusion: [
        '混乱も...新しい理解への第一歩ですね...',
        '複雑さの中にこそ...真の答えが隠れているかもしれません...',
        '一緒に迷路を歩いてみましょう...きっと出口が見つかります...'
      ],
      userResistance: [
        'それも...あなたらしい選択ですね...',
        '無理に変える必要はありません...時が来れば自然に...',
        'あなたの心が...「いいえ」と言っているなら...それも一つの答えです...'
      ]
    }
  }
}

// キャラクターの個性データを取得
export const getCharacterPersonality = (characterId: string): CharacterPersonality | undefined => {
  return characterPersonalities[characterId]
}

// 関係性レベルの定義
export enum RelationshipLevel {
  STRANGER = 0,
  ACQUAINTANCE = 1,
  FRIEND = 2,
  CLOSE = 3
}

// 状況別応答の取得
export const getContextualResponse = (
  characterId: string,
  context: 'greeting' | 'praise' | 'concern' | 'advice' | 'casual' | 'goodbye'
): string => {
  const personality = getCharacterPersonality(characterId)
  if (!personality) return ''

  const responses = personality.speechPatterns[context]
  if (!responses || responses.length === 0) return ''

  const randomIndex = Math.floor(Math.random() * responses.length)
  return responses[randomIndex]
}

// 感情別応答の取得
export const getEmotionalResponse = (
  characterId: string,
  emotion: 'happy' | 'worried' | 'angry' | 'supportive' | 'confused' | 'excited'
): string => {
  const personality = getCharacterPersonality(characterId)
  if (!personality) return ''

  const responses = personality.emotions[emotion]
  if (!responses || responses.length === 0) return ''

  const randomIndex = Math.floor(Math.random() * responses.length)
  return responses[randomIndex]
}

// 特別な状況での応答
export const getSpecialResponse = (
  characterId: string,
  situation: 'userSuccess' | 'userFailure' | 'userConfusion' | 'userResistance'
): string => {
  const personality = getCharacterPersonality(characterId)
  if (!personality) return ''

  const responses = personality.specialResponses[situation]
  if (!responses || responses.length === 0) return ''

  const randomIndex = Math.floor(Math.random() * responses.length)
  return responses[randomIndex]
}