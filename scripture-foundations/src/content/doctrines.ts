import type { Doctrine } from './types';

/**
 * Doctrine Explorer content (Phase 3). DRAFT — every summary requires human theological review.
 * Each claim is labeled explicit (stated in the cited text), inferred (a synthesis across texts),
 * or disputed (Christians reach different conclusions). Perspectives describe each tradition in
 * terms its own teachers would recognize.
 */
export const DOCTRINES: Doctrine[] = [
  {
    id: 'godhead', topicId: '7.1', title: 'Trinity / Godhead',
    question: 'How does Scripture present one God alongside the Father, the Son, and the Holy Spirit?',
    explicit: [
      { ref: 'Deuteronomy 6:4', statement: 'The LORD is one.' },
      { ref: 'Isaiah 45:5–6', statement: 'There is no God beside the LORD.' },
      { ref: 'Matthew 28:19', statement: 'Disciples are baptized in the name of the Father, the Son, and the Holy Ghost.' },
      { ref: 'John 1:1', statement: 'The Word was with God, and the Word was God.' },
      { ref: 'John 20:28', statement: 'Thomas calls the risen Jesus Lord and God.' },
      { ref: 'Acts 5:3–4', statement: 'Lying to the Holy Ghost is called lying to God.' },
    ],
    inferred: [
      { statement: 'One God eternally exists as three distinct persons — Father, Son, and Holy Spirit.', refs: ['Matthew 28:19', 'John 1:1', 'Acts 5:3–4', '2 Corinthians 13:14'] },
      { statement: 'The Son and the Spirit share the divine identity rather than being created beings.', refs: ['John 1:3', 'Hebrews 1:8', 'Acts 5:3–4'] },
    ],
    disputed: [
      {
        issue: 'How are the Father, Son, and Spirit related?',
        perspectives: [
          { tradition: 'Nicene trinitarian (Catholic, Orthodox, most Protestants)', lens: 'catholic', summary: 'Three co-equal, co-eternal persons sharing one divine nature.', refs: ['Matthew 28:19', 'John 1:1'] },
          { tradition: 'Seventh-day Adventist', lens: 'adventist', summary: 'Trinitarian (Fundamental Belief 2), after a historical shift from the largely non-trinitarian views of early pioneers.', refs: ['Matthew 28:19', '2 Corinthians 13:14'] },
          { tradition: 'Non-trinitarian (Unitarian, Jehovah’s Witnesses)', summary: 'Only the Father is the one God; the Son is subordinate, and in some views created first.', refs: ['John 14:28', 'Colossians 1:15', '1 Corinthians 8:6'] },
          { tradition: 'Oneness Pentecostal', summary: 'One God manifested as Father, Son, and Spirit, not three persons.', refs: ['Colossians 2:9', 'Acts 2:38'] },
        ],
      },
    ],
    challenges: [
      { ref: 'John 14:28', why: 'Jesus says the Father is greater than he.' },
      { ref: 'Colossians 1:15', why: '“Firstborn of every creature” — rank, or first created?' },
      { ref: '1 Corinthians 15:24–28', why: 'The Son is subject to the Father at the end.' },
      { ref: 'Mark 13:32', why: 'The Son does not know the day or the hour.' },
    ],
    synthesisPrompt: 'Classify each text above as monotheism, Father/Son/Spirit distinction, divinity claim, or interpretive challenge, then explain which model accounts for all four groups best — and where it strains.',
  },
  {
    id: 'justification', topicId: '7.2', title: 'Faith versus works / justification',
    question: 'On what basis is a person declared righteous before God, and what role do works play?',
    explicit: [
      { ref: 'Romans 3:28', statement: 'A man is justified by faith without the deeds of the law.' },
      { ref: 'James 2:24', statement: 'A man is justified by works, and not by faith only.' },
      { ref: 'Ephesians 2:8–10', statement: 'Saved by grace through faith, not of works; created unto good works.' },
      { ref: 'Galatians 2:16', statement: 'Not justified by the works of the law, but by the faith of Jesus Christ.' },
      { ref: 'Titus 3:5', statement: 'Not by works of righteousness, but according to his mercy he saved us.' },
    ],
    inferred: [
      { statement: 'Paul and James answer different questions: Paul, the basis of standing before God apart from works of the law; James, whether a claimed faith is alive.', refs: ['Romans 3:28', 'James 2:14–18'] },
      { statement: 'Both authors use Abraham, but different episodes: believing the promise (Genesis 15) and offering Isaac (Genesis 22).', refs: ['Romans 4:1–5', 'James 2:21–23', 'Genesis 15:6', 'Genesis 22:1–18'] },
    ],
    disputed: [
      {
        issue: 'What does “justify” mean, and how do works relate to it?',
        perspectives: [
          { tradition: 'Protestant (Lutheran, Reformed, Evangelical)', lens: 'evangelical', summary: 'A legal declaration received by faith alone; works necessarily follow as evidence and fruit.', refs: ['Romans 4:5', 'Romans 5:1'] },
          { tradition: 'Seventh-day Adventist', lens: 'adventist', summary: 'Justification by faith in Christ’s righteousness; sanctification and obedience as the fruit of faith, stressed in the context of Revelation 14:12.', refs: ['Romans 3:24', 'Revelation 14:12'] },
          { tradition: 'Roman Catholic', lens: 'catholic', summary: 'Justification includes inner renewal; begun by grace in baptism and increased by faith working through love.', refs: ['Galatians 5:6', 'James 2:24'] },
          { tradition: 'Eastern Orthodox', lens: 'orthodox', summary: 'Salvation as theosis — participation in God’s life — with faith and works as synergy with grace.', refs: ['2 Peter 1:4', 'Philippians 2:12–13'] },
        ],
      },
    ],
    challenges: [
      { ref: 'James 2:24', why: 'Must be read directly beside Romans 3:28.' },
      { ref: 'Matthew 7:21–23', why: 'Profession without obedience is rejected.' },
      { ref: 'Philippians 2:12–13', why: 'Work out your salvation — because God works in you.' },
    ],
    synthesisPrompt: 'Explain the role of Abraham in both Romans 4 and James 2, citing the Genesis chapter each author relies on.',
  },
  {
    id: 'christ', topicId: '7.3', title: 'Nature and humanity of Christ',
    question: 'How does Scripture present Jesus as both divine and truly human?',
    explicit: [
      { ref: 'John 1:1', statement: 'The Word was God.' },
      { ref: 'John 1:14', statement: 'The Word was made flesh and dwelt among us.' },
      { ref: 'Philippians 2:6–7', statement: 'Being in the form of God, he took the form of a servant in human likeness.' },
      { ref: 'Colossians 2:9', statement: 'In him dwells all the fulness of the Godhead bodily.' },
      { ref: 'Hebrews 2:17', statement: 'He was made like his brethren in all things.' },
      { ref: '1 Timothy 2:5', statement: 'One mediator between God and men, the man Christ Jesus.' },
    ],
    inferred: [
      { statement: 'Christ is one person with a full divine nature and a full human nature (Council of Chalcedon, 451).', refs: ['John 1:14', 'Philippians 2:6–7', 'Hebrews 2:17'] },
    ],
    disputed: [
      {
        issue: 'What does it mean that he “emptied himself” (Philippians 2:7)?',
        perspectives: [
          { tradition: 'Classical Christology', summary: 'He took on humanity and a servant’s role without ceasing to possess divine attributes.', refs: ['Philippians 2:6–8', 'Colossians 2:9'] },
          { tradition: 'Kenotic Christology (some Protestants)', summary: 'He voluntarily set aside the independent use of certain divine attributes during the incarnation.', refs: ['Philippians 2:7', 'Mark 13:32'] },
        ],
      },
      {
        issue: 'Did Christ take an unfallen or a fallen human nature?',
        perspectives: [
          { tradition: 'Pre-fall view (many evangelicals; some Adventists)', lens: 'evangelical', summary: 'Christ’s human nature was like Adam’s before the fall, though he bore its weakened condition (fatigue, mortality).', refs: ['Luke 1:35', 'Hebrews 7:26'] },
          { tradition: 'Post-fall view (some Adventists, some other theologians)', lens: 'adventist', summary: 'Christ took fallen human nature yet never sinned — a debated topic within Adventism.', refs: ['Romans 8:3', 'Hebrews 2:14–18'] },
        ],
      },
    ],
    challenges: [
      { ref: 'Luke 2:52', why: 'Jesus grew in wisdom and stature.' },
      { ref: 'Mark 13:32', why: 'Limited knowledge of the day and hour.' },
      { ref: 'Hebrews 5:8', why: 'He learned obedience through suffering.' },
    ],
    synthesisPrompt: 'Sort the texts into divinity, humanity, and mediatorial role. Which ones fit more than one category?',
  },
  {
    id: 'covenant', topicId: '7.4', title: 'Law, grace, and covenant',
    question: 'What continues and what changes between the Sinai covenant and the new covenant?',
    explicit: [
      { ref: 'Jeremiah 31:33', statement: 'God will write his law in their hearts.' },
      { ref: 'Matthew 5:17', statement: 'Jesus came not to destroy the law, but to fulfil.' },
      { ref: 'Romans 3:31', statement: 'Faith does not make void the law; we establish the law.' },
      { ref: 'Romans 6:14', statement: 'Ye are not under the law, but under grace.' },
      { ref: 'Hebrews 8:13', statement: 'The first covenant is made old and ready to vanish away.' },
      { ref: 'Acts 15:28–29', statement: 'Gentile believers are given limited requirements, not circumcision.' },
    ],
    inferred: [
      { statement: 'The sacrificial and priestly system finds its fulfillment in Christ’s sacrifice and priesthood.', refs: ['Hebrews 8:1–6', 'Hebrews 10:1–14'] },
    ],
    disputed: [
      {
        issue: 'How should the Mosaic law apply to Christians?',
        perspectives: [
          { tradition: 'Threefold division (Reformed, Catholic, Adventist and others)', lens: 'reformed', summary: 'Moral law continues; ceremonial law is fulfilled in Christ; civil law applied to Israel as a nation.', refs: ['Matthew 5:17–19', 'Romans 13:8–10', 'Hebrews 10:1'] },
          { tradition: 'Seventh-day Adventist', lens: 'adventist', summary: 'The Decalogue is God’s permanent moral law (Sabbath included); ceremonial laws pointing to Christ ended at the cross.', refs: ['Exodus 20:1–17', 'Colossians 2:14–17', 'Revelation 14:12'] },
          { tradition: 'New Covenant theology / Dispensational views', lens: 'evangelical', summary: 'The Mosaic covenant ended as a unit; Christians are under the “law of Christ,” with moral content re-expressed in the New Testament.', refs: ['Galatians 3:24–25', 'Romans 7:4–6', '1 Corinthians 9:21'] },
        ],
      },
    ],
    challenges: [
      { ref: 'Galatians 3:19–25', why: 'The law as a schoolmaster until Christ.' },
      { ref: 'Romans 7:4–6', why: 'Believers have become dead to the law.' },
      { ref: 'Matthew 5:18–19', why: 'Not one jot or tittle passes until all is fulfilled.' },
    ],
    synthesisPrompt: 'Explain what changes and what continues across covenants, citing at least one text for each side.',
  },
  {
    id: 'sabbath', topicId: '7.5', title: 'Sabbath and rest',
    question: 'What does Scripture teach about the Sabbath, and is a weekly day binding for Christians?',
    explicit: [
      { ref: 'Genesis 2:2–3', statement: 'God rested on the seventh day, blessed and sanctified it.' },
      { ref: 'Exodus 20:8–11', statement: 'Remember the sabbath day; grounded in creation.' },
      { ref: 'Deuteronomy 5:12–15', statement: 'Keep the sabbath; grounded in deliverance from Egypt.' },
      { ref: 'Mark 2:27–28', statement: 'The sabbath was made for man; the Son of man is Lord of the sabbath.' },
      { ref: 'Luke 4:16', statement: 'Jesus went to the synagogue on the sabbath as his custom was.' },
      { ref: 'Colossians 2:16–17', statement: 'Let no one judge you regarding holy days or sabbaths, a shadow of things to come.' },
      { ref: 'Hebrews 4:9', statement: 'There remains a rest for the people of God.' },
    ],
    inferred: [
      { statement: 'Sabbath rest is grounded in both creation and redemption.', refs: ['Exodus 20:11', 'Deuteronomy 5:15'] },
    ],
    disputed: [
      {
        issue: 'Which day, and is a weekly day binding?',
        perspectives: [
          { tradition: 'Seventh-day Sabbath (Seventh-day Adventist, Seventh Day Baptist)', lens: 'adventist', summary: 'The seventh-day Sabbath is a creation ordinance in the Decalogue, kept by Jesus; Colossians 2:16 refers to ceremonial sabbaths and feasts.', refs: ['Genesis 2:2–3', 'Exodus 20:8–11', 'Luke 4:16', 'Isaiah 58:13–14'] },
          { tradition: 'Lord’s Day (Roman Catholic, Eastern Orthodox)', lens: 'catholic', summary: 'Sunday, the day of the resurrection, is the Christian day of worship that fulfills the Sabbath’s meaning.', refs: ['Acts 20:7', '1 Corinthians 16:2', 'Revelation 1:10'] },
          { tradition: 'Christian Sabbath on Sunday (Reformed / Westminster tradition)', lens: 'reformed', summary: 'The Sabbath principle is moral and perpetual, with the day changed to the first day at the resurrection.', refs: ['Exodus 20:8–11', 'Acts 20:7'] },
          { tradition: 'Fulfilled in Christ (many Evangelicals)', lens: 'evangelical', summary: 'Sabbath points to rest in Christ; no particular day is binding, though weekly worship and rest are wise.', refs: ['Colossians 2:16–17', 'Romans 14:5–6', 'Hebrews 4:1–11'] },
        ],
      },
    ],
    challenges: [
      { ref: 'Colossians 2:16–17', why: 'Must be discussed explicitly by seventh-day views.' },
      { ref: 'Romans 14:5–6', why: 'One esteems one day above another — which days are in view?' },
      { ref: 'Hebrews 4:1–11', why: 'Sabbath rest and entering God’s rest — weekly, spiritual, or both?' },
      { ref: 'Luke 23:56', why: 'Followers rested on the sabbath after the crucifixion — must be discussed by Sunday views.' },
    ],
    synthesisPrompt: 'Compare the creation (Genesis 2), Sinai (Exodus 20 / Deuteronomy 5), and new-covenant (Colossians 2 / Hebrews 4) arguments.',
  },
  {
    id: 'death', topicId: '7.6', title: 'Death, soul, and resurrection',
    question: 'What happens to a person between death and the resurrection?',
    explicit: [
      { ref: 'Genesis 2:7', statement: 'God formed man of dust, breathed life, and man became a living soul.' },
      { ref: 'Ecclesiastes 9:5', statement: 'The dead know not any thing.' },
      { ref: 'Daniel 12:2', statement: 'Many that sleep in the dust shall awake.' },
      { ref: 'John 11:11–14', statement: 'Jesus calls Lazarus’ death sleep.' },
      { ref: 'Philippians 1:23', statement: 'Paul desires to depart and be with Christ.' },
      { ref: '1 Corinthians 15:51–52', statement: 'The dead shall be raised incorruptible at the last trump.' },
    ],
    inferred: [
      { statement: 'The Christian hope centers on bodily resurrection at Christ’s return.', refs: ['1 Thessalonians 4:16–17', '1 Corinthians 15:51–57'] },
    ],
    disputed: [
      {
        issue: 'Is there conscious existence between death and resurrection?',
        perspectives: [
          { tradition: 'Conscious intermediate state (Catholic, Orthodox, most Protestants)', lens: 'catholic', summary: 'The soul survives death consciously, awaiting resurrection (Catholic teaching includes purgatory).', refs: ['Luke 23:43', 'Philippians 1:21–23', '2 Corinthians 5:8', 'Revelation 6:9–11'] },
          { tradition: 'Conditional immortality / soul sleep (Seventh-day Adventist and others)', lens: 'adventist', summary: 'Death is an unconscious sleep until resurrection; humans are a unity, not an immortal soul in a body. Luke 23:43 can be punctuated “I say unto thee today, …”', refs: ['Ecclesiastes 9:5', 'John 11:11–14', 'Daniel 12:2', '1 Timothy 6:16'] },
        ],
      },
    ],
    challenges: [
      { ref: 'Luke 23:43', why: 'Punctuation is not in the original manuscripts; both readings are argued.' },
      { ref: 'Revelation 6:9–11', why: 'Souls under the altar — apocalyptic imagery or literal state?' },
      { ref: 'Ecclesiastes 9:5–10', why: 'Wisdom genre — observation “under the sun,” or doctrine of death?' },
    ],
    synthesisPrompt: 'Explain why Christians differ on what happens between death and resurrection, addressing genre and punctuation.',
  },
  {
    id: 'sanctuary', topicId: '7.7', title: 'Judgment and sanctuary',
    question: 'How do the Day of Atonement and the heavenly sanctuary of Hebrews relate to judgment?',
    explicit: [
      { ref: 'Leviticus 16:30', statement: 'On the Day of Atonement the priest makes atonement to cleanse the people.' },
      { ref: 'Hebrews 9:11–12', statement: 'Christ entered the holy place by his own blood, obtaining eternal redemption.' },
      { ref: 'Hebrews 9:24–26', statement: 'Christ entered heaven itself, appearing for us; once in the end of the world.' },
      { ref: 'Daniel 7:9–10', statement: 'The judgment was set and the books were opened.' },
      { ref: 'Daniel 8:14', statement: 'Unto two thousand and three hundred days; then shall the sanctuary be cleansed.' },
      { ref: 'Revelation 14:7', statement: 'The hour of his judgment is come.' },
    ],
    inferred: [
      { statement: 'The Levitical Day of Atonement typologically points to Christ’s sacrifice and priestly ministry.', refs: ['Leviticus 16:1–34', 'Hebrews 9:6–14'] },
    ],
    disputed: [
      {
        issue: 'Daniel 8:14 and the timing and nature of judgment',
        perspectives: [
          { tradition: 'Historicist Adventist (interpretation)', lens: 'adventist', summary: 'Using day-for-a-year, the 2300 days run from 457 BC to AD 1844, when Christ began a pre-advent (investigative) judgment in the heavenly sanctuary.', refs: ['Daniel 8:14', 'Daniel 9:24–27', 'Daniel 7:9–10', 'Revelation 14:7'] },
          { tradition: 'Maccabean / preterist reading', summary: 'The 2300 evenings-mornings concern Antiochus IV’s desecration and the temple’s rededication in the 2nd century BC.', refs: ['Daniel 8:9–14', 'Daniel 8:23–25'] },
          { tradition: 'Futurist reading (many Evangelicals)', lens: 'evangelical', summary: 'Daniel 8 has an initial fulfillment under Antiochus and a future fulfillment in an end-time figure.', refs: ['Daniel 8:17', 'Daniel 8:19'] },
          { tradition: 'Common reading of Hebrews in other traditions', lens: 'reformed', summary: 'Christ entered the Most Holy Place at his ascension; his once-for-all sacrifice completes atonement, and final judgment occurs at his return.', refs: ['Hebrews 9:12', 'Hebrews 10:12–14', 'Hebrews 6:19–20'] },
        ],
      },
    ],
    challenges: [
      { ref: 'Hebrews 9:12', why: '“Entered in once into the holy place” — which apartment, and when?' },
      { ref: 'Hebrews 6:19–20', why: '“Within the veil” at the ascension.' },
      { ref: 'Hebrews 10:12–14', why: 'One sacrifice for sins forever; sat down.' },
      { ref: 'Daniel 7:9–14', why: 'A court scene that precedes the Son of man receiving the kingdom.' },
    ],
    synthesisPrompt: 'Distinguish the text, the typological connection, and any chronology inferred from the texts.',
  },
  {
    id: 'baptism', topicId: '7.8', title: 'Baptism and new life',
    question: 'Who should be baptized, how, and what does baptism signify or accomplish?',
    explicit: [
      { ref: 'Matthew 28:19', statement: 'Make disciples, baptizing them.' },
      { ref: 'Acts 2:38', statement: 'Repent, and be baptized every one of you.' },
      { ref: 'Romans 6:3–4', statement: 'Buried with him by baptism into death; raised to walk in newness of life.' },
      { ref: 'Acts 8:36–38', statement: 'The Ethiopian official goes down into the water and is baptized.' },
      { ref: 'Acts 16:33', statement: 'The jailer and all his household were baptized.' },
      { ref: '1 Peter 3:21', statement: 'Baptism doth also now save us — not the putting away of filth, but a good conscience.' },
    ],
    inferred: [
      { statement: 'In Acts, baptism typically follows hearing and repentance.', refs: ['Acts 2:38–41', 'Acts 8:35–38'] },
    ],
    disputed: [
      {
        issue: 'Subjects, mode, and meaning of baptism',
        perspectives: [
          { tradition: 'Roman Catholic', lens: 'catholic', summary: 'Infants and adults; a sacrament that regenerates and removes original sin.', refs: ['John 3:5', 'Acts 2:38–39'] },
          { tradition: 'Eastern Orthodox', lens: 'orthodox', summary: 'Infants and adults, by triple immersion, followed immediately by chrismation and communion.', refs: ['Matthew 28:19', 'Romans 6:3–4'] },
          { tradition: 'Reformed / Presbyterian', lens: 'reformed', summary: 'Believers and their children as a covenant sign, paralleling circumcision.', refs: ['Colossians 2:11–12', 'Acts 16:33'] },
          { tradition: 'Baptist, Adventist, and many Evangelicals', lens: 'adventist', summary: 'Believers only, by immersion, as a public ordinance symbolizing death and resurrection with Christ.', refs: ['Romans 6:3–4', 'Acts 8:36–38', 'Acts 2:38'] },
        ],
      },
    ],
    challenges: [
      { ref: 'Acts 16:15', why: 'Household baptisms — did they include children?' },
      { ref: '1 Peter 3:21', why: 'Baptism “saves” — sacramental or symbolic?' },
      { ref: 'Colossians 2:11–12', why: 'Circumcision and baptism side by side.' },
    ],
    synthesisPrompt: 'Explain the imagery of death and resurrection in Romans 6 and how it shapes views on the mode of baptism.',
  },
];

export const doctrineById = (id: string) => DOCTRINES.find((d) => d.id === id);
