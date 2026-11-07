import type { Course, CourseLesson, Enrolment } from '../types/courses';

/** SAMPLE courses and learners (D197, D200). Fictional and flagged `sample`. */

const ago = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

const lesson = (id: string, title: string, kind: CourseLesson['kind'], minutes: number, extra: Partial<CourseLesson> = {}): CourseLesson => ({
  id,
  title,
  kind,
  videoUrl: '',
  body: '',
  fileName: '',
  fileSizeBytes: 0,
  questions: [],
  minutes,
  preview: false,
  ...extra,
});

export const SAMPLE_COURSE_ID = 'crs_sample_wrap';

export const sampleCourses = (): Course[] => [
  {
    id: SAMPLE_COURSE_ID,
    title: 'Sew your first wrap blouse (sample)',
    subtitle: 'A beginner’s course from cutting the pattern to the final press.',
    description: 'Short lessons you can follow on a phone beside your machine. Works with the Wrap blouse sewing pattern from the shop.',
    outcomes: 'Cut a pattern to your size\nSew darts and a clean neckline\nFinish seams so they last',
    coverUrl: '',
    coverAlt: '',
    status: 'published',
    access: 'free',
    priceNgn: null,
    planIds: [],
    release: 'all',
    dripDays: 7,
    passPct: 70,
    certificate: true,
    instructor: 'Adaeze',
    modules: [
      {
        id: 'mod_s1',
        title: 'Before you sew',
        lessons: [
          lesson('les_s1', 'What you need', 'text', 5, { preview: true, body: 'A sewing machine with a straight stitch, 2 metres of voile or cotton lawn, matching thread, pins and a fabric marker.\n\nWash and press your fabric before cutting so it doesn’t shrink later.' }),
          lesson('les_s2', 'Cutting the pattern to your size', 'video', 12, { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', body: 'Sample video link — replace it with your own unlisted video.' }),
        ],
      },
      {
        id: 'mod_s2',
        title: 'Putting it together',
        lessons: [
          lesson('les_s3', 'Darts and the neckline', 'text', 15, { body: 'Mark each dart point, fold right sides together and stitch from the wide end to the point. Press darts towards the centre.' }),
          lesson('les_s4', 'Quick check', 'quiz', 3, {
            questions: [
              { id: 'q_s1', prompt: 'Why wash fabric before cutting?', options: ['It sews faster', 'So it doesn’t shrink after sewing', 'It changes the colour'], correct: 1 },
              { id: 'q_s2', prompt: 'Which way are darts pressed?', options: ['Towards the centre', 'Towards the side seam', 'It doesn’t matter'], correct: 0 },
            ],
          }),
        ],
      },
    ],
    sample: true,
    createdAt: ago(20),
    updatedAt: ago(4),
  },
  {
    id: 'crs_sample_circle',
    title: 'Styling notes for Circle members (sample)',
    subtitle: 'Monthly styling lessons, included with Atelier Circle.',
    description: 'One new module each month: how to style the latest drop for work, owambe and weekends.',
    outcomes: 'Build three outfits from one piece\nChoose accessories that work together',
    coverUrl: '',
    coverAlt: '',
    status: 'published',
    access: 'membership',
    priceNgn: null,
    planIds: ['ssp_circle'],
    release: 'drip',
    dripDays: 30,
    passPct: 70,
    certificate: false,
    instructor: 'Adaeze',
    modules: [
      { id: 'mod_s3', title: 'Harmattan drop', lessons: [lesson('les_s5', 'Three ways to wear the Ìfé two-piece', 'text', 6, { preview: true, body: 'Work: with a fitted blazer. Owambe: with a gele and statement earrings. Weekend: the top alone over jeans.' })] },
      { id: 'mod_s4', title: 'Accessories', lessons: [lesson('les_s6', 'Pairing scarves and bags', 'text', 5, { body: 'Pick one colour from the scarf’s print and repeat it in the bag or shoes.' })] },
    ],
    sample: true,
    createdAt: ago(15),
    updatedAt: ago(6),
  },
];

const enrol = (id: string, name: string, phone: string, done: string[], days: number, extra: Partial<Enrolment> = {}): Enrolment => ({
  id,
  courseId: SAMPLE_COURSE_ID,
  phone,
  email: '',
  name,
  source: 'free',
  enrolledAt: ago(days),
  completedLessonIds: done,
  quizScores: {},
  lastLessonId: done[done.length - 1],
  lastAt: done.length ? ago(Math.max(0, days - 2)) : undefined,
  sample: true,
  ...extra,
});

export const sampleEnrolments = (): Enrolment[] => [
  enrol('enr_s1', 'Funmi Okafor', '08070001104', ['les_s1', 'les_s2', 'les_s3', 'les_s4'], 12, { quizScores: { les_s4: 100 }, completedAt: ago(8), certificateNo: 'KUB-S-0001' }),
  enrol('enr_s2', 'Halima Sani', '08100002008', ['les_s1', 'les_s2'], 6),
  enrol('enr_s3', 'Uche Nnamdi', '08190002007', [], 1),
];
