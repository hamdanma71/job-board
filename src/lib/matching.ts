/**
 * Advanced Text-Based Matching Engine (V2)
 * Computes a weighted score between 0 and 100 based on Title (50%), Skills (30%), Experience & Location (20%).
 */

export function calculateMatchScore(
  candidate: { skills: string, experienceYears: number, specialization: string | null, location?: string | null }, 
  job: { description: string, title: string, type: string, location: string }
) {
  let score = 0;
  
  const jobTitleLower = job.title.toLowerCase();
  const jobDescLower = job.description.toLowerCase();
  const jobText = jobTitleLower + " " + jobDescLower;
  
  // 1. Title / Specialization Match (Weight: 50%)
  // This is the most important factor. If they are a Software Engineer applying for a Software Engineer role, huge boost.
  let titleScore = 0;
  const spec = candidate.specialization ? candidate.specialization.toLowerCase().trim() : "";
  
  if (spec && jobTitleLower.includes(spec)) {
    titleScore = 100; // Perfect match
  } else if (spec && jobDescLower.includes(spec)) {
    titleScore = 60;  // Mentioned in description
  } else {
    // Attempt fallback to title matching against first few skills
    let candidateSkillsList: string[] = [];
    try {
      const parsed = JSON.parse(candidate.skills || "[]");
      candidateSkillsList = Array.isArray(parsed) ? parsed : [candidate.skills];
    } catch(e) {
      candidateSkillsList = (candidate.skills || "").split(",");
    }

    const validSkills = candidateSkillsList.map(s => s.trim().toLowerCase()).filter(s => s.length > 2);
    if (validSkills.some(s => jobTitleLower.includes(s))) {
        titleScore = 70; // A primary skill is in the title
    }
  }
  score += titleScore * 0.50; // 50% weight

  // 2. Skill Matching (Weight: 30%)
  let candidateSkillsList: string[] = [];
  try {
    const parsed = JSON.parse(candidate.skills || "[]");
    candidateSkillsList = Array.isArray(parsed) ? parsed : [candidate.skills];
  } catch(e) {
    candidateSkillsList = (candidate.skills || "").split(",");
  }
  const validSkills = candidateSkillsList.map(s => s.trim().toLowerCase()).filter(s => s.length > 2);
  
  let matchedSkillsCount = 0;
  for (const skill of validSkills) {
    if (jobText.includes(skill)) {
      matchedSkillsCount++;
    }
  }

  let skillScore = 0;
  if (validSkills.length > 0) {
    const targetMatchCount = Math.min(5, validSkills.length);
    skillScore = Math.min(100, (matchedSkillsCount / targetMatchCount) * 100);
  }
  score += skillScore * 0.30; // 30% weight

  // 3. Experience & Location Match (Weight: 20%)
  // 10% for experience, 10% for location
  let expScore = candidate.experienceYears > 0 ? 100 : 50;
  score += expScore * 0.10; 

  let locationScore = 0;
  if (job.type === "REMOTE") {
    locationScore = 100; // Remote fits everyone
  } else if (candidate.location && job.location.toLowerCase().includes(candidate.location.toLowerCase().split(",")[0])) {
    locationScore = 100; // City match
  } else {
    locationScore = 50; // Different city but maybe willing to relocate
  }
  score += locationScore * 0.10;

  // Cap at 100
  return Math.round(Math.min(100, score));
}
