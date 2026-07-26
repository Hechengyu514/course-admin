import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, Descriptions, Empty, Table, Tag } from "antd";
import { useCourseStore } from "@/store/courseStore";
import { useUserStore } from "@/store/userStore";
import { formatTimeSlots } from "@/utils/formatTimeSlots";

const studentColumns = [
  { title: "姓名", dataIndex: "name", key: "name" },
  { title: "学号", dataIndex: "userId", key: "userId" },
  { title: "班级", dataIndex: "className", key: "className" },
];

/**
 * 课程详情页
 *
 * 展示课程基本信息 + 已选学生名单。
 * 学生看不到学生名单，管理员和教师可见。
 */

export default function CourseDetail() {
  const { id } = useParams();
  const courses = useCourseStore((s) => s.courses);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);
  const course = courses.find((c) => c.id === Number(id));
  const currentUser = useUserStore((s) => s.currentUser);
  const users = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    // 仅管理员和教师需要加载用户列表（用于显示学生名单）
    if (currentUser && currentUser.role !== "student") {
      fetchUsers();
    }
  }, [fetchUsers, currentUser]);

  const enrolledStudents = useMemo(
    () => (course ? users.filter((u) => course.studentIds.includes(u.id)) : []),
    [course, users],
  );

  if (!course) {
    return <Empty description="课程不存在" />;
  }

  return (
    <div>
      <Card title={course.name} style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="授课教师">
            {course.teacherName}
          </Descriptions.Item>
          <Descriptions.Item label="学分">{course.credits}</Descriptions.Item>
          <Descriptions.Item label="分类">
            <Tag color="blue">{course.category}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="学期">{course.semester}</Descriptions.Item>
          <Descriptions.Item label="教室">{course.classroom}</Descriptions.Item>
          <Descriptions.Item label="上课时间">
            {formatTimeSlots(course.timeSlots)}
          </Descriptions.Item>
          <Descriptions.Item label="教学周">
            {(() => {
              const weeks = course.timeSlots.map((s) => `${s.startWeek}-${s.endWeek}周`);
              return [...new Set(weeks)].join("、");
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="选课人数">
            {course.enrolledCount} / {course.capacity} 人
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 仅管理员和该课程的授课教师可查看学生名单 */}
      {(currentUser?.role === "admin" || course.teacherId === currentUser?.id) && (
        <Card title="已选学生名单">
          <Table
            columns={studentColumns}
            dataSource={enrolledStudents}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
}
