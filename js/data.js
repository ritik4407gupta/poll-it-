const TIMELINE_DATA = [
    {
        year: '500 BC',
        icon: '🏛️',
        title: 'Birth of Democracy',
        text: 'Athenians invent demokratia — citizens vote with pebbles (psephoi) on whitewashed walls.'
    },
    {
        year: '1856',
        icon: '📜',
        title: 'The Secret Ballot',
        text: 'Australia introduces the secret ballot, ensuring privacy and freedom from coercion in voting.'
    },
    {
        year: '1893',
        icon: '👩',
        title: "Women's Suffrage",
        text: 'New Zealand becomes the first country to grant women the right to vote in parliamentary elections.'
    },
    {
        year: '1950',
        icon: '🇮🇳',
        title: 'Universal Adult Franchise',
        text: 'India adopts universal adult suffrage at independence — every adult citizen, regardless of class, votes.'
    },
    {
        year: '1982',
        icon: '🖥️',
        title: 'First EVM',
        text: 'India pilots its first Electronic Voting Machine in Kerala, replacing paper for selected booths.'
    },
    {
        year: '2013',
        icon: '🧾',
        title: 'VVPAT Introduced',
        text: 'Voter-Verifiable Paper Audit Trail rolls out — printed slips let voters confirm their EVM vote.'
    },
    {
        year: '2020',
        icon: '🔗',
        title: 'Blockchain Pilots',
        text: 'Estonia, Utah and others pilot blockchain-based voter verification for tamper-evident audit logs.'
    },
    {
        year: '2026',
        icon: '🤖',
        title: 'AI-Assisted Education',
        text: 'Interactive civic platforms (like Poll-It!) democratise election knowledge — that is what you are using.'
    }
];

// ---------------- EVM Candidates ----------------
const CANDIDATES = [
    { name: 'Aria Mehra',      party: 'Civic Reform Party',     symbol: '🌳', color: '#10b981' },
    { name: 'Devansh Kapoor',  party: 'United Progressives',    symbol: '🪁', color: '#3b82f6' },
    { name: 'Layla Singh',     party: 'Sunrise Coalition',      symbol: '☀️', color: '#f59e0b' },
    { name: 'Mateo Reyes',     party: 'People\'s Forward',      symbol: '🐘', color: '#8b5cf6' },
    { name: 'NOTA',            party: 'None Of The Above',      symbol: '⊘',  color: '#64748b' }
];

// ---------------- Quiz Questions ----------------
const QUIZ_DATA = [
    {
        q: 'Which document, signed in 1215, first limited monarchical power and influenced modern democracy?',
        options: ['Magna Carta', 'Declaration of Independence', 'Treaty of Versailles', 'Bill of Rights'],
        correct: 0
    },
    {
        q: 'What does VVPAT stand for in election terminology?',
        options: [
            'Verified Voter Polling Authentication Token',
            'Voter Verifiable Paper Audit Trail',
            'Virtual Voting Process And Tally',
            'Validated Vote Print Audit Trace'
        ],
        correct: 1
    },
    {
        q: 'Which country was the first to grant women the right to vote in national elections?',
        options: ['United States', 'United Kingdom', 'New Zealand', 'France'],
        correct: 2
    },
    {
        q: 'In a blockchain-secured voting ledger, what makes tampering immediately visible?',
        options: [
            'A central administrator reviews each vote',
            'Each block contains the hash of the previous block, so editing one breaks all that follow',
            'Votes are encrypted with a single shared password',
            'Voters can re-cast their vote any time'
        ],
        correct: 1
    },
    {
        q: 'On an Indian EVM, what does the "NOTA" button represent?',
        options: ['No Online Tally Allowed', 'Neutral Open Tally Audit', 'None Of The Above', 'New Online Tally Authentication'],
        correct: 2
    }
];

// ---------------- Crisis Scenarios ----------------
const CRISIS_DATA = [
    {
        title: 'Flood Warning in District A',
        severity: '⚠ HIGH',
        desc: 'Polling day morning: heavy rain has flooded access roads to 12 booths in District A. 40,000 voters cannot reach their stations easily. You have 3 hours before peak voting.',
        choices: [
            {
                icon: '🚤',
                label: 'Deploy boats & extend voting hours by 2h',
                feedback: 'Smart call. Boats reach affected booths, hours are extended. Turnout dips slightly but voters trust the system to adapt.',
                turnout: -3, trust: +6, safety: -2
            },
            {
                icon: '⛔',
                label: 'Cancel voting in District A entirely',
                feedback: 'Voters feel disenfranchised. Trust drops sharply, and turnout in District A collapses. Public outcry follows.',
                turnout: -18, trust: -20, safety: +4
            }
        ]
    },
    {
        title: 'Cyber-Attack on Voter Database',
        severity: '⚠ CRITICAL',
        desc: 'Your tech team detects an unauthorized intrusion attempt on the voter authentication database. No data is stolen yet, but the attack is ongoing.',
        choices: [
            {
                icon: '🛡️',
                label: 'Switch to offline backup ledgers and continue voting',
                feedback: 'Excellent. Offline backups keep elections running. Voters notice nothing. Trust rises as you publicly disclose the foiled attack.',
                turnout: +2, trust: +12, safety: +8
            },
            {
                icon: '🤐',
                label: 'Stay silent, hope the attack is repelled in time',
                feedback: 'A risky gamble. The breach is later leaked by media. Public trust takes a serious hit even though no votes were affected.',
                turnout: -4, trust: -22, safety: -10
            }
        ]
    },
    {
        title: 'Misinformation Spreads on Social Media',
        severity: '⚠ MEDIUM',
        desc: 'A viral post claims (falsely) that EVMs in District B are pre-loaded for one candidate. The post has 2 million views in 3 hours.',
        choices: [
            {
                icon: '📢',
                label: 'Issue rapid public clarification + invite media to inspect EVMs live',
                feedback: 'Transparent and effective. Inspections are live-streamed, the rumor dies down, public confidence is restored.',
                turnout: +4, trust: +14, safety: +2
            },
            {
                icon: '🚫',
                label: 'Demand the platform delete the post without explanation',
                feedback: 'Looks like censorship. The Streisand effect kicks in — the post spreads further, distrust grows.',
                turnout: -2, trust: -15, safety: 0
            }
        ]
    },
    {
        title: 'Heatwave on Polling Day',
        severity: '⚠ HIGH',
        desc: 'Temperatures hit 46°C across the state. Elderly voters are fainting in queues. Reports of long waits and dehydration come from 200+ booths.',
        choices: [
            {
                icon: '🥤',
                label: 'Mobilize relief: water, ORS, fans, priority queue for seniors',
                feedback: 'Compassionate and quick. Turnout among elderly stabilizes. Public sees you as caring and competent.',
                turnout: +5, trust: +10, safety: +6
            },
            {
                icon: '⏳',
                label: 'Keep things running normally — no special measures',
                feedback: 'Several voters collapse. News coverage is brutal. Both turnout and trust drop sharply.',
                turnout: -10, trust: -16, safety: -12
            }
        ]
    }
];