const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL });

const providers = [
  {
    name: 'NDIS – Transport Supports',
    description: 'The NDIS funds transport supports for participants who cannot use public transport independently. Transport funding is included in Core Supports and can be used with registered providers.',
    type: 'ndis_transport',
    state: 'National',
    phone: '1800 800 110',
    website: 'https://www.ndis.gov.au/participants/using-your-plan/transport',
    email: null,
    is_ndis_registered: true,
    is_wheelchair_accessible: true,
    accepts_companion_card: false,
    is_ndis_transport_funded: true,
    features: JSON.stringify(['door_to_door','trained_driver']),
    approved: true,
  },
  {
    name: 'Cabcharge Accessible Taxis',
    description: 'Australia-wide fleet of wheelchair-accessible taxis bookable via phone, app, or account. Accepts Companion Card and NDIS transport funding in most states.',
    type: 'taxi',
    state: 'National',
    phone: '13 22 27',
    website: 'https://www.cabcharge.com.au',
    email: null,
    is_ndis_registered: false,
    is_wheelchair_accessible: true,
    accepts_companion_card: true,
    is_ndis_transport_funded: true,
    features: JSON.stringify(['ramp','hoist','trained_driver','companion_seat']),
    approved: true,
  },
  {
    name: 'Community Transport NSW',
    description: 'Door-to-door community transport for people with disability and older Australians across NSW. Subsidised fares available. Book in advance for medical and social appointments.',
    type: 'community_transport',
    state: 'NSW',
    phone: '1800 229 452',
    website: 'https://www.facs.nsw.gov.au/providers/community-transport',
    email: null,
    is_ndis_registered: false,
    is_wheelchair_accessible: true,
    accepts_companion_card: true,
    is_ndis_transport_funded: true,
    features: JSON.stringify(['door_to_door','advance_booking','companion_seat','assistance_dogs']),
    approved: true,
  },
  {
    name: 'Transit Systems – AccessBus Victoria',
    description: 'Specialised accessible bus services across metropolitan Melbourne for people with disability and mobility impairment. Hoist-equipped vehicles with trained drivers.',
    type: 'public_transport',
    state: 'VIC',
    phone: '03 8698 3400',
    website: 'https://www.transitsystems.com.au',
    email: null,
    is_ndis_registered: true,
    is_wheelchair_accessible: true,
    accepts_companion_card: true,
    is_ndis_transport_funded: true,
    features: JSON.stringify(['hoist','ramp','trained_driver','advance_booking','companion_seat']),
    approved: true,
  },
  {
    name: 'Mambourin Community Transport',
    description: "Community transport for people with disability in Melbourne's western suburbs. Door-to-door service for health appointments, shopping, and social activities. NDIS registered.",
    type: 'community_transport',
    state: 'VIC',
    phone: '03 9731 5900',
    website: 'https://www.mambourin.org',
    email: null,
    is_ndis_registered: true,
    is_wheelchair_accessible: true,
    accepts_companion_card: true,
    is_ndis_transport_funded: true,
    features: JSON.stringify(['door_to_door','trained_driver','advance_booking','companion_seat','oxygen_friendly']),
    approved: true,
  },
  {
    name: 'DiDi Assist',
    description: "DiDi's accessibility program in Australia. Drivers trained to assist passengers with disability. Wheelchair-accessible vehicles available in major cities through the WAV category.",
    type: 'rideshare',
    state: 'National',
    phone: null,
    website: 'https://www.didiglobal.com/au',
    email: null,
    is_ndis_registered: false,
    is_wheelchair_accessible: true,
    accepts_companion_card: false,
    is_ndis_transport_funded: false,
    features: JSON.stringify(['trained_driver','assistance_dogs']),
    approved: true,
  },
  {
    name: 'Uber Assist & Uber WAV',
    description: 'Uber Assist connects riders with drivers trained to help people with disability. Uber WAV provides wheelchair-accessible vehicles in Sydney, Melbourne, and Brisbane.',
    type: 'rideshare',
    state: 'National',
    phone: null,
    website: 'https://www.uber.com/au/en/ride/uberwav/',
    email: null,
    is_ndis_registered: false,
    is_wheelchair_accessible: true,
    accepts_companion_card: false,
    is_ndis_transport_funded: false,
    features: JSON.stringify(['ramp','trained_driver','assistance_dogs']),
    approved: true,
  },
  {
    name: 'Transdev – Accessible Services QLD',
    description: 'Accessible bus and ferry services across South East Queensland. Low-floor buses and modified timetables for people with disability. Companion Card accepted on all services.',
    type: 'public_transport',
    state: 'QLD',
    phone: '13 12 30',
    website: 'https://www.transdev.com.au',
    email: null,
    is_ndis_registered: false,
    is_wheelchair_accessible: true,
    accepts_companion_card: true,
    is_ndis_transport_funded: false,
    features: JSON.stringify(['ramp','companion_seat','assistance_dogs']),
    approved: true,
  },
  {
    name: 'Dial-a-Ride WA',
    description: 'Subsidised door-to-door transport for people with disability and seniors in Western Australia. Operated by local governments and community organisations with accessible vehicles.',
    type: 'community_transport',
    state: 'WA',
    phone: '08 6551 8700',
    website: 'https://www.transport.wa.gov.au/activetransport/dial-a-ride.asp',
    email: null,
    is_ndis_registered: false,
    is_wheelchair_accessible: true,
    accepts_companion_card: true,
    is_ndis_transport_funded: true,
    features: JSON.stringify(['door_to_door','ramp','advance_booking']),
    approved: true,
  },
  {
    name: 'Ability Transport (SA)',
    description: 'NDIS-registered transport provider in South Australia offering wheelchair-accessible vehicles and trained drivers for appointments, community access, and social activities.',
    type: 'ndis_transport',
    state: 'SA',
    phone: '08 8371 6500',
    website: 'https://www.abilitytransport.com.au',
    email: 'bookings@abilitytransport.com.au',
    is_ndis_registered: true,
    is_wheelchair_accessible: true,
    accepts_companion_card: true,
    is_ndis_transport_funded: true,
    features: JSON.stringify(['hoist','ramp','door_to_door','trained_driver','advance_booking','oxygen_friendly','assistance_dogs']),
    approved: true,
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    const check = await client.query('SELECT COUNT(*) FROM transport_providers');
    if (parseInt(check.rows[0].count) > 0) {
      console.log('Already seeded (' + check.rows[0].count + ' rows). Skipping.');
      return;
    }
    for (const p of providers) {
      await client.query(
        `INSERT INTO transport_providers
         (name, description, type, state, phone, website, email, is_ndis_registered, is_wheelchair_accessible, accepts_companion_card, is_ndis_transport_funded, features, approved, submitted_by_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [p.name, p.description, p.type, p.state, p.phone, p.website, p.email,
         p.is_ndis_registered, p.is_wheelchair_accessible, p.accepts_companion_card,
         p.is_ndis_transport_funded, p.features, p.approved, null]
      );
    }
    console.log('Seeded', providers.length, 'transport providers successfully');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(e => { console.error(e.message); process.exit(1); });
