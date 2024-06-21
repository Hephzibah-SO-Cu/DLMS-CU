<template>
  <div v-if="course" class="space-y-4">
    <section class="space-y-3">
      <Back to="/student/courses"/>

      <div class="space-y-1">
        <CustomHeader :title="course?.title">
          <div class="flex gap-4">
            <UButton
              v-if="!isEnrolled"
              :loading
              @click="enrollCourse"
              label="Enroll"
            />
            <UButton
              :loading
              color="rose"
              v-if="isEnrolled"
              @click="unenrollCourse"
              label="UnEnroll"
            />
          </div>
        </CustomHeader>
        <p class="text-md">{{ course.description }}</p>
      </div>
      <div>
        <span class="text-sm text-gray-400">Instructor</span>
        <div v-if="loadingInstructor" class="text-center block">
          <span> Loading... </span>
        </div>
        <div v-else>
          <div v-if="instructor" class="capitalize lg:text-3xl font-semibold">
            <p>
              {{ instructor.name }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <UTabs :items="items">
      <template #assessment="{ item }">
        <Assessment
          :course-id="course.id!"
          :course-title="course.title"
          role="student"
          :isEnrolled
        />
      </template>

      <template #resources="{ item }">
        <CourseResourses
          :course="course"
          :resources="resources"
          :pending="loadingResources"
          role="student"
          :isEnrolled
        />
      </template>

      <template #assignment="{ item }">
        <Assignment
          :course="course"
          :resources="resources"
          :pending="loadingResources"
          role="student"
          :isEnrolled
        />
      </template>
    </UTabs>
  </div>
  <Loading v-model:model-value="loading" />
</template>

<script lang="ts" setup>
import {
  query,
  collection,
  orderBy,
  getDocs,
  where,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import type { Course, CourseResource, EnrolledCourse, User } from "~/types";

const route = useRoute();
const user = useCurrentUser();
const db = useFirestore();
const notification = useNotification();

const items = [
  {
    slot: "resources",
    label: "Resources",
  },
  {
    slot: "assessment",
    label: "Assessment",
  },
  {
    slot: "assignment",
    label: "Assignment",
  },
];

if (!user) {
  navigateTo("/login");
}
const id = route.params.id as string;
const loading = ref(false);
const courseRef = doc(db, "courses", id);
const course = ref<Course | null>(null);
const loadingInstructor = ref(false);
const loadingResources = ref(false);
try {
  const docSnap = await getDoc(courseRef);

  if (docSnap.exists()) {
    course.value = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Course;
  } else {
    console.log("No such document!");
  }
} catch (err) {
  console.error("Error getting document:", err);
}

const instructor = ref<User | null>(null);
const resources = ref<CourseResource[]>([]);
const isEnrolled = ref(false);

const fetchInstructor = async () => {
  try {
    loadingInstructor.value = true;
    if (course.value) {
      const instructorRef = doc(db, "users", course.value.instructorId);
      const docSnap = await getDoc(instructorRef);

      if (docSnap.exists()) {
        instructor.value = {
          id: docSnap.id,
          ...docSnap.data(),
        } as User;
      } else {
        console.log("No such document!");
      }
    }
  } catch (err) {
    console.error("Error getting document:", err);
  } finally {
    loadingInstructor.value = false;
  }
};
const fetchCourseResources = async () => {
  try {
    loadingResources.value = true;

    if (course.value) {
      const courseResourcesCollection = collection(db, "courseresources");
      const q = query(
        courseResourcesCollection,
        where("instructorId", "==", course.value.instructorId),
        where("courseId", "==", course.value.id),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const courseResources = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CourseResource[];

      resources.value = courseResources;
    }
  } catch (err) {
    console.error("Error getting documents: ", err);
  } finally {
    loadingResources.value = false;
  }
};

const checkEnrollment = async () => {
  if (user.value?.uid && course.value?.id) {
    const courseDocRef = doc(db, "enrolledcourses", course.value.id);
    const courseDoc = await getDoc(courseDocRef);

    if (courseDoc.exists()) {
      const enrolledCourse = courseDoc.data() as EnrolledCourse;
      isEnrolled.value = enrolledCourse.students.some(
        (student) => student.studentId === user.value?.uid
      );
    } else {
      isEnrolled.value = false;
    }
  }
};


async function enrollCourse() {
  if (!user.value) {
    notification({
      title: "Not Logged in",
      description:
        "You need to have an account before you can enroll to the course",
      id: "warn",
      type: "warning",
    });
    return;
  }
  try {
    if (course.value?.id && user.value?.uid) {
      const courseId = course.value.id;
      const courseTitle = course.value.title;
      const instructorId = course.value.instructorId;
      const studentId = user.value.uid;
      const enrolledAt = new Date().toISOString();
      loading.value = true;
      const courseDocRef = doc(db, "enrolledcourses", courseId);
      const courseDoc = await getDoc(courseDocRef);

      if (courseDoc.exists()) {
        // Update existing document
        await updateDoc(courseDocRef, {
          studentIds: [...courseDoc.data().studentIds, studentId],
          students: [...courseDoc.data().students, { studentId, enrolledAt }],
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new document
        const data: EnrolledCourse = {
          title: courseTitle,
          courseId: courseId,
          studentIds: [studentId],
          students: [{ studentId, enrolledAt }],
          instructorId: instructorId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(courseDocRef, data);
      }
      notification({
        title: "Success",
        description: "You have successfully enrolled in the course",
        id: "enroll-success",
      });
    }
    // Call the function to check enrollment
    await checkEnrollment();
  } catch (error) {
    console.log(error);

    notification({
      title: "Error",
      description: "An error occurred while enrolling in the course",
      type: "error",
      id: "enroll-error",
    });
  } finally {
    loading.value = false;
  }
}

async function unenrollCourse() {
  try {
    if (course.value?.id && user.value?.uid) {
      const courseId = course.value.id;
      const studentId = user.value.uid;
      loading.value = true;
      const courseDocRef = doc(db, "enrolledcourses", courseId);
      const courseDoc = await getDoc(courseDocRef);

      if (courseDoc.exists()) {
        // Update existing document
        const studentIds = courseDoc
          .data()
          .studentIds.filter((id: string) => id !== studentId);
        const students = courseDoc
          .data()
          .students.filter(
            (student: { studentId: string; enrolledAt: string }) =>
              student.studentId !== studentId
          );
        await updateDoc(courseDocRef, {
          studentIds: studentIds,
          students: students,
          updatedAt: new Date().toISOString(),
        });
        notification({
          title: "Success",
          description: "You have successfully unenrolled from the course",
          id: "unenroll-success",
        });
      } else {
        notification({
          title: "Error",
          description: "You are not enrolled in this course",
          type: "error",
          id: "unenroll-error",
        });
      }
    }
    // Call the function to check enrollment
    await checkEnrollment();
  } catch (error) {
    notification({
      title: "Error",
      description: "An error occurred while unenrolling from the course",
      type: "error",
      id: "unenroll-error",
    });
  } finally {
    loading.value = false;
  }
}
// Call the function to check enrollment
await checkEnrollment();
await fetchInstructor();
await fetchCourseResources();
</script>

<style></style>
