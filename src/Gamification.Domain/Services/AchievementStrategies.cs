using System;
using System.Collections.Generic;
using System.Linq;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Enums;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Services
{
    public class FirstTutoringStrategy : IAchievementStrategy
    {
        public string StrategyKey => "FIRST_TUTORING";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.TutoriaDictada && s.Count >= 1);
        }
    }

    /// <summary>
    /// "Buscador de aventuras": se desbloquea la primera vez que el usuario juega
    /// cualquier mini-juego del Centro de Juegos (al menos un JuegoJugado).
    /// </summary>
    public class FirstGameStrategy : IAchievementStrategy
    {
        public string StrategyKey => "FIRST_GAME";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.JuegoJugado && s.Count >= 1);
        }
    }

    // ── Estudiante: asistencia a tutorías ───────────────────────────────────

    /// <summary>"Primera clase": el estudiante asiste a su primera tutoría.</summary>
    public class FirstLessonAttendedStrategy : IAchievementStrategy
    {
        public string StrategyKey => "FIRST_LESSON_ATTENDED";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.TutoriaCompletada && s.Count >= 1);
        }
    }

    /// <summary>"Aprendiz dedicado": el estudiante asiste a 10 tutorías.</summary>
    public class DedicatedLearnerStrategy : IAchievementStrategy
    {
        public string StrategyKey => "DEDICATED_LEARNER";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.TutoriaCompletada && s.Count >= 10);
        }
    }


    /// <summary>"Primer aporte": el estudiante sube su primer material aprobado.</summary>
    public class FirstMaterialStrategy : IAchievementStrategy
    {
        public string StrategyKey => "FIRST_MATERIAL";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.MaterialAprobado && s.Count >= 1);
        }
    }

    public class ActiveCollaboratorStrategy : IAchievementStrategy
    {
        public string StrategyKey => "ACTIVE_COLLABORATOR";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.MaterialAprobado && s.Count >= 5);
        }
    }

    /// <summary>"Tutor experimentado": el tutor dicta 10 tutorías.</summary>
    public class ExperiencedTutorStrategy : IAchievementStrategy
    {
        public string StrategyKey => "EXPERIENCED_TUTOR";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.TutoriaDictada && s.Count >= 10);
        }
    }

    /// <summary>"Primera reseña": el tutor recibe su primera tutoría calificada.</summary>
    public class FirstRatingStrategy : IAchievementStrategy
    {
        public string StrategyKey => "FIRST_RATING";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.TutoriaCalificada && s.Count >= 1);
        }
    }

    /// <summary>"Centurión": el usuario acumula 100 puntos (cualquier rol).</summary>
    public class Points100Strategy : IAchievementStrategy
    {
        public string StrategyKey => "POINTS_100";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return user.TotalPoints.Value >= 100;
        }
    }

    /// <summary>"Imparable": el usuario acumula 500 puntos (cualquier rol).</summary>
    public class Points500Strategy : IAchievementStrategy
    {
        public string StrategyKey => "POINTS_500";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return user.TotalPoints.Value >= 500;
        }
    }

    public class OutstandingTutorStrategy : IAchievementStrategy
    {
        public string StrategyKey => "OUTSTANDING_TUTOR";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            // Requires 10 ratings of 5 stars.
            // Assuming we track "FiveStarRatings" as an ActionType or similar.
            return stats.Any(s => s.ActionType == ActionType.TutoriaCalificada && s.Count >= 10);
        }
    }

    /// <summary>"Mente inquieta": completa tu primer quiz de práctica.</summary>
    public class FirstQuizStrategy : IAchievementStrategy
    {
        public string StrategyKey => "FIRST_QUIZ";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.QuizCompletado && s.Count >= 1);
        }
    }

    /// <summary>"Maestro del quiz": completa 10 quizzes de práctica.</summary>
    public class QuizMasterStrategy : IAchievementStrategy
    {
        public string StrategyKey => "QUIZ_MASTER";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.QuizCompletado && s.Count >= 10);
        }
    }

    /// <summary>"Primer repaso": completa tu primera sesión de estudio.</summary>
    public class FirstStudyStrategy : IAchievementStrategy
    {
        public string StrategyKey => "FIRST_STUDY";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.SesionEstudio && s.Count >= 1);
        }
    }

    /// <summary>"Estudiante constante": completa 10 sesiones de estudio.</summary>
    public class ConsistentStudentStrategy : IAchievementStrategy
    {
        public string StrategyKey => "CONSISTENT_STUDENT";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.SesionEstudio && s.Count >= 10);
        }
    }

    public class MentorOfMonthStrategy : IAchievementStrategy
    {
        public string StrategyKey => "MENTOR_OF_MONTH";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            // This usually requires global context, but for a strategy on a single user:
            return false; // Typically handled by a periodic job that awards it.
        }
    }

    /// <summary>"La IA ya sabe dónde vives": completar el perfil de IA.</summary>
    public class AiProfileCompletedStrategy : IAchievementStrategy
    {
        public string StrategyKey => "AI_PROFILE_COMPLETED";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.PerfilIACompletado && s.Count >= 1);
        }
    }

    /// <summary>"Perdidasss, andamos perdidasss!": abrir una pregunta del Centro de Ayuda.</summary>
    public class HelpQuestionOpenedStrategy : IAchievementStrategy
    {
        public string StrategyKey => "HELP_QUESTION_OPENED";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.AyudaPreguntaAbierta && s.Count >= 1);
        }
    }

    /// <summary>"Hasta que la muerte los separe": completar la información de carrera.</summary>
    public class CareerInfoCompletedStrategy : IAchievementStrategy
    {
        public string StrategyKey => "CAREER_INFO_COMPLETED";

        public bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context)
        {
            return stats.Any(s => s.ActionType == ActionType.CarreraInfoCompletada && s.Count >= 1);
        }
    }
}
