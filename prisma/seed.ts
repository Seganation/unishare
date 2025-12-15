import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...\n')

  // Hash password for all users (admin123)
  const password = await hash('admin123', 12)

  // ==================== UNIVERSITIES & FACULTIES ====================
  console.log('📚 Creating universities and faculties...')

  const utm = await prisma.university.create({
    data: {
      name: 'Universiti Teknologi Malaysia',
      faculties: {
        create: [
          { name: 'Faculty of Computing' },
          { name: 'Faculty of Engineering' },
          { name: 'Faculty of Science' },
          { name: 'Faculty of Management' },
          { name: 'Faculty of Education' },
        ],
      },
    },
    include: {
      faculties: true,
    },
  })

  const um = await prisma.university.create({
    data: {
      name: 'Universiti Malaya',
      faculties: {
        create: [
          { name: 'Faculty of Computer Science and Information Technology' },
          { name: 'Faculty of Engineering' },
          { name: 'Faculty of Science' },
          { name: 'Faculty of Business and Accountancy' },
          { name: 'Faculty of Arts and Social Sciences' },
        ],
      },
    },
    include: {
      faculties: true,
    },
  })

  const usm = await prisma.university.create({
    data: {
      name: 'Universiti Sains Malaysia',
      faculties: {
        create: [
          { name: 'School of Computer Sciences' },
          { name: 'School of Electrical and Electronic Engineering' },
          { name: 'School of Mathematical Sciences' },
          { name: 'School of Management' },
        ],
      },
    },
    include: {
      faculties: true,
    },
  })

  const upm = await prisma.university.create({
    data: {
      name: 'Universiti Putra Malaysia',
      faculties: {
        create: [
          { name: 'Faculty of Computer Science and Information Technology' },
          { name: 'Faculty of Engineering' },
          { name: 'Faculty of Science' },
        ],
      },
    },
    include: {
      faculties: true,
    },
  })

  console.log(`✅ Created ${await prisma.university.count()} universities`)
  console.log(`✅ Created ${await prisma.faculty.count()} faculties\n`)

  // ==================== USERS ====================
  console.log('👥 Creating users...')

  // Get Faculty of Computing from UTM
  const facultyOfComputing = utm.faculties.find(f => f.name === 'Faculty of Computing')!

  // 1. Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@unishare.com',
      password: password,
      role: 'ADMIN',
      universityId: utm.id,
      facultyId: facultyOfComputing.id,
      studentIdUrl: 'https://utfs.io/f/example-admin-id.jpg',
      approvedAt: new Date(),
    },
  })

  // 2. First Student (Sarah Ahmed) - APPROVED
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Ahmed',
      email: 'sarah@student.utm.my',
      password: password,
      role: 'APPROVED',
      universityId: utm.id,
      facultyId: facultyOfComputing.id,
      studentIdUrl: 'https://utfs.io/f/example-sarah-id.jpg',
      approvedAt: new Date(),
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
  })

  // 3. Second Student (John Doe) - APPROVED
  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@student.utm.my',
      password: password,
      role: 'APPROVED',
      universityId: utm.id,
      facultyId: facultyOfComputing.id,
      studentIdUrl: 'https://utfs.io/f/example-john-id.jpg',
      approvedAt: new Date(),
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
  })

  // 4. Pending Student (Alice Wong) - PENDING
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Wong',
      email: 'alice@student.utm.my',
      password: password,
      role: 'PENDING',
      universityId: utm.id,
      facultyId: facultyOfComputing.id,
      studentIdUrl: 'https://utfs.io/f/example-alice-id.jpg',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    },
  })

  console.log('✅ Created users:')
  console.log(`   🔑 Admin: admin@unishare.com / admin123 (ADMIN)`)
  console.log(`   👤 Sarah: sarah@student.utm.my / admin123 (APPROVED)`)
  console.log(`   👤 John: john@student.utm.my / admin123 (APPROVED)`)
  console.log(`   ⏳ Alice: alice@student.utm.my / admin123 (PENDING)\n`)

  // ==================== COURSES ====================
  console.log('📚 Creating courses...')

  // Sarah's Courses
  const dataStructures = await prisma.course.create({
    data: {
      title: 'Data Structures & Algorithms',
      description: 'Learn fundamental data structures and algorithmic problem solving',
      color: '#3B82F6',
      createdBy: sarah.id,
    },
  })

  const webDev = await prisma.course.create({
    data: {
      title: 'Web Development',
      description: 'Full-stack web development with modern frameworks',
      color: '#10B981',
      createdBy: sarah.id,
    },
  })

  // John's Courses
  const machineLearning = await prisma.course.create({
    data: {
      title: 'Machine Learning',
      description: 'Introduction to ML algorithms and applications',
      color: '#8B5CF6',
      createdBy: john.id,
    },
  })

  const databases = await prisma.course.create({
    data: {
      title: 'Database Systems',
      description: 'Relational databases, SQL, and database design',
      color: '#F59E0B',
      createdBy: john.id,
    },
  })

  console.log(`✅ Created ${await prisma.course.count()} courses\n`)

  // ==================== RESOURCES ====================
  console.log('📄 Creating resources...')

  // Data Structures Resources
  await prisma.resource.createMany({
    data: [
      {
        title: 'Assignment 1: Array Implementation',
        type: 'ASSIGNMENT',
        description: 'Implement dynamic arrays with basic operations',
        deadline: new Date('2025-11-15'),
        fileUrls: ['https://utfs.io/f/assignment1.pdf'],
        allowFiles: true,
        courseId: dataStructures.id,
      },
      {
        title: 'Weekly Tasks',
        type: 'TASK',
        description: 'Practice problems and exercises',
        allowFiles: false,
        courseId: dataStructures.id,
      },
      {
        title: 'Lecture Notes & Slides',
        type: 'CONTENT',
        description: 'All lecture materials and references',
        fileUrls: ['https://utfs.io/f/lecture1.pdf', 'https://utfs.io/f/lecture2.pdf'],
        allowFiles: true,
        courseId: dataStructures.id,
      },
      {
        title: 'Study Notes',
        type: 'NOTES',
        description: 'Collaborative notes from lectures',
        allowFiles: false,
        courseId: dataStructures.id,
      },
    ],
  })

  // Web Development Resources
  await prisma.resource.createMany({
    data: [
      {
        title: 'Project: E-commerce Website',
        type: 'ASSIGNMENT',
        description: 'Build a full-stack e-commerce platform',
        deadline: new Date('2025-12-01'),
        allowFiles: true,
        courseId: webDev.id,
      },
      {
        title: 'Weekly Challenges',
        type: 'TASK',
        description: 'Frontend and backend coding challenges',
        allowFiles: false,
        courseId: webDev.id,
      },
      {
        title: 'Resources & References',
        type: 'CONTENT',
        description: 'Documentation, tutorials, and examples',
        fileUrls: ['https://utfs.io/f/react-guide.pdf'],
        allowFiles: true,
        courseId: webDev.id,
      },
      {
        title: 'Class Notes',
        type: 'NOTES',
        description: 'Shared notes and code snippets',
        allowFiles: false,
        courseId: webDev.id,
      },
    ],
  })

  // Machine Learning Resources
  await prisma.resource.createMany({
    data: [
      {
        title: 'Assignment: Linear Regression',
        type: 'ASSIGNMENT',
        description: 'Implement linear regression from scratch',
        deadline: new Date('2025-11-20'),
        allowFiles: true,
        courseId: machineLearning.id,
      },
      {
        title: 'Practice Problems',
        type: 'TASK',
        description: 'ML algorithm implementation exercises',
        allowFiles: false,
        courseId: machineLearning.id,
      },
      {
        title: 'Datasets & Code',
        type: 'CONTENT',
        description: 'Sample datasets and starter code',
        fileUrls: ['https://utfs.io/f/dataset.csv'],
        allowFiles: true,
        courseId: machineLearning.id,
      },
      {
        title: 'Lecture Notes',
        type: 'NOTES',
        description: 'Collaborative lecture notes',
        allowFiles: false,
        courseId: machineLearning.id,
      },
    ],
  })

  console.log(`✅ Created ${await prisma.resource.count()} resources\n`)

  // ==================== COLLABORATORS ====================
  console.log('🤝 Creating course collaborations...')

  // John is a CONTRIBUTOR on Sarah's Data Structures course
  await prisma.courseCollaborator.create({
    data: {
      courseId: dataStructures.id,
      userId: john.id,
      role: 'CONTRIBUTOR',
      status: 'ACCEPTED',
      joinedAt: new Date(),
    },
  })

  // Sarah is a VIEWER on John's Machine Learning course
  await prisma.courseCollaborator.create({
    data: {
      courseId: machineLearning.id,
      userId: sarah.id,
      role: 'VIEWER',
      status: 'ACCEPTED',
      joinedAt: new Date(),
    },
  })

  console.log(`✅ Created ${await prisma.courseCollaborator.count()} collaborations\n`)

  // ==================== FAVORITES ====================
  console.log('⭐ Creating favorites...')

  await prisma.favorite.createMany({
    data: [
      { userId: sarah.id, courseId: dataStructures.id },
      { userId: sarah.id, courseId: webDev.id },
      { userId: john.id, courseId: machineLearning.id },
      { userId: john.id, courseId: dataStructures.id },
    ],
  })

  console.log(`✅ Created ${await prisma.favorite.count()} favorites\n`)

  // ==================== NOTES ====================
  console.log('📝 Creating collaborative notes...')

  // Create notes individually so we can set liveblockRoom to the note's own ID
  const dataStructuresNote = await prisma.note.create({
    data: {
      courseId: dataStructures.id,
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Data Structures Notes' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Welcome to our collaborative notes! Feel free to add your insights.',
              },
            ],
          },
        ],
      }),
      liveblockRoom: '', // Will be updated to note ID
    },
  })

  await prisma.note.update({
    where: { id: dataStructuresNote.id },
    data: { liveblockRoom: dataStructuresNote.id },
  })

  const webDevNote = await prisma.note.create({
    data: {
      courseId: webDev.id,
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Web Development Notes' }],
          },
        ],
      }),
      liveblockRoom: '', // Will be updated to note ID
    },
  })

  await prisma.note.update({
    where: { id: webDevNote.id },
    data: { liveblockRoom: webDevNote.id },
  })

  const machineLearningNote = await prisma.note.create({
    data: {
      courseId: machineLearning.id,
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Machine Learning Notes' }],
          },
        ],
      }),
      liveblockRoom: '', // Will be updated to note ID
    },
  })

  await prisma.note.update({
    where: { id: machineLearningNote.id },
    data: { liveblockRoom: machineLearningNote.id },
  })

  console.log(`✅ Created ${await prisma.note.count()} note documents\n`)

  // ==================== TIMETABLES ====================
  console.log('📅 Creating timetables...')

  // Sarah's Fall 2024 Timetable
  const sarahTimetable = await prisma.timetable.create({
    data: {
      name: 'Fall 2024 Schedule',
      description: 'My class schedule for Fall 2024 semester',
      createdBy: sarah.id,
    },
  })

  // John's Fall 2024 Timetable
  const johnTimetable = await prisma.timetable.create({
    data: {
      name: 'Fall 2024 Schedule',
      description: 'My class schedule for Fall 2024 semester',
      createdBy: john.id,
    },
  })

  console.log(`✅ Created ${await prisma.timetable.count()} timetables\n`)

  // ==================== TIMETABLE COLLABORATORS ====================
  console.log('🤝 Creating timetable collaborations...')

  // John is a VIEWER on Sarah's timetable
  await prisma.timetableCollaborator.create({
    data: {
      timetableId: sarahTimetable.id,
      userId: john.id,
      role: 'VIEWER',
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  })

  console.log(`✅ Created ${await prisma.timetableCollaborator.count()} timetable collaborations\n`)

  // ==================== EVENTS (TIMETABLE) ====================
  console.log('📅 Creating timetable events...')

  // Sarah's events
  await prisma.event.createMany({
    data: [
      {
        title: 'DSA Lecture',
        timetableId: sarahTimetable.id,
        courseId: dataStructures.id,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '11:00',
        location: 'Room A101',
        recurring: true,
        createdBy: sarah.id,
      },
      {
        title: 'DSA Tutorial',
        timetableId: sarahTimetable.id,
        courseId: dataStructures.id,
        dayOfWeek: 3, // Wednesday
        startTime: '14:00',
        endTime: '16:00',
        location: 'Lab C201',
        recurring: true,
        createdBy: sarah.id,
      },
      {
        title: 'Web Dev Lab',
        timetableId: sarahTimetable.id,
        courseId: webDev.id,
        dayOfWeek: 2, // Tuesday
        startTime: '10:00',
        endTime: '13:00',
        location: 'Lab B105',
        recurring: true,
        createdBy: sarah.id,
      },
    ],
  })

  // John's events
  await prisma.event.createMany({
    data: [
      {
        title: 'ML Lecture',
        timetableId: johnTimetable.id,
        courseId: machineLearning.id,
        dayOfWeek: 4, // Thursday
        startTime: '09:00',
        endTime: '11:00',
        location: 'Room D203',
        recurring: true,
        createdBy: john.id,
      },
      {
        title: 'Database Lecture',
        timetableId: johnTimetable.id,
        courseId: databases.id,
        dayOfWeek: 5, // Friday
        startTime: '14:00',
        endTime: '16:00',
        location: 'Room E105',
        recurring: true,
        createdBy: john.id,
      },
    ],
  })

  console.log(`✅ Created ${await prisma.event.count()} timetable events\n`)

  // ==================== TAGS ====================
  console.log('🏷️ Creating article tags...')

  const tags = await prisma.tag.createMany({
    data: [
      { name: 'Programming', slug: 'programming' },
      { name: 'Tutorial', slug: 'tutorial' },
      { name: 'Study Tips', slug: 'study-tips' },
      { name: 'Career', slug: 'career' },
      { name: 'Technology', slug: 'technology' },
      { name: 'Web Development', slug: 'web-development' },
      { name: 'Data Science', slug: 'data-science' },
    ],
  })

  const allTags = await prisma.tag.findMany()

  console.log(`✅ Created ${allTags.length} tags\n`)

  // ==================== ARTICLES ====================
  console.log('📰 Creating articles...')

  const article1 = await prisma.article.create({
    data: {
      title: 'Getting Started with Next.js 15',
      slug: 'getting-started-with-nextjs-15',
      excerpt:
        'Learn the basics of Next.js 15 and build your first full-stack application',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Getting Started with Next.js 15' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Next.js 15 brings exciting new features and improvements...',
              },
            ],
          },
        ],
      }),
      status: 'PUBLISHED',
      featured: true,
      views: 234,
      readTime: 5,
      authorId: sarah.id,
      publishedAt: new Date(),
      tags: {
        connect: [
          { slug: 'programming' },
          { slug: 'tutorial' },
          { slug: 'web-development' },
        ],
      },
    },
  })

  const article2 = await prisma.article.create({
    data: {
      title: '10 Study Tips for Computer Science Students',
      slug: '10-study-tips-for-cs-students',
      excerpt: 'Effective study strategies to excel in your CS courses',
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: '10 Study Tips for CS Students' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Here are proven strategies to help you succeed...',
              },
            ],
          },
        ],
      }),
      status: 'PUBLISHED',
      featured: true,
      views: 567,
      readTime: 8,
      authorId: john.id,
      publishedAt: new Date(),
      tags: {
        connect: [{ slug: 'study-tips' }, { slug: 'career' }],
      },
    },
  })

  const article3 = await prisma.article.create({
    data: {
      title: 'Introduction to Machine Learning',
      slug: 'introduction-to-machine-learning',
      excerpt: 'A beginner-friendly guide to understanding ML concepts',
      coverImage:
        'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Introduction to Machine Learning' }],
          },
        ],
      }),
      status: 'PUBLISHED',
      views: 189,
      readTime: 12,
      authorId: john.id,
      publishedAt: new Date(),
      tags: {
        connect: [{ slug: 'data-science' }, { slug: 'tutorial' }],
      },
    },
  })

  // Draft article
  await prisma.article.create({
    data: {
      title: 'Building a Real-time Chat App',
      slug: 'building-realtime-chat-app',
      excerpt: 'Learn to build a chat application with WebSockets',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Building a Real-time Chat App' }],
          },
        ],
      }),
      status: 'DRAFT',
      readTime: 15,
      authorId: sarah.id,
      tags: {
        connect: [{ slug: 'web-development' }, { slug: 'tutorial' }],
      },
    },
  })

  console.log(`✅ Created ${await prisma.article.count()} articles\n`)

  // ==================== SUMMARY ====================
  console.log('\n🎉 Database seeded successfully!\n')
  console.log('📊 Summary:')
  console.log(`   • ${await prisma.university.count()} universities`)
  console.log(`   • ${await prisma.faculty.count()} faculties`)
  console.log(`   • ${await prisma.user.count()} users`)
  console.log(`   • ${await prisma.course.count()} courses`)
  console.log(`   • ${await prisma.resource.count()} resources`)
  console.log(`   • ${await prisma.courseCollaborator.count()} collaborations`)
  console.log(`   • ${await prisma.favorite.count()} favorites`)
  console.log(`   • ${await prisma.note.count()} note documents`)
  console.log(`   • ${await prisma.timetable.count()} timetables`)
  console.log(`   • ${await prisma.timetableCollaborator.count()} timetable collaborations`)
  console.log(`   • ${await prisma.event.count()} timetable events`)
  console.log(`   • ${await prisma.tag.count()} tags`)
  console.log(`   • ${await prisma.article.count()} articles`)

  console.log('\n🔐 Login Credentials:')
  console.log('   Admin: admin@unishare.com / admin123')
  console.log('   Sarah: sarah@student.utm.my / admin123')
  console.log('   John: john@student.utm.my / admin123')
  console.log('   Alice: alice@student.utm.my / admin123 (PENDING)\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
