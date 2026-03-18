import { Meeting } from './MeetingList';

export const sampleMeetings: Meeting[] = [
  // Today's meetings
  {
    id: 'today-1',
    subject: 'Daily Standup',
    description: 'Daily team synchronization meeting to discuss progress, blockers, and plan for the day.',
    status: 'In Progress' as const,
    date: new Date(),
    startTime: '09:00',
    endTime: '09:30',
    attendees: [
      { id: 'att-today-1-1', name: 'Team Lead', email: 'lead@company.com', phone: '+1-555-0001' }
    ],
    clientCompany: 'Internal Team',
    deal: 'Project Management',
    createDate: new Date(),
    readiness: 100
  },
  {
    id: 'today-2',
    subject: 'Client Presentation',
    description: 'Comprehensive presentation of our solution to potential client, including product demo and pricing discussion.',
    status: 'Draft' as const,
    date: new Date(),
    startTime: '14:00',
    endTime: '15:30',
    attendees: [
      { id: 'att-today-2-1', name: 'John Client', email: 'john@client.com', phone: '+1-555-0002' },
      { id: 'att-today-2-2', name: 'Jane Manager', email: 'jane@client.com', phone: '+1-555-0003' },
      { id: 'att-today-2-3', name: 'Test T', email: 'test@client.com', phone: '+1-555-0004' }
    ],
    clientCompany: 'Client Corp',
    deal: 'New Partnership',
    createDate: new Date(Date.now() - 86400000), // Yesterday
    readiness: 85
  },
  {
    id: 'today-3',
    subject: 'Team Retrospective',
    description: 'Sprint retrospective meeting to review what went well, what could be improved, and action items for next sprint.',
    status: 'In Progress' as const,
    date: new Date(),
    startTime: '16:00',
    endTime: '17:00',
    attendees: [
      { id: 'att-today-3-1', name: 'Development Team', email: 'dev@company.com', phone: '+1-555-0004' }
    ],
    clientCompany: 'Internal Team',
    deal: 'Process Improvement',
    createDate: new Date(Date.now() - 172800000), // 2 days ago
    readiness: 90
  },
  // Tomorrow's meetings
  {
    id: 'tomorrow-1',
    subject: 'Product Demo',
    description: 'Live demonstration of our product features and capabilities to prospective client.',
    status: 'Draft' as const,
    date: new Date(Date.now() + 86400000), // Tomorrow
    startTime: '10:00',
    endTime: '11:00',
    attendees: [
      { id: 'att-tomorrow-1-1', name: 'Product Manager', email: 'pm@company.com', phone: '+1-555-0005' }
    ],
    clientCompany: 'Prospect Inc',
    deal: 'Software License',
    createDate: new Date(),
    readiness: 75
  },
  {
    id: '1',
    subject: 'Q4 Strategy Review',
    description: 'Comprehensive review of our Q4 business strategy, including market analysis, competitive positioning, and growth opportunities.',
    status: 'Draft' as const,
    date: new Date('2025-01-15'),
    startTime: '09:00',
    endTime: '10:30',
    attendees: [
      { id: 'att-1-1', name: 'John Smith', email: 'john.smith@acme.com', phone: '+1-555-0101' },
      { id: 'att-1-2', name: 'Sarah Johnson', email: 'sarah.j@acme.com', phone: '+1-555-0102' }
    ],
    clientCompany: 'Acme Corp',
    deal: 'Enterprise Software License',
    createDate: new Date('2025-01-10'),
    readiness: 80
  },
  {
    id: '2',
    subject: 'Product Demo',
    description: 'Technical demonstration of cloud migration capabilities and implementation roadmap.',
    status: 'In Progress' as const,
    date: new Date('2025-01-15'),
    startTime: '14:00',
    endTime: '15:00',
    attendees: [
      { id: 'att-2-1', name: 'Mike Wilson', email: 'mike.w@techco.com', phone: '+1-555-0201' }
    ],
    clientCompany: 'TechCo Solutions',
    deal: 'Cloud Migration Project',
    createDate: new Date('2025-01-12'),
    readiness: 60
  },
  {
    id: '3',
    subject: 'Contract Negotiation',
    description: 'Final contract terms discussion and negotiation for API integration services project.',
    status: 'Completed' as const,
    date: new Date('2025-01-16'),
    startTime: '11:00',
    endTime: '12:30',
    attendees: [
      { id: 'att-3-1', name: 'Lisa Chen', email: 'lisa.chen@innovate.com', phone: '+1-555-0301' },
      { id: 'att-3-2', name: 'David Brown', email: 'david.b@innovate.com', phone: '+1-555-0302' }
    ],
    clientCompany: 'Innovate Inc',
    deal: 'API Integration Services',
    createDate: new Date('2025-01-11'),
    readiness: 90
  },
  {
    id: '4',
    subject: 'Weekly Sync',
    description: 'Weekly synchronization meeting to discuss project progress and upcoming milestones.',
    status: 'Draft' as const,
    date: new Date('2025-01-17'),
    startTime: '10:00',
    endTime: '11:00',
    attendees: [
      { id: 'att-4-1', name: 'Emma Davis', email: 'emma.d@startup.io', phone: '+1-555-0401' }
    ],
    clientCompany: 'Startup.io',
    deal: 'SaaS Subscription',
    createDate: new Date('2025-01-13'),
    readiness: 40
  },
  {
    id: '5',
    subject: 'Technical Review',
    description: 'Technical architecture review and code quality assessment for custom development project.',
    status: 'In Progress' as const,
    date: new Date('2025-01-18'),
    startTime: '15:30',
    endTime: '17:00',
    attendees: [
      { id: 'att-5-1', name: 'Alex Rodriguez', email: 'alex.r@bigcorp.com', phone: '+1-555-0501' },
      { id: 'att-5-2', name: 'Jennifer Lee', email: 'jen.lee@bigcorp.com', phone: '+1-555-0502' }
    ],
    clientCompany: 'BigCorp Industries',
    deal: 'Custom Development',
    createDate: new Date('2025-01-14'),
    readiness: 70
  },
  {
    id: '6',
    subject: 'Stakeholder Presentation',
    description: 'Comprehensive presentation to key stakeholders about digital transformation progress and future roadmap.',
    status: 'Scheduled' as const,
    date: new Date('2025-01-20'),
    startTime: '13:00',
    endTime: '14:30',
    attendees: [
      { id: 'att-6-1', name: 'Robert Taylor', email: 'rob.t@global.com', phone: '+1-555-0601' },
      { id: 'att-6-2', name: 'Maria Garcia', email: 'maria.g@global.com', phone: '+1-555-0602' },
      { id: 'att-6-3', name: 'Tom Anderson', email: 'tom.a@global.com', phone: '+1-555-0603' }
    ],
    clientCompany: 'Global Enterprises',
    deal: 'Digital Transformation',
    createDate: new Date('2025-01-15'),
    readiness: 100
  },
  {
    id: '7',
    subject: 'Requirements Gathering',
    description: 'Initial requirements gathering session for marketing automation system implementation.',
    status: 'Draft' as const,
    date: new Date('2025-01-21'),
    startTime: '09:30',
    endTime: '11:00',
    attendees: [
      { id: 'att-7-1', name: 'Kevin White', email: 'kevin.w@fastgrow.com', phone: '+1-555-0701' }
    ],
    clientCompany: 'FastGrow LLC',
    deal: 'Marketing Automation',
    createDate: new Date('2025-01-16'),
    readiness: 20
  },
  {
    id: '8',
    subject: 'Budget Discussion',
    description: 'Budget allocation and cost analysis discussion for compliance software development project.',
    status: 'In Progress' as const,
    date: new Date('2025-01-22'),
    startTime: '16:00',
    endTime: '17:30',
    attendees: [
      { id: 'att-8-1', name: 'Amanda Clark', email: 'amanda.c@finance.org', phone: '+1-555-0801' },
      { id: 'att-8-2', name: 'Chris Miller', email: 'chris.m@finance.org', phone: '+1-555-0802' }
    ],
    clientCompany: 'Finance Solutions',
    deal: 'Compliance Software',
    createDate: new Date('2025-01-17'),
    readiness: 50
  },
  {
    id: '9',
    subject: 'Project Kickoff',
    description: 'Official project kickoff meeting for e-commerce platform development with key stakeholders.',
    status: 'Scheduled' as const,
    date: new Date('2025-01-23'),
    startTime: '10:30',
    endTime: '12:00',
    attendees: [
      { id: 'att-9-1', name: 'Steve Johnson', email: 'steve.j@retail.com', phone: '+1-555-0901' },
      { id: 'att-9-2', name: 'Nancy Wilson', email: 'nancy.w@retail.com', phone: '+1-555-0902' }
    ],
    clientCompany: 'Retail Chain Co',
    deal: 'E-commerce Platform',
    createDate: new Date('2025-01-18'),
    readiness: 75
  },
  {
    id: '10',
    subject: 'Security Assessment',
    description: 'Comprehensive cybersecurity audit and vulnerability assessment for enterprise systems.',
    status: 'In Progress' as const,
    date: new Date('2025-01-24'),
    startTime: '14:30',
    endTime: '16:00',
    attendees: [
      { id: 'att-10-1', name: 'Patricia Moore', email: 'pat.m@secure.net', phone: '+1-555-1001' }
    ],
    clientCompany: 'SecureNet Corp',
    deal: 'Cybersecurity Audit',
    createDate: new Date('2025-01-19'),
    readiness: 85
  },
  {
    id: '11',
    subject: 'Training Session',
    description: 'User training session for learning management system implementation and best practices.',
    status: 'Scheduled' as const,
    date: new Date('2025-01-25'),
    startTime: '11:30',
    endTime: '13:00',
    attendees: [
      { id: 'att-11-1', name: 'Mark Thompson', email: 'mark.t@edu.org', phone: '+1-555-1101' },
      { id: 'att-11-2', name: 'Rachel Green', email: 'rachel.g@edu.org', phone: '+1-555-1102' }
    ],
    clientCompany: 'Education First',
    deal: 'Learning Management System',
    createDate: new Date('2025-01-20'),
    readiness: 65
  },
  {
    id: '12',
    subject: 'Quarterly Review',
    description: 'Quarterly business review meeting to assess patient management software performance and metrics.',
    status: 'Completed' as const,
    date: new Date('2025-01-27'),
    startTime: '09:00',
    endTime: '10:30',
    attendees: [
      { id: 'att-12-1', name: 'Brian Lee', email: 'brian.l@health.com', phone: '+1-555-1201' },
      { id: 'att-12-2', name: 'Susan Davis', email: 'susan.d@health.com', phone: '+1-555-1202' }
    ],
    clientCompany: 'HealthTech Systems',
    deal: 'Patient Management Software',
    createDate: new Date('2025-01-21'),
    readiness: 95
  },
  {
    id: '13',
    subject: 'Feature Planning',
    description: 'Feature planning and roadmap discussion for mobile app development project next phase.',
    status: 'Draft' as const,
    date: new Date('2025-01-28'),
    startTime: '15:00',
    endTime: '16:30',
    attendees: [
      { id: 'att-13-1', name: 'Daniel Kim', email: 'daniel.k@mobile.app', phone: '+1-555-1301' }
    ],
    clientCompany: 'MobileApp Studios',
    deal: 'Mobile App Development',
    createDate: new Date('2025-01-22'),
    readiness: 30
  },
  {
    id: '14',
    subject: 'Integration Testing',
    description: 'Integration testing session for supply chain software with existing enterprise systems.',
    status: 'In Progress' as const,
    date: new Date('2025-01-29'),
    startTime: '13:30',
    endTime: '15:00',
    attendees: [
      { id: 'att-14-1', name: 'Michelle Brown', email: 'michelle.b@logistics.co', phone: '+1-555-1401' },
      { id: 'att-14-2', name: 'Ryan Wilson', email: 'ryan.w@logistics.co', phone: '+1-555-1402' }
    ],
    clientCompany: 'Logistics Co',
    deal: 'Supply Chain Software',
    createDate: new Date('2025-01-23'),
    readiness: 55
  },
  {
    id: '15',
    subject: 'Go-Live Planning',
    description: 'Go-live planning and deployment strategy meeting for ERP implementation project.',
    status: 'Scheduled' as const,
    date: new Date('2025-01-30'),
    startTime: '10:00',
    endTime: '11:30',
    attendees: [
      { id: 'att-15-1', name: 'Gary Martinez', email: 'gary.m@manufacturing.com', phone: '+1-555-1501' },
      { id: 'att-15-2', name: 'Helen Taylor', email: 'helen.t@manufacturing.com', phone: '+1-555-1502' }
    ],
    clientCompany: 'Manufacturing Plus',
    deal: 'ERP Implementation',
    createDate: new Date('2025-01-24'),
    readiness: 88
  },
  // Additional meetings for February
  {
    id: '16',
    subject: 'Discovery Workshop',
    date: new Date('2025-02-03'),
    startTime: '09:00',
    endTime: '12:00',
    attendees: [
      { id: 'att-16-1', name: 'Peter Parker', email: 'peter.p@webdev.com', phone: '+1-555-1601' },
      { id: 'att-16-2', name: 'Mary Jane', email: 'mary.j@webdev.com', phone: '+1-555-1602' }
    ],
    clientCompany: 'WebDev Agency',
    deal: 'Website Redesign',
    createDate: new Date('2025-01-25'),
    readiness: 25
  },
  {
    id: '17',
    subject: 'Architecture Review',
    date: new Date('2025-02-05'),
    startTime: '14:00',
    endTime: '16:00',
    attendees: [
      { id: 'att-17-1', name: 'Tony Stark', email: 'tony.s@tech.industries', phone: '+1-555-1701' }
    ],
    clientCompany: 'Tech Industries',
    deal: 'AI Platform Development',
    createDate: new Date('2025-01-26'),
    readiness: 72
  },
  {
    id: '18',
    subject: 'User Testing Session',
    date: new Date('2025-02-07'),
    startTime: '11:00',
    endTime: '12:30',
    attendees: [
      { id: 'att-18-1', name: 'Bruce Wayne', email: 'bruce.w@gotham.corp', phone: '+1-555-1801' },
      { id: 'att-18-2', name: 'Alfred Pennyworth', email: 'alfred.p@gotham.corp', phone: '+1-555-1802' }
    ],
    clientCompany: 'Gotham Corp',
    deal: 'Security Management System',
    createDate: new Date('2025-01-27'),
    readiness: 60
  },
  {
    id: '19',
    subject: 'Performance Optimization',
    date: new Date('2025-02-10'),
    startTime: '10:30',
    endTime: '12:00',
    attendees: [
      { id: 'att-19-1', name: 'Clark Kent', email: 'clark.k@daily.planet', phone: '+1-555-1901' }
    ],
    clientCompany: 'Daily Planet Media',
    deal: 'CMS Upgrade',
    createDate: new Date('2025-01-28'),
    readiness: 45
  },
  {
    id: '20',
    subject: 'Data Migration Planning',
    date: new Date('2025-02-12'),
    startTime: '15:30',
    endTime: '17:00',
    attendees: [
      { id: 'att-20-1', name: 'Diana Prince', email: 'diana.p@justice.org', phone: '+1-555-2001' },
      { id: 'att-20-2', name: 'Barry Allen', email: 'barry.a@justice.org', phone: '+1-555-2002' }
    ],
    clientCompany: 'Justice Organization',
    deal: 'Database Modernization',
    createDate: new Date('2025-01-29'),
    readiness: 78
  },
  // More meetings for different dates
  {
    id: '21',
    subject: 'API Development Review',
    date: new Date('2025-02-14'),
    startTime: '09:30',
    endTime: '10:30',
    attendees: [
      { id: 'att-21-1', name: 'Hal Jordan', email: 'hal.j@green.corp', phone: '+1-555-2101' }
    ],
    clientCompany: 'Green Corp',
    deal: 'Third-party Integrations',
    createDate: new Date('2025-01-30'),
    readiness: 82
  },
  {
    id: '22',
    subject: 'Mobile App Testing',
    date: new Date('2025-02-17'),
    startTime: '13:00',
    endTime: '14:30',
    attendees: [
      { id: 'att-22-1', name: 'Arthur Curry', email: 'arthur.c@ocean.tech', phone: '+1-555-2201' },
      { id: 'att-22-2', name: 'Mera Atlantis', email: 'mera.a@ocean.tech', phone: '+1-555-2202' }
    ],
    clientCompany: 'Ocean Tech',
    deal: 'Maritime Logistics App',
    createDate: new Date('2025-02-01'),
    readiness: 35
  },
  {
    id: '23',
    subject: 'Security Audit',
    date: new Date('2025-02-19'),
    startTime: '10:00',
    endTime: '11:30',
    attendees: [
      { id: 'att-23-1', name: 'Victor Stone', email: 'victor.s@cyber.net', phone: '+1-555-2301' }
    ],
    clientCompany: 'CyberNet Security',
    deal: 'Penetration Testing',
    createDate: new Date('2025-02-02'),
    readiness: 92
  },
  {
    id: '24',
    subject: 'Cloud Migration Phase 2',
    date: new Date('2025-02-21'),
    startTime: '14:30',
    endTime: '16:00',
    attendees: [
      { id: 'att-24-1', name: 'Shazam Billy', email: 'billy.b@lightning.com', phone: '+1-555-2401' },
      { id: 'att-24-2', name: 'Freddy Freeman', email: 'freddy.f@lightning.com', phone: '+1-555-2402' }
    ],
    clientCompany: 'Lightning Computing',
    deal: 'Cloud Infrastructure',
    createDate: new Date('2025-02-03'),
    readiness: 67
  },
  {
    id: '25',
    subject: 'Compliance Review',
    date: new Date('2025-02-24'),
    startTime: '11:30',
    endTime: '13:00',
    attendees: [
      { id: 'att-25-1', name: 'Oliver Queen', email: 'oliver.q@arrow.industries', phone: '+1-555-2501' },
      { id: 'att-25-2', name: 'Felicity Smoak', email: 'felicity.s@arrow.industries', phone: '+1-555-2502' }
    ],
    clientCompany: 'Arrow Industries',
    deal: 'Regulatory Compliance Platform',
    createDate: new Date('2025-02-04'),
    readiness: 58
  },
  {
    id: '26',
    subject: 'UX Design Workshop',
    date: new Date('2025-02-26'),
    startTime: '09:00',
    endTime: '12:00',
    attendees: [
      { id: 'att-26-1', name: 'Cisco Ramon', email: 'cisco.r@vibe.design', phone: '+1-555-2601' },
      { id: 'att-26-2', name: 'Caitlin Snow', email: 'caitlin.s@vibe.design', phone: '+1-555-2602' }
    ],
    clientCompany: 'Vibe Design Studio',
    deal: 'User Experience Redesign',
    createDate: new Date('2025-02-05'),
    readiness: 41
  },
  {
    id: '27',
    subject: 'DevOps Implementation',
    date: new Date('2025-02-28'),
    startTime: '15:00',
    endTime: '16:30',
    attendees: [
      { id: 'att-27-1', name: 'Ray Palmer', email: 'ray.p@atom.tech', phone: '+1-555-2701' }
    ],
    clientCompany: 'Atom Technologies',
    deal: 'CI/CD Pipeline Setup',
    createDate: new Date('2025-02-06'),
    readiness: 73
  },
  // March meetings
  {
    id: '28',
    subject: 'Blockchain Integration',
    date: new Date('2025-03-03'),
    startTime: '10:00',
    endTime: '11:30',
    attendees: [
      { id: 'att-28-1', name: 'Jefferson Pierce', email: 'jeff.p@black.lightning', phone: '+1-555-2801' },
      { id: 'att-28-2', name: 'Anissa Pierce', email: 'anissa.p@black.lightning', phone: '+1-555-2802' }
    ],
    clientCompany: 'Black Lightning Fintech',
    deal: 'Cryptocurrency Platform',
    createDate: new Date('2025-02-07'),
    readiness: 29
  },
  {
    id: '29',
    subject: 'Machine Learning Model Training',
    date: new Date('2025-03-05'),
    startTime: '13:30',
    endTime: '15:00',
    attendees: [
      { id: 'att-29-1', name: 'Kate Kane', email: 'kate.k@bat.industries', phone: '+1-555-2901' }
    ],
    clientCompany: 'Bat Industries',
    deal: 'AI Analytics Platform',
    createDate: new Date('2025-02-08'),
    readiness: 86
  },
  {
    id: '30',
    subject: 'Final Deployment',
    date: new Date('2025-03-07'),
    startTime: '16:00',
    endTime: '17:30',
    attendees: [
      { id: 'att-30-1', name: 'Ryan Choi', email: 'ryan.c@atom.labs', phone: '+1-555-3001' },
      { id: 'att-30-2', name: 'Sarah Palmer', email: 'sarah.p@atom.labs', phone: '+1-555-3002' }
    ],
    clientCompany: 'AtomLabs Research',
    deal: 'Research Data Platform',
    createDate: new Date('2025-02-09'),
    readiness: 100
  },
  {
    id: '31',
    subject: 'Post-Launch Support Planning',
    date: new Date('2025-03-10'),
    startTime: '09:30',
    endTime: '11:00',
    attendees: [
      { id: 'att-31-1', name: 'Kara Danvers', email: 'kara.d@super.corp', phone: '+1-555-3101' },
      { id: 'att-31-2', name: 'Alex Danvers', email: 'alex.d@super.corp', phone: '+1-555-3102' }
    ],
    clientCompany: 'Super Corp',
    deal: 'Enterprise Resource Planning',
    createDate: new Date('2025-02-10'),
    readiness: 48
  },
  {
    id: '32',
    subject: 'Customer Feedback Session',
    date: new Date('2025-03-12'),
    startTime: '14:00',
    endTime: '15:30',
    attendees: [
      { id: 'att-32-1', name: 'Sara Lance', email: 'sara.l@legends.co', phone: '+1-555-3201' },
      { id: 'att-32-2', name: 'Ava Sharpe', email: 'ava.s@legends.co', phone: '+1-555-3202' }
    ],
    clientCompany: 'Legends Co',
    deal: 'Time Management Software',
    createDate: new Date('2025-02-11'),
    readiness: 64
  }
];