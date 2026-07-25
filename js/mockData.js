/* ==========================================================================
   StudyOS — Initial Mock Data Store
   ========================================================================== */

export const initialStudentData = {
  profile: {
    name: "Aarav Sharma",
    grade: "Class 12 — PCM & CS",
    targetScore: 92,
    studyGoalHours: 6.5,
    streakDays: 14
  },
  
  subjects: [
    { id: "physics", name: "Physics", teacher: "Dr. Verma", target: 90, currentAvg: 68, isWeak: true, color: "#f43f5e" },
    { id: "maths", name: "Mathematics", teacher: "Prof. Gupta", target: 95, currentAvg: 88, isWeak: false, color: "#6366f1" },
    { id: "chemistry", name: "Chemistry", teacher: "Mrs. Kapoor", target: 90, currentAvg: 72, isWeak: true, color: "#f59e0b" },
    { id: "cs", name: "Computer Science", teacher: "Mr. Mehta", target: 98, currentAvg: 94, isWeak: false, color: "#10b981" },
    { id: "english", name: "English", teacher: "Mrs. Ray", target: 85, currentAvg: 82, isWeak: false, color: "#06b6d4" }
  ],
  
  schedule: [
    { id: "s1", time: "08:00 AM - 02:00 PM", title: "DPS School Classes", category: "school", tag: "School", detail: "Physics Lab, Calculus, Physical Chem" },
    { id: "s2", time: "03:30 PM - 05:30 PM", title: "ALLEN Coaching Class", category: "coaching", tag: "Coaching", detail: "Rotational Dynamics & Electrostatics" },
    { id: "s3", time: "06:00 PM - 07:15 PM", title: "AI Study Slot: Physics Weak Area", category: "revision", tag: "AI Revision", detail: "Solve 15 Numerical Problems on Optics (Targeted)" },
    { id: "s4", time: "07:30 PM - 08:45 PM", title: "Maths Integration Homework", category: "homework", tag: "Homework", detail: "Ex 7.4 Definite Integrals Q1 - Q20" },
    { id: "s5", time: "09:15 PM - 10:30 PM", title: "Chemistry Organic Revision", category: "study", tag: "Self Study", detail: "Aldehydes & Ketones Reaction Mechanisms" }
  ],
  
  tasks: [
    { id: "t1", title: "Complete Physics Lab Journal (Optics Experiments)", subject: "Physics", priority: "high", dueDate: "Tomorrow", completed: false },
    { id: "t2", title: "Maths Ex 7.4 Definite Integration Solutions", subject: "Mathematics", priority: "high", dueDate: "25 Jul", completed: true },
    { id: "t3", title: "Chemistry Reaction Mechanisms Notes", subject: "Chemistry", priority: "medium", dueDate: "26 Jul", completed: false },
    { id: "t4", title: "CS Python Data Structures Assignment", subject: "Computer Science", priority: "low", dueDate: "28 Jul", completed: false },
    { id: "t5", title: "English Essay Draft on Modern Literature", subject: "English", priority: "medium", dueDate: "29 Jul", completed: true }
  ],
  
  exams: [
    { id: "e1", examName: "Unit Test 1", subject: "Physics", scored: 68, total: 100, date: "2026-07-10" },
    { id: "e2", examName: "Unit Test 1", subject: "Mathematics", scored: 88, total: 100, date: "2026-07-12" },
    { id: "e3", examName: "Unit Test 1", subject: "Chemistry", scored: 72, total: 100, date: "2026-07-14" },
    { id: "e4", examName: "Unit Test 1", subject: "Computer Science", scored: 94, total: 100, date: "2026-07-16" },
    { id: "e5", examName: "Weekly Coaching Test", subject: "Physics", scored: 65, total: 100, date: "2026-07-20" },
    { id: "e6", examName: "Weekly Coaching Test", subject: "Mathematics", scored: 91, total: 100, date: "2026-07-22" }
  ],
  
  timerLogs: [
    { id: "tl1", subject: "Physics", durationMins: 45, date: "2026-07-24" },
    { id: "tl2", subject: "Mathematics", durationMins: 60, date: "2026-07-24" },
    { id: "tl3", subject: "Chemistry", durationMins: 30, date: "2026-07-23" }
  ]
};
