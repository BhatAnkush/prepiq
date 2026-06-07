export interface InterviewSession {
  _id?: string;
  userId: string;                    // from NextAuth session
  createdAt: Date;
  status: 'active' | 'completed';
  
  // From JD + resume analysis
  companyName: string;
  roleTitle: string;
  jdText: string;
  resumeText: string;
  analysis: {
    techStack: string[];             // e.g. ["React", "Kafka", "Go"]
    requiredSkills: string[];
    seniorityLevel: string;          // "mid", "senior", "lead"
    interviewSignals: string[];      // e.g. ["system design", "behavioral"]
    candidateGaps: string[];         // skills in JD but not in resume
    candidateStrengths: string[];    // skills in both
  };
  
  // Interview state
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  durationSeconds: number;           // total time taken
}

export interface InterviewQuestion {
  id: string;
  questionText: string;
  category: 'behavioral' | 'technical' | 'system-design' | 'culture-fit';
  difficulty: 'easy' | 'medium' | 'hard';
  targetSkill: string;               // which JD skill this tests
  userAnswer?: string;
  score?: number;                    // 1–10
  feedback?: string;
  modelAnswer?: string;
  timeSpentSeconds?: number;
}export interface InterviewSession {
  _id?: string;
  userId: string;                    // from NextAuth session
  createdAt: Date;
  status: 'active' | 'completed';
  
  // From JD + resume analysis
  companyName: string;
  roleTitle: string;
  jdText: string;
  resumeText: string;
  analysis: {
    techStack: string[];             // e.g. ["React", "Kafka", "Go"]
    requiredSkills: string[];
    seniorityLevel: string;          // "mid", "senior", "lead"
    interviewSignals: string[];      // e.g. ["system design", "behavioral"]
    candidateGaps: string[];         // skills in JD but not in resume
    candidateStrengths: string[];    // skills in both
  };
  
  // Interview state
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  durationSeconds: number;           // total time taken
}

export interface InterviewQuestion {
  id: string;
  questionText: string;
  category: 'behavioral' | 'technical' | 'system-design' | 'culture-fit';
  difficulty: 'easy' | 'medium' | 'hard';
  targetSkill: string;               // which JD skill this tests
  userAnswer?: string;
  score?: number;                    // 1–10
  feedback?: string;
  modelAnswer?: string;
  timeSpentSeconds?: number;
}