import { FastifyInstance } from "fastify";
import { verifyJWT } from "../middlewares/verifyJWT";
import {
  createActivity,
  deleteActivity,
  deleteStudentActivity,
  getActivitiesByClassroom,
  getAllClassroomStudentAcivities,
  getAllStudentActivities,
  getStudentActivitiesByClassroom,
  getStudentsSubmissionInClassroom,
  getSubmissionById,
  gradeSubmission,
  listAllSubmissionsByTeacher,
  listSubmissionsByActivity,
  submitActivity,
  updateActivity,
} from "../controllers/activities.controller";

export default async function activitiesRoutes(server: FastifyInstance) {
  server.register(async (privateRoutes) => {
    privateRoutes.addHook("onRequest", verifyJWT);

    // professor -> atividades
    privateRoutes.post("/:classroomId", createActivity);
    privateRoutes.get("/:classroomId/activities", getActivitiesByClassroom);
    privateRoutes.put("/:activityId", updateActivity);
    privateRoutes.delete("/:activityId", deleteActivity);

    // professor -> submissoes de atividades
    privateRoutes.get("/submissions", listAllSubmissionsByTeacher);
    privateRoutes.get("/:activityId/submissions", listSubmissionsByActivity);
    privateRoutes.get("/submission/:submissionId", getSubmissionById);
    privateRoutes.get(
      "/submissions/:classroomId/:studentId",
      getStudentsSubmissionInClassroom
    );
    privateRoutes.patch("/submission/:submissionId/grade", gradeSubmission);

    // alunos -> atividades
    privateRoutes.get(
      "/student/:classroomId/activities",
      getStudentActivitiesByClassroom
    );

    privateRoutes.get("/student", getAllStudentActivities);

    privateRoutes.get("/student/:classroomId", getAllClassroomStudentAcivities);

    privateRoutes.patch("/student/:activityId/submissions", submitActivity);

    privateRoutes.delete(
      "/student/activities/:activityId/submissions",
      deleteStudentActivity
    );
  });
}
