import type { AuthoredLesson } from './types';

/**
 * Fully authored MVP lessons (§10). Editorial prose is DRAFT pending human theological review.
 * Convention: any KJV wording quoted in prose is wrapped in «…» and is verified by
 * src/content/content.test.ts against the imported Scripture text. Never type verse text elsewhere.
 */
export const LESSONS: AuthoredLesson[] = [
  // ───────────────────────────────────────────────────────────── Ephesians 2:8–10
  {
    id: 'eph-2-8-10',
    title: 'Grace, faith, and good works',
    topicIds: ['1.2', '7.2'],
    memorize: ['Ephesians 2:8–10'],
    objective: 'Explain why salvation is by grace through faith and why good works nevertheless matter.',
    outcomes: [
      'Recite Ephesians 2:8–10 with its reference.',
      'Distinguish the gift (grace), the means of reception (faith), and the result (good works).',
      'Compare Paul (Romans 3:28) and James (James 2:24) without suppressing either.',
    ],
    why: 'These three verses hold together two truths learners often split apart: salvation is not earned, and the saved are made for good works. Verse 10 is the necessary companion to verses 8–9.',
    context: {
      author: 'The letter names Paul as author (Ephesians 1:1). Most traditions accept this; some modern scholars debate it.',
      audience: 'Believers in Ephesus and the surrounding region, largely Gentile converts (Ephesians 2:11).',
      genre: 'Epistle — a pastoral letter with a doctrinal first half (chapters 1–3) and practical second half (4–6).',
      argument: 'Chapter 2 moves from death to life: humanity dead in sin (2:1–3), made alive by God’s mercy (2:4–7), saved by grace through faith for good works (2:8–10), then Jew and Gentile reconciled into one body (2:11–22).',
      sequence: [
        { ref: 'Ephesians 2:1–7', label: 'Dead in sin, made alive by mercy' },
        { ref: 'Ephesians 2:8–10', label: 'Gift, faith, and good works' },
        { ref: 'Ephesians 2:11–22', label: 'Reconciliation and unity' },
      ],
    },
    contextQuestion: {
      id: 'eph-ctx',
      kind: 'mc',
      stem: 'What does verse 10 add to verses 8–9?',
      options: [
        { text: 'It names the purpose God has for those saved by grace: good works He prepared beforehand.', correct: true, rationale: 'Verse 10 begins with «For» and explains that believers are God’s «workmanship», created «unto good works». Works are the goal of salvation, not its basis.' },
        { text: 'It adds works as a second condition that completes what grace began.', rationale: 'Verse 9 has just excluded works as the ground of salvation («Not of works»). Verse 10 describes the result, not an added requirement.' },
        { text: 'It corrects verses 8–9 by restoring the importance of the law.', rationale: 'There is no contrast word; verse 10 continues the same thought. The law is not mentioned in these verses.' },
        { text: 'Nothing; verse 10 starts a new, unrelated topic.', rationale: 'Verse 10 is grammatically and logically tied to 8–9 and should be read with them.' },
      ],
      evidence: ['Ephesians 2:8–10'],
    },
    questions: [
      {
        id: 'eph-q1',
        kind: 'mc',
        stem: 'According to verse 9, why is salvation «Not of works»?',
        options: [
          { text: 'So that no one can boast.', correct: true, rationale: 'The verse gives its own reason: «lest any man should boast».' },
          { text: 'Because works are morally bad.', rationale: 'Verse 10 calls them «good works»; the problem is boasting, not the works themselves.' },
          { text: 'Because God has not prepared any works for believers.', rationale: 'Verse 10 says the opposite: God «before ordained» good works.' },
          { text: 'Because faith is itself a work that earns salvation.', rationale: 'Faith is the means of receiving a gift; verse 8 contrasts the gift with anything «of yourselves».' },
        ],
        evidence: ['Ephesians 2:9'],
      },
      {
        id: 'eph-q2',
        kind: 'mc',
        stem: 'In verse 8, what is «the gift of God»?',
        options: [
          { text: 'Interpreters differ: many read it as the whole saving arrangement (grace received through faith); others see faith itself as the gift.', correct: true, rationale: 'In Greek the word behind «that» is neuter, while “grace” and “faith” are feminine, so many commentators take it to refer to the entire event of salvation. This is a reasoned interpretation, not something the English settles.' },
          { text: 'Good works only.', rationale: 'Works appear in verse 10 as the result of salvation; verse 8 is speaking of being saved.' },
          { text: 'The law of Moses.', rationale: 'The law is not mentioned in Ephesians 2:8–10.' },
          { text: 'Membership in the church at Ephesus.', rationale: 'The passage is about salvation, not local church membership.' },
        ],
        evidence: ['Ephesians 2:8'],
      },
      {
        id: 'eph-q3',
        kind: 'mc',
        stem: 'What does calling believers God’s «workmanship» emphasize?',
        options: [
          { text: 'God is the maker; the new life and its good works originate with Him.', correct: true, rationale: 'Believers are «created in Christ Jesus» — new creation language. God is the active agent.' },
          { text: 'Believers make themselves acceptable through effort.', rationale: 'The word points to God’s craftsmanship, not human self-improvement.' },
          { text: 'Good works are optional decorations.', rationale: 'They are what believers are created «unto», and God ordained that «we should walk in them».' },
        ],
        evidence: ['Ephesians 2:10', '2 Corinthians 5:17'],
      },
      {
        id: 'eph-q4',
        kind: 'short',
        stem: 'In two or three sentences, explain how works can be important without being the basis for earning salvation.',
        sample: 'Paul says salvation comes by grace through faith and is not of works, so no one can boast (2:8–9). Yet in the very next verse believers are God’s workmanship created for good works (2:10). Works are therefore the purpose and fruit of salvation rather than its price.',
        checklist: ['Cites verses 8–9 for the basis (grace, faith, not works)', 'Cites verse 10 for the purpose (good works)', 'Distinguishes basis/root from result/fruit'],
        evidence: ['Ephesians 2:8–10', 'Titus 3:5–8'],
      },
    ],
    connect: {
      intro: 'Follow this sequence. Each link states what kind of connection it is — a link is a reason to read, not an automatic proof.',
      sequence: [
        { ref: 'Romans 3:28', label: 'not by works of law', type: 'support', status: 'draft', note: 'Paul concludes that a person is justified by faith apart from the deeds of the law. This parallels Ephesians 2:8–9 on the basis of salvation.' },
        { ref: 'Romans 4:1–8', label: 'Abraham counted righteous', type: 'support', status: 'draft', note: 'Paul uses Abraham (quoting Genesis 15:6) to show that righteousness was counted to him through believing, before circumcision and apart from works.' },
        { ref: 'James 2:14–26', label: 'faith and deeds', type: 'tension', status: 'draft', challenge: true, note: 'James insists that faith without works is dead and that Abraham was justified by works when he offered Isaac. This is the necessary comparison text; read the whole paragraph, not just verse 24.' },
        { ref: 'Genesis 15:6; 22:1–18', label: 'Abraham examples', type: 'background', status: 'draft', note: 'Paul draws on Genesis 15 (believing the promise); James draws on Genesis 22 (offering Isaac). Seeing both scenes clarifies that the two authors use different moments in Abraham’s life.' },
        { ref: 'Titus 3:5–8', label: 'not by works of righteousness; devote to good works', type: 'support', status: 'draft', note: 'Like Ephesians 2, Titus 3 holds both truths in one paragraph: saved by mercy, not works of righteousness — and believers should be careful to maintain good works.' },
      ],
      match: {
        prompt: 'Match each passage to the argument it makes.',
        pairs: [
          { ref: 'Romans 3:28', argument: 'Justification is by faith, apart from the deeds of the law — Jew and Gentile stand on the same footing.' },
          { ref: 'James 2:24', argument: 'A claimed faith that produces no action is dead; genuine faith is shown by works.' },
          { ref: 'Titus 3:5–8', argument: 'Saved by God’s mercy, not works of righteousness — and therefore careful to maintain good works.' },
        ],
      },
    },
    synthesis: {
      prompt: 'Explain in 2–3 sentences how Paul and James can be read together.',
      sample: 'Paul addresses the basis on which anyone stands right with God and excludes works of the law (Romans 3:28). James addresses a claimed faith that produces nothing and shows that living faith acts (James 2:17, 24). Both use Abraham, but different scenes: Paul Genesis 15, James Genesis 22.',
      perspectives: [
        { tradition: 'Protestant (Lutheran, Reformed, Evangelical)', lens: 'evangelical', summary: 'Justification is a legal declaration received by faith alone; works are the necessary evidence of genuine faith. James uses “justified” in the sense of shown or vindicated before others.', refs: ['Romans 3:28', 'Romans 4:5', 'James 2:18'] },
        { tradition: 'Reformed', lens: 'reformed', summary: 'Shares the Protestant view above and stresses that the faith which justifies is itself God’s gift and always produces sanctification.', refs: ['Ephesians 2:8–10', 'Philippians 1:6'] },
        { tradition: 'Seventh-day Adventist', lens: 'adventist', summary: 'Affirms justification by grace through faith; emphasizes obedience to God’s commandments as the fruit of saving faith and of Christ’s indwelling.', refs: ['Ephesians 2:8–10', 'Revelation 14:12', 'John 14:15'] },
        { tradition: 'Roman Catholic', lens: 'catholic', summary: 'Justification begins by grace (received in baptism) and includes inner renewal; faith working through love, by grace, grows in justification. Works done in grace have value only because of grace.', refs: ['Galatians 5:6', 'James 2:24', 'Titus 3:5'] },
        { tradition: 'Eastern Orthodox', lens: 'orthodox', summary: 'Salvation is participation in God’s life (theosis). Faith and works are not rival grounds but cooperative (synergistic) responses to grace.', refs: ['2 Peter 1:3–4', 'Philippians 2:12–13'] },
      ],
    },
    apply: {
      scenario: 'A friend says: “If I’m saved by grace, it really doesn’t matter how I live.”',
      prompt: 'How would you respond using Ephesians 2:8–10? Write a short reply.',
      textual: [
        'Verses 8–9: salvation is a gift, not of works — agree with this part.',
        'Verse 10: believers are created «unto good works» which God prepared — so how we live matters.',
      ],
      interpretive: [
        'Whether works are best described as “evidence,” “fruit,” or “cooperation with grace” depends on one’s tradition.',
        'How strongly to warn about a careless life connects to the assurance/perseverance debate (Topic 1.4).',
      ],
    },
    interpretiveNote: 'A common Protestant reading differentiates the basis of salvation from the evidence of living faith. Other Christian traditions formulate justification and the role of works differently; present their claims with citations, not caricatures.',
  },

  // ───────────────────────────────────────────────────────────── Matthew 22:37–40
  {
    id: 'matt-22-37-40',
    title: 'The greatest commandments',
    topicIds: ['2.1'],
    memorize: ['Matthew 22:37–40'],
    objective: 'Explain love of God and neighbor as the heart of obedience.',
    outcomes: [
      'Recite Matthew 22:37–40 with its reference.',
      'Identify the two Old Testament texts Jesus quotes.',
      'Explain what it means that the law and the prophets «hang» on these commandments.',
    ],
    why: 'Jesus himself selects these two commands as the summary of all Scripture’s moral teaching, quoting the Torah directly. It is the lens through which the rest of the law is read.',
    context: {
      author: 'The Gospel of Matthew, traditionally attributed to the apostle Matthew (the text itself is anonymous).',
      audience: 'Likely a largely Jewish-Christian readership, with frequent appeals to the Hebrew Scriptures.',
      genre: 'Gospel narrative — here, a controversy dialogue in the temple during the final week before the crucifixion.',
      argument: 'In Matthew 22 Jesus faces a series of testing questions: taxes (22:15–22), resurrection (22:23–33), and the great commandment (22:34–40). He then asks his own question about the Messiah as David’s son (22:41–46), after which no one dares question him further.',
      sequence: [
        { ref: 'Matthew 22:15–22', label: 'Tribute to Caesar' },
        { ref: 'Matthew 22:23–33', label: 'Question on the resurrection' },
        { ref: 'Matthew 22:34–40', label: 'The great commandment' },
        { ref: 'Matthew 22:41–46', label: 'Whose son is the Christ?' },
      ],
    },
    contextQuestion: {
      id: 'mt22-ctx',
      kind: 'mc',
      stem: 'Why did the lawyer ask Jesus which commandment is greatest?',
      options: [
        { text: 'He was testing him, as part of a series of challenges in the temple.', correct: true, rationale: 'Verse 35 says he asked «tempting him», following the Pharisees’ and Sadducees’ earlier tests in the same chapter.' },
        { text: 'He wanted to become a disciple.', rationale: 'Matthew presents the question as a test; Mark’s parallel (Mark 12:34) shows a more sympathetic scribe — compare the accounts rather than merging them.' },
        { text: 'Jesus had just abolished the law.', rationale: 'Nothing in the chapter suggests this; Jesus answers by quoting the law.' },
      ],
      evidence: ['Matthew 22:34–36', 'Mark 12:28–34'],
    },
    questions: [
      {
        id: 'mt22-q1',
        kind: 'mc',
        stem: 'Which two Old Testament passages does Jesus quote?',
        options: [
          { text: 'Deuteronomy 6:5 and Leviticus 19:18', correct: true, rationale: 'Love God with all your heart (Deuteronomy 6:5, part of the Shema) and love your neighbor as yourself (Leviticus 19:18).' },
          { text: 'Exodus 20:3 and Exodus 20:12', rationale: 'Those are commandments of the Decalogue, but Jesus quotes Deuteronomy and Leviticus here.' },
          { text: 'Micah 6:8 and Psalm 23:1', rationale: 'Neither is quoted in Matthew 22:37–40.' },
          { text: 'Genesis 1:27 and Isaiah 53:5', rationale: 'Neither is quoted in this passage.' },
        ],
        evidence: ['Deuteronomy 6:5', 'Leviticus 19:18'],
      },
      {
        id: 'mt22-q2',
        kind: 'mc',
        stem: 'What does it mean that «all the law and the prophets» hang on these two commandments?',
        options: [
          { text: 'All of Scripture’s moral teaching depends on and is summed up by love for God and neighbor.', correct: true, rationale: 'The image is of everything suspended from these two pegs. Romans 13:8–10 makes the same point: love is the fulfilling of the law.' },
          { text: 'The other commandments are cancelled and replaced.', rationale: 'Jesus summarizes rather than abolishes (compare Matthew 5:17). Romans 13:9 lists specific commandments as expressions of love.' },
          { text: 'Only the prophets matter now, not the law.', rationale: 'Both «the law and the prophets» — the whole Hebrew Scriptures — hang on these commands.' },
        ],
        evidence: ['Matthew 22:40', 'Romans 13:8–10', 'Matthew 5:17'],
      },
      {
        id: 'mt22-q3',
        kind: 'mc',
        stem: 'Deuteronomy 6:5 says heart, soul, and might; Matthew 22:37 says heart, soul, and mind (Mark 12:30 lists four). How should we understand this?',
        options: [
          { text: 'It is quotation variation; the teaching — total, whole-person love for God — is unchanged.', correct: true, rationale: 'New Testament writers often quote freely or follow different renderings. The point in every version is undivided devotion.' },
          { text: 'One of the Gospels must be wrong.', rationale: 'Variation in wording is normal in ancient quotation and is not a contradiction of meaning.' },
          { text: 'Jesus deliberately changed the commandment to remove physical strength.', rationale: 'Mark’s parallel includes «strength», so nothing is being removed.' },
        ],
        evidence: ['Deuteronomy 6:5', 'Matthew 22:37', 'Mark 12:30'],
      },
      {
        id: 'mt22-q4',
        kind: 'short',
        stem: 'In Luke’s account, the lawyer asks «who is my neighbour?» How does the parable that follows answer him?',
        sample: 'Jesus tells of a Samaritan — an outsider despised by the hearers — who shows mercy to a wounded man that the priest and Levite pass by (Luke 10:30–37). Instead of defining who qualifies as a neighbor, Jesus asks who acted as a neighbor and says, go and do likewise.',
        checklist: ['Mentions the Samaritan as an unexpected example', 'Notes the question shifts from “who is my neighbor?” to “who acted as a neighbor?”', 'Cites Luke 10'],
        evidence: ['Luke 10:25–37'],
      },
    ],
    connect: {
      intro: 'Trace where Jesus’ words come from, how the other Gospels report the scene, and how the apostles applied it.',
      sequence: [
        { ref: 'Deuteronomy 6:4–9', label: 'love of God', type: 'quotation', status: 'draft', note: 'The Shema. Jesus quotes verse 5 as the first and great commandment; verses 6–9 show love for God expressed in teaching, memory, and daily life.' },
        { ref: 'Leviticus 19:18', label: 'neighbor', type: 'quotation', status: 'draft', note: 'Jesus quotes the second half of this verse. In context it forbids revenge and grudges against one’s people; Jesus widens its reach in Luke 10.' },
        { ref: 'Mark 12:28–34', label: 'parallel', type: 'parallel', status: 'draft', note: 'Mark includes the Shema’s opening (“the Lord our God is one Lord”), four faculties, and a scribe whom Jesus says is not far from the kingdom.' },
        { ref: 'Luke 10:25–37', label: 'Good Samaritan', type: 'parallel', status: 'draft', note: 'A similar exchange in a different setting: here the lawyer recites the two commands, and Jesus answers his follow-up question with the parable.' },
        { ref: 'Romans 13:8–10', label: 'love and law', type: 'support', status: 'draft', note: 'Paul names specific commandments and says they are summed up in loving your neighbor — love is the fulfilling of the law.' },
      ],
      match: {
        prompt: 'Match each passage to its role.',
        pairs: [
          { ref: 'Deuteronomy 6:4–9', argument: 'Source of the first commandment: undivided love for the one LORD.' },
          { ref: 'Leviticus 19:18', argument: 'Source of the second commandment: love your neighbor as yourself, not revenge.' },
          { ref: 'Romans 13:8–10', argument: 'Apostolic application: specific commandments are summed up and fulfilled in love.' },
        ],
      },
    },
    synthesis: {
      prompt: 'How do Matthew 22:40 and Romans 13:8–10 describe the relationship between love and the commandments?',
      sample: 'Jesus says the whole law and prophets hang on love for God and neighbor (Matthew 22:40). Paul lists specific commandments and says they are summed up in love, which fulfills the law (Romans 13:9–10). Love is the root and goal that the individual commands express.',
      perspectives: [
        { tradition: 'Many Catholic, Reformed, and Adventist teachers', summary: 'Love summarizes and fulfills the commandments, which continue to describe what love looks like in practice (the Decalogue as the shape of love).', refs: ['Romans 13:9', 'John 14:15', '1 John 5:3'] },
        { tradition: 'New Covenant theology and some Evangelicals', lens: 'evangelical', summary: 'Love is the governing principle of the new covenant “law of Christ”; the Mosaic code as a unit is fulfilled in Christ, while its moral content is re-expressed in apostolic teaching.', refs: ['Galatians 6:2', 'Galatians 5:14', 'Romans 13:10'] },
      ],
    },
    apply: {
      scenario: 'A neighbor repeatedly lets their dog onto your property and was rude when you mentioned it.',
      prompt: 'Name two concrete ways to love this neighbor while still addressing the problem honestly.',
      textual: [
        'Leviticus 19:18 forbids revenge and bearing a grudge.',
        'Luke 10 defines neighbor-love by merciful action, not by whether the other person deserves it.',
      ],
      interpretive: [
        'Love does not require ignoring a real problem; how to balance patience and honest confrontation is practical wisdom, not a direct command of these texts.',
      ],
    },
    interpretiveNote: 'Distinguish quotation variation between Deuteronomy and the Gospels from any change in teaching. The greatest-commandment summary does not settle every debate about how the Mosaic law applies to Christians — see Topics 3.2 and 7.4.',
  },

  // ───────────────────────────────────────────────────────────── Matthew 28:19 + John 1:1–14
  {
    id: 'godhead-matt-28-john-1',
    title: 'Father, Son, and Spirit; the Word made flesh',
    topicIds: ['7.1', '7.3'],
    memorize: ['Matthew 28:19', 'John 1:1–14'],
    objective: 'Examine key texts used to construct the doctrine of the Godhead and the incarnation, distinguishing what the text says from later doctrinal synthesis.',
    outcomes: [
      'Recite Matthew 28:19 and John 1:1–14 with references.',
      'Classify texts as monotheism, Father/Son/Spirit distinction, divinity claim, or interpretive challenge.',
      'Explain that “Trinity” and creedal formulas are syntheses, not direct quotations.',
    ],
    why: 'Matthew 28:19 places Father, Son, and Holy Ghost together in one baptismal formula; John 1:1–14 presents the Word as with God, as God, as Creator, and as made flesh. Together they anchor both the Godhead and the incarnation discussions.',
    context: {
      author: 'Matthew: traditionally the apostle Matthew. John: traditionally the apostle John, “the disciple whom Jesus loved” (John 21:20–24). Both Gospels are formally anonymous.',
      audience: 'Matthew: likely Jewish-Christian communities. John: a mixed audience, written «that ye might believe» (John 20:31).',
      genre: 'Matthew 28:16–20 is the closing commission of a Gospel narrative. John 1:1–18 is a poetic prologue that deliberately echoes Genesis 1.',
      argument: 'Matthew ends with the risen Jesus claiming all authority and sending disciples to all nations. John opens before creation: the Word was with God and was God, made all things, came as light, and became flesh to reveal the Father.',
      sequence: [
        { ref: 'Matthew 28:16–20', label: 'The risen Christ commissions the disciples' },
        { ref: 'Genesis 1:1–3', label: 'Creation by God’s word — John’s backdrop' },
        { ref: 'John 1:1–5', label: 'The Word: with God, God, Creator, life and light' },
        { ref: 'John 1:6–13', label: 'John the Baptist’s witness; the Word rejected and received' },
        { ref: 'John 1:14–18', label: 'The Word made flesh reveals the Father' },
      ],
    },
    contextQuestion: {
      id: 'g-ctx',
      kind: 'mc',
      stem: 'John 1:1 opens with «In the beginning». What does this deliberately echo?',
      options: [
        { text: 'Genesis 1:1 — the account of creation.', correct: true, rationale: 'Genesis 1:1 begins with the same words, and John 1:3 goes on to speak of all things being made. John places the Word at creation.' },
        { text: 'The beginning of Jesus’ ministry in Galilee.', rationale: 'John describes the Word before anything was made, not the start of public ministry.' },
        { text: 'The founding of the church at Pentecost.', rationale: 'Pentecost is in Acts 2; John 1 reaches back before creation.' },
      ],
      evidence: ['Genesis 1:1', 'John 1:1–3'],
    },
    questions: [
      {
        id: 'g-q1',
        kind: 'mc',
        stem: 'What is notable about the wording of Matthew 28:19?',
        options: [
          { text: 'It places the Father, the Son, and the Holy Ghost together under one «name» in baptism.', correct: true, rationale: 'The text uses the singular «name» for all three. Trinitarians see shared divine identity; others read “name” as authority. Either way, the three are named together.' },
          { text: 'It uses the word “Trinity.”', rationale: 'The word “Trinity” does not appear in Scripture; it is a later theological term.' },
          { text: 'It mentions only the Father.', rationale: 'All three are named.' },
        ],
        evidence: ['Matthew 28:19'],
      },
      {
        id: 'g-q2',
        kind: 'mc',
        stem: 'John 1:1 says the Word was «with God» and the Word «was God». What two ideas are held together?',
        options: [
          { text: 'Distinction (with God) and divine identity (was God).', correct: true, rationale: 'Being “with” someone implies distinction; “was God” asserts deity. Trinitarian doctrine tries to hold both; other readings explain the second clause differently (see the Doctrine Explorer).' },
          { text: 'The Word is a created angel.', rationale: 'Verse 3 says all things were made by him and «without him was not any thing made that was made».' },
          { text: 'The Word is simply a book of Scripture.', rationale: 'Verse 14 says the Word became flesh — a person, identified with Jesus (1:17).' },
        ],
        evidence: ['John 1:1–3', 'John 1:14'],
      },
      {
        id: 'g-q3',
        kind: 'mc',
        stem: 'What does John 1:14 contribute to the doctrine of Christ?',
        options: [
          { text: 'The incarnation: the eternal Word truly became human and lived among people.', correct: true, rationale: '«the Word was made flesh, and dwelt among us». This is a key text for Christ’s true humanity (compare Hebrews 2:14–18).' },
          { text: 'That Jesus only appeared to be human.', rationale: 'That view (docetism) is contradicted by «made flesh»; compare 1 John 4:2.' },
          { text: 'That the Word stopped being divine.', rationale: 'Verse 14 also speaks of «his glory» as of the only begotten of the Father; how divinity and humanity relate is discussed in Topic 7.3.' },
        ],
        evidence: ['John 1:14', 'Hebrews 2:14–18'],
      },
      {
        id: 'g-q4',
        kind: 'short',
        stem: 'Why is it important to say that “Trinity” and the Nicene formula are not direct biblical quotations?',
        sample: 'The doctrine is a synthesis built from many texts — one God (Deuteronomy 6:4), Father, Son, and Spirit named together (Matthew 28:19), and the Word as God (John 1:1). Saying so honestly separates explicit statements from inference, lets learners evaluate the reasoning, and respects that some groups read the texts differently.',
        checklist: ['Distinguishes explicit text from inferred doctrine', 'Cites at least two supporting texts', 'Acknowledges challenge texts or other readings'],
        evidence: ['Deuteronomy 6:4', 'Matthew 28:19', 'John 1:1'],
      },
    ],
    connect: {
      intro: 'Classify these connections. Supporting texts and challenge texts are shown together so you can weigh them honestly.',
      sequence: [
        { ref: 'Deuteronomy 6:4', label: 'one LORD', type: 'support', status: 'draft', note: 'The Shema anchors biblical monotheism. Any account of Father, Son, and Spirit must keep this confession intact.' },
        { ref: 'Matthew 3:16–17', label: 'baptism of Jesus', type: 'support', status: 'draft', note: 'The Son is baptized, the Spirit descends, and the Father speaks — three distinguished in one scene.' },
        { ref: 'John 20:28', label: 'Thomas', type: 'support', status: 'draft', note: 'Thomas addresses the risen Jesus as «My Lord and my God», and Jesus accepts it. Often cited as an explicit divinity claim.' },
        { ref: 'Hebrews 1:1–8', label: 'Son', type: 'support', status: 'draft', note: 'The Son is heir, agent of creation, and radiance of God’s glory; verse 8 applies Psalm 45 («Thy throne, O God») to the Son.' },
        { ref: '2 Corinthians 13:14', label: 'triadic blessing', type: 'support', status: 'draft', note: 'Paul’s closing blessing names the Lord Jesus Christ, God, and the Holy Ghost together.' },
        { ref: 'John 14:28', label: 'Father greater', type: 'tension', status: 'draft', challenge: true, note: 'Jesus says the Father is greater than he. Trinitarians often relate this to the Son’s incarnate role; non-trinitarians read it as ontological. Do not skip it.' },
        { ref: 'Colossians 1:15', label: 'firstborn', type: 'tension', status: 'draft', challenge: true, note: '“Firstborn of every creature” is read by some as Christ being created first; others read “firstborn” as rank or preeminence, noting verse 16 says all things were created by him.' },
        { ref: 'Mark 13:32', label: 'knowledge', type: 'tension', status: 'draft', challenge: true, note: 'The Son does not know the day or hour. Relevant to both the Godhead and Christ’s humanity (Topic 7.3).' },
      ],
      match: {
        prompt: 'Classify each text.',
        pairs: [
          { ref: 'Deuteronomy 6:4', argument: 'Monotheism' },
          { ref: 'Matthew 3:16–17', argument: 'Father/Son/Spirit distinction' },
          { ref: 'John 20:28', argument: 'Divinity claim' },
          { ref: 'John 14:28', argument: 'Interpretive challenge' },
        ],
      },
    },
    synthesis: {
      prompt: 'How might someone hold together Deuteronomy 6:4, John 1:1, and John 14:28? Answer in 2–3 sentences and label what is text versus inference.',
      sample: 'Text: there is one LORD (Deuteronomy 6:4); the Word was with God and was God (John 1:1); the Father is greater (John 14:28). Inference (trinitarian): one divine being exists as distinct persons, and the “greater” statement concerns the Son’s incarnate, sent role. Other readings resolve the tension differently.',
      perspectives: [
        { tradition: 'Nicene trinitarian (Catholic, Orthodox, most Protestants)', lens: 'catholic', summary: 'One God eternally exists as Father, Son, and Holy Spirit, co-equal and co-eternal. Texts of subordination describe the Son’s incarnate or sent role, not lesser deity.', refs: ['Matthew 28:19', 'John 1:1', 'Philippians 2:6–7'] },
        { tradition: 'Eastern Orthodox emphasis', lens: 'orthodox', summary: 'Affirms the Nicene faith and stresses the Father as the eternal source (monarchy of the Father); rejects the Western addition that the Spirit proceeds “and the Son” (filioque).', refs: ['John 15:26'] },
        { tradition: 'Seventh-day Adventist', lens: 'adventist', summary: 'Fundamental Belief 2 affirms one God in three co-eternal persons. Many early Adventist pioneers held non-trinitarian views; the church adopted trinitarian language over time.', refs: ['Matthew 28:19', '2 Corinthians 13:14', 'Deuteronomy 6:4'] },
        { tradition: 'Evangelical Protestant', lens: 'evangelical', summary: 'Affirms the historic doctrine of the Trinity as faithful to Scripture, while recognizing it as a synthesis of many texts.', refs: ['John 1:1', 'Acts 5:3–4', 'Matthew 3:16–17'] },
        { tradition: 'Non-trinitarian readings (e.g., Unitarian, Jehovah’s Witnesses)', summary: 'The Father alone is the one God; the Son is distinct and subordinate (some hold he was created first, citing Colossians 1:15). Outside the historic creeds.', refs: ['John 14:28', 'Colossians 1:15', '1 Corinthians 8:6'] },
        { tradition: 'Oneness Pentecostal', summary: 'One God who reveals himself as Father, Son, and Spirit as modes or manifestations rather than distinct persons; baptism in Jesus’ name (Acts 2:38).', refs: ['Acts 2:38', 'Colossians 2:9'] },
      ],
    },
    apply: {
      scenario: 'A coworker asks: “Do Christians believe in three gods?”',
      prompt: 'Write a brief, respectful answer that distinguishes what the Bible states from how Christians have summarized it.',
      textual: [
        'Deuteronomy 6:4 — there is one LORD.',
        'Matthew 28:19 and John 1:1 — Father, Son, and Spirit; the Word was God.',
      ],
      interpretive: [
        '“Three persons, one being” is a creedal summary (Nicaea 325, Constantinople 381), not a quotation.',
        'Acknowledge that some groups who use the Bible reach different conclusions (1 Peter 3:15 — gentleness and respect).',
      ],
    },
    interpretiveNote: 'The term Trinity and later creedal formulas are not direct biblical quotations. Present supporting texts and challenge texts together, and label each claim as explicit, inferred, or disputed.',
  },
];

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
