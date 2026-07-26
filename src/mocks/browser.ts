import { setupWorker } from "msw/browser";
import {
  authHandlers,
  userHandlers,
  courseHandlers,
  gradeHandlers,
  logHandlers,
  announcementHandlers,
  evaluationHandlers,
  classHandlers,
} from "./handlers";

export const worker = setupWorker(
  ...authHandlers,
  ...userHandlers,
  ...courseHandlers,
  ...gradeHandlers,
  ...logHandlers,
  ...announcementHandlers,
  ...evaluationHandlers,
  ...classHandlers,
);
