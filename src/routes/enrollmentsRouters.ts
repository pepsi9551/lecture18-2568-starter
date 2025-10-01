import { Router, type Request, type Response } from "express";
import {
  zCourseId,
  zCoursePostBody,
  zCoursePutBody,
  zStudentId,
} from "../libs/zodValidators.js";

import type { Student, Course } from "../libs/types.js";
import { authenticateToken } from "../middlewares/authenMiddleware.js";
import { checkRoleAdmin } from "../middlewares/checkRoleAdminMiddlewares.js";

// import database
import { courses, enrollments, students } from "../db/db.js";
import { success } from "zod";
import { tr } from "zod/locales";
import { checkRoleStudent, checkRoleSA } from "../middlewares/checkRoleStudentMiddleware.js";
import { token } from "morgan";

const router = Router();

// GET /api/v2/enrollments
router.get("/", authenticateToken, checkRoleAdmin,(req: Request, res: Response) => {
    //เตือนตัวเอง! อย่าลืมใส่ Authen กับ CheckAdmin
  try {
        return res.status(200).json({
            success: true,
            message: "Enrollments Information",
            data: enrollments.map((e) => {
                return {
                    studentId: e.studentId,
                    courses: e.courseId?.map(c => ({courseId: c}))
                }
            })
        })
    }catch(err) {
        return res.status(500).json({
            success: false,
            message: "Something is wrong, please try again",
            error: err,
        });
    }
});
// POST /api/v2/enrollments/reset
router.post("/reset",authenticateToken, checkRoleAdmin, (req: Request, res: Response) => {
    try{
        return res.status(200).json({
            success: true,
            message: "enrollments database has been reset"
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Something is wrong, please try again",
            error: err,
        });
    }
});
// GET /api/v2/enrollments/:studentId for ADMIN
router.get("/:studentId",authenticateToken, checkRoleSA, (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const parseResult = zStudentId.safeParse(studentId);

    if (!parseResult.success) {
      return res.status(403).json({
        message: "Forbidden access",
        errors: parseResult.error.issues[0]?.message,
      });
    }

    const foundIndex = students.findIndex(
      (std: Student) => std.studentId === studentId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Student ${studentId} does not exists`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Student Information",
      data: students[foundIndex],
    });

    

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});


export default router;
