import { PredefinedQuestions } from '@/types/questionnaire';

export const predefinedQuestions: PredefinedQuestions = {
  Admin: [
    {
      id: 'admin-1',
      text: 'How do you ensure organizational accountability across all departments and maintain oversight of strategic objectives?',
      category: 'Accountability',
      role: 'Admin',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'admin-2',
      text: 'What decision-making framework do you use for high-impact strategic choices that affect the entire organization?',
      category: 'Decision-making',
      role: 'Admin',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'admin-3',
      text: 'How do you optimize organizational processes and implement efficiency improvements across multiple departments?',
      category: 'Process efficiency',
      role: 'Admin',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'admin-4',
      text: 'What communication strategies do you employ to ensure alignment between executive leadership and operational teams?',
      category: 'Communication',
      role: 'Admin',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'admin-5',
      text: 'How do you measure and track organizational KPIs to ensure business objectives are being met across all functions?',
      category: 'Role-specific KPIs',
      role: 'Admin',
      isPredefined: true,
      createdAt: new Date().toISOString()
    }
  ],
  HR: [
    {
      id: 'hr-1',
      text: 'How do you ensure compliance with employment laws and maintain accountability for HR policies and procedures?',
      category: 'Accountability',
      role: 'HR',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'hr-2',
      text: 'What criteria do you use when making decisions about employee relations, hiring, and performance management?',
      category: 'Decision-making',
      role: 'HR',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'hr-3',
      text: 'How do you streamline HR processes to improve efficiency in recruitment, onboarding, and employee lifecycle management?',
      category: 'Process efficiency',
      role: 'HR',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'hr-4',
      text: 'What communication strategies do you use to maintain transparency and trust between management and employees?',
      category: 'Communication',
      role: 'HR',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'hr-5',
      text: 'How do you measure HR effectiveness through metrics like employee satisfaction, retention rates, and recruitment success?',
      category: 'Role-specific KPIs',
      role: 'HR',
      isPredefined: true,
      createdAt: new Date().toISOString()
    }
  ],
  Team_Lead: [
    {
      id: 'team-lead-1',
      text: 'How do you hold team members accountable for their deliverables and ensure project milestones are met?',
      category: 'Accountability',
      role: 'Team_Lead',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'team-lead-2',
      text: 'What decision-making process do you follow when prioritizing tasks and allocating resources within your team?',
      category: 'Decision-making',
      role: 'Team_Lead',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'team-lead-3',
      text: 'How do you identify and implement process improvements to enhance team productivity and workflow efficiency?',
      category: 'Process efficiency',
      role: 'Team_Lead',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'team-lead-4',
      text: 'What communication methods do you use to ensure clear expectations and feedback flow within your team?',
      category: 'Communication',
      role: 'Team_Lead',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'team-lead-5',
      text: 'How do you track team performance metrics and ensure individual and collective goals are being achieved?',
      category: 'Role-specific KPIs',
      role: 'Team_Lead',
      isPredefined: true,
      createdAt: new Date().toISOString()
    }
  ],
  Team_Member: [
    {
      id: 'team-member-1',
      text: 'How do you take ownership of your assigned tasks and ensure timely completion of your responsibilities?',
      category: 'Accountability',
      role: 'Team_Member',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'team-member-2',
      text: 'What factors do you consider when making decisions about task prioritization and time management?',
      category: 'Decision-making',
      role: 'Team_Member',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'team-member-3',
      text: 'How do you optimize your daily workflow to maximize productivity and minimize time waste?',
      category: 'Process efficiency',
      role: 'Team_Member',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'team-member-4',
      text: 'How do you communicate progress updates and challenges to your team lead and colleagues?',
      category: 'Communication',
      role: 'Team_Member',
      isPredefined: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'team-member-5',
      text: 'How do you measure your personal performance and track progress toward your individual goals?',
      category: 'Role-specific KPIs',
      role: 'Team_Member',
      isPredefined: true,
      createdAt: new Date().toISOString()
    }
  ]
}; 