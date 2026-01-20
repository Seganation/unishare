import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seed...\n')

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

  console.log(`✅ Created ${await prisma.university.count()} universities`)
  console.log(`✅ Created ${await prisma.faculty.count()} faculties\n`)

  // ==================== USERS ====================
  console.log('👥 Creating users...')

  const facultyOfComputing = utm.faculties.find(f => f.name === 'Faculty of Computing')!
  const facultyOfEngineering = utm.faculties.find(f => f.name === 'Faculty of Engineering')!
  const facultyOfScience = utm.faculties.find(f => f.name === 'Faculty of Science')!

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

  // 2. Sarah Ahmed - APPROVED (Computing)
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
      avatarIndex: 0,
    },
  })

  // 3. John Doe - APPROVED (Computing)
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
      avatarIndex: 1,
    },
  })

  // 4. Alice Wong - PENDING (Computing)
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
      avatarIndex: 2,
    },
  })

  // 5. Michael Chen - APPROVED (Engineering)
  const michael = await prisma.user.create({
    data: {
      name: 'Michael Chen',
      email: 'michael@student.utm.my',
      password: password,
      role: 'APPROVED',
      universityId: utm.id,
      facultyId: facultyOfEngineering.id,
      studentIdUrl: 'https://utfs.io/f/example-michael-id.jpg',
      approvedAt: new Date(),
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      avatarIndex: 3,
    },
  })

  // 6. Emily Rodriguez - APPROVED (Science)
  const emily = await prisma.user.create({
    data: {
      name: 'Emily Rodriguez',
      email: 'emily@student.utm.my',
      password: password,
      role: 'APPROVED',
      universityId: utm.id,
      facultyId: facultyOfScience.id,
      studentIdUrl: 'https://utfs.io/f/example-emily-id.jpg',
      approvedAt: new Date(),
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      avatarIndex: 4,
    },
  })

  // 7. David Kim - APPROVED (Computing)
  const david = await prisma.user.create({
    data: {
      name: 'David Kim',
      email: 'david@student.utm.my',
      password: password,
      role: 'APPROVED',
      universityId: utm.id,
      facultyId: facultyOfComputing.id,
      studentIdUrl: 'https://utfs.io/f/example-david-id.jpg',
      approvedAt: new Date(),
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      avatarIndex: 5,
    },
  })

  // 8. Lisa Martinez - APPROVED (Computing)
  const lisa = await prisma.user.create({
    data: {
      name: 'Lisa Martinez',
      email: 'lisa@student.utm.my',
      password: password,
      role: 'APPROVED',
      universityId: utm.id,
      facultyId: facultyOfComputing.id,
      studentIdUrl: 'https://utfs.io/f/example-lisa-id.jpg',
      approvedAt: new Date(),
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      avatarIndex: 6,
    },
  })

  console.log('✅ Created users:')
  console.log(`   🔑 Admin: admin@unishare.com / admin123 (ADMIN)`)
  console.log(`   👤 Sarah: sarah@student.utm.my / admin123 (APPROVED)`)
  console.log(`   👤 John: john@student.utm.my / admin123 (APPROVED)`)
  console.log(`   ⏳ Alice: alice@student.utm.my / admin123 (PENDING)`)
  console.log(`   👤 Michael: michael@student.utm.my / admin123 (APPROVED)`)
  console.log(`   👤 Emily: emily@student.utm.my / admin123 (APPROVED)`)
  console.log(`   👤 David: david@student.utm.my / admin123 (APPROVED)`)
  console.log(`   👤 Lisa: lisa@student.utm.my / admin123 (APPROVED)\n`)

  // ==================== COURSES ====================
  console.log('📚 Creating courses...')

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

  const operatingSystems = await prisma.course.create({
    data: {
      title: 'Operating Systems',
      description: 'OS concepts, processes, threads, and memory management',
      color: '#EF4444',
      createdBy: michael.id,
    },
  })

  const networking = await prisma.course.create({
    data: {
      title: 'Computer Networks',
      description: 'Network protocols, architectures, and security',
      color: '#06B6D4',
      createdBy: david.id,
    },
  })

  console.log(`✅ Created ${await prisma.course.count()} courses\n`)

  // ==================== RESOURCES ====================
  console.log('📄 Creating resources...')

  await prisma.resource.createMany({
    data: [
      // Data Structures Resources
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
      // Web Dev Resources
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
      // Machine Learning Resources
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
      // Operating Systems Resources
      {
        title: 'Lab 1: Process Scheduling',
        type: 'ASSIGNMENT',
        description: 'Implement CPU scheduling algorithms',
        deadline: new Date('2025-11-25'),
        allowFiles: true,
        courseId: operatingSystems.id,
      },
    ],
  })

  console.log(`✅ Created ${await prisma.resource.count()} resources\n`)

  // ==================== COURSE COLLABORATORS (ACCEPTED, PENDING, REJECTED) ====================
  console.log('🤝 Creating course collaborations (with invites)...')

  await prisma.courseCollaborator.createMany({
    data: [
      // ACCEPTED collaborations
      {
        courseId: dataStructures.id,
        userId: john.id,
        role: 'CONTRIBUTOR',
        status: 'ACCEPTED',
        joinedAt: new Date(),
      },
      {
        courseId: machineLearning.id,
        userId: sarah.id,
        role: 'VIEWER',
        status: 'ACCEPTED',
        joinedAt: new Date(),
      },
      {
        courseId: webDev.id,
        userId: david.id,
        role: 'CONTRIBUTOR',
        status: 'ACCEPTED',
        joinedAt: new Date(),
      },
      {
        courseId: databases.id,
        userId: michael.id,
        role: 'VIEWER',
        status: 'ACCEPTED',
        joinedAt: new Date(),
      },
      // PENDING invitations (sent but not yet accepted)
      {
        courseId: dataStructures.id,
        userId: michael.id,
        role: 'VIEWER',
        status: 'PENDING',
      },
      {
        courseId: dataStructures.id,
        userId: emily.id,
        role: 'CONTRIBUTOR',
        status: 'PENDING',
      },
      {
        courseId: webDev.id,
        userId: lisa.id,
        role: 'VIEWER',
        status: 'PENDING',
      },
      {
        courseId: machineLearning.id,
        userId: david.id,
        role: 'VIEWER',
        status: 'PENDING',
      },
      {
        courseId: operatingSystems.id,
        userId: john.id,
        role: 'CONTRIBUTOR',
        status: 'PENDING',
      },
      // REJECTED invitations
      {
        courseId: databases.id,
        userId: emily.id,
        role: 'VIEWER',
        status: 'REJECTED',
      },
      {
        courseId: networking.id,
        userId: sarah.id,
        role: 'CONTRIBUTOR',
        status: 'REJECTED',
      },
    ],
  })

  console.log(`✅ Created ${await prisma.courseCollaborator.count()} course collaborations\n`)

  // ==================== FAVORITES ====================
  console.log('⭐ Creating favorites...')

  await prisma.favorite.createMany({
    data: [
      { userId: sarah.id, courseId: dataStructures.id },
      { userId: sarah.id, courseId: webDev.id },
      { userId: sarah.id, courseId: machineLearning.id },
      { userId: john.id, courseId: machineLearning.id },
      { userId: john.id, courseId: dataStructures.id },
      { userId: john.id, courseId: databases.id },
      { userId: michael.id, courseId: operatingSystems.id },
      { userId: michael.id, courseId: databases.id },
      { userId: david.id, courseId: networking.id },
      { userId: david.id, courseId: webDev.id },
      { userId: lisa.id, courseId: dataStructures.id },
      { userId: emily.id, courseId: machineLearning.id },
    ],
  })

  console.log(`✅ Created ${await prisma.favorite.count()} favorites\n`)

  // ==================== NOTES ====================
  console.log('📝 Creating collaborative notes...')

  const dataStructuresNote = await prisma.note.create({
    data: {
      courseId: dataStructures.id,
      title: 'Data Structures Main Notes',
      icon: '📚',
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
      liveblockRoom: '',
    },
  })
  await prisma.note.update({
    where: { id: dataStructuresNote.id },
    data: { liveblockRoom: dataStructuresNote.id },
  })

  const webDevNote = await prisma.note.create({
    data: {
      courseId: webDev.id,
      title: 'Web Development Notes',
      icon: '🌐',
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
      liveblockRoom: '',
    },
  })
  await prisma.note.update({
    where: { id: webDevNote.id },
    data: { liveblockRoom: webDevNote.id },
  })

  const mlNote = await prisma.note.create({
    data: {
      courseId: machineLearning.id,
      title: 'Machine Learning Notes',
      icon: '🤖',
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
      liveblockRoom: '',
    },
  })
  await prisma.note.update({
    where: { id: mlNote.id },
    data: { liveblockRoom: mlNote.id },
  })

  console.log(`✅ Created ${await prisma.note.count()} note documents\n`)

  // ==================== TIMETABLES ====================
  console.log('📅 Creating timetables...')

  const sarahTimetable = await prisma.timetable.create({
    data: {
      name: 'Fall 2024 Schedule',
      description: 'My class schedule for Fall 2024 semester',
      createdBy: sarah.id,
    },
  })

  const johnTimetable = await prisma.timetable.create({
    data: {
      name: 'Fall 2024 Schedule',
      description: 'My class schedule for Fall 2024 semester',
      createdBy: john.id,
    },
  })

  const michaelTimetable = await prisma.timetable.create({
    data: {
      name: 'Fall 2024 Engineering Schedule',
      description: 'Engineering courses timetable',
      createdBy: michael.id,
    },
  })

  // Set default timetables
  await prisma.user.update({
    where: { id: sarah.id },
    data: { defaultTimetableId: sarahTimetable.id },
  })

  await prisma.user.update({
    where: { id: john.id },
    data: { defaultTimetableId: johnTimetable.id },
  })

  console.log(`✅ Created ${await prisma.timetable.count()} timetables\n`)

  // ==================== TIMETABLE COLLABORATORS ====================
  console.log('🤝 Creating timetable collaborations (with invites)...')

  await prisma.timetableCollaborator.createMany({
    data: [
      // ACCEPTED
      {
        timetableId: sarahTimetable.id,
        userId: john.id,
        role: 'VIEWER',
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      {
        timetableId: johnTimetable.id,
        userId: sarah.id,
        role: 'CONTRIBUTOR',
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      // PENDING
      {
        timetableId: sarahTimetable.id,
        userId: david.id,
        role: 'VIEWER',
        status: 'PENDING',
      },
      {
        timetableId: michaelTimetable.id,
        userId: emily.id,
        role: 'CONTRIBUTOR',
        status: 'PENDING',
      },
      {
        timetableId: johnTimetable.id,
        userId: lisa.id,
        role: 'VIEWER',
        status: 'PENDING',
      },
      // REJECTED
      {
        timetableId: michaelTimetable.id,
        userId: john.id,
        role: 'VIEWER',
        status: 'REJECTED',
      },
    ],
  })

  console.log(`✅ Created ${await prisma.timetableCollaborator.count()} timetable collaborations\n`)

  // ==================== EVENTS (TIMETABLE) ====================
  console.log('📅 Creating timetable events...')

  await prisma.event.createMany({
    data: [
      // Sarah's events
      {
        title: 'DSA Lecture',
        timetableId: sarahTimetable.id,
        courseId: dataStructures.id,
        dayOfWeek: 1,
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
        dayOfWeek: 3,
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
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '13:00',
        location: 'Lab B105',
        recurring: true,
        createdBy: sarah.id,
      },
      // John's events
      {
        title: 'ML Lecture',
        timetableId: johnTimetable.id,
        courseId: machineLearning.id,
        dayOfWeek: 4,
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
        dayOfWeek: 5,
        startTime: '14:00',
        endTime: '16:00',
        location: 'Room E105',
        recurring: true,
        createdBy: john.id,
      },
      // Michael's events
      {
        title: 'OS Lecture',
        timetableId: michaelTimetable.id,
        courseId: operatingSystems.id,
        dayOfWeek: 2,
        startTime: '11:00',
        endTime: '13:00',
        location: 'Room F301',
        recurring: true,
        createdBy: michael.id,
      },
    ],
  })

  console.log(`✅ Created ${await prisma.event.count()} timetable events\n`)

  // ==================== TAGS ====================
  console.log('🏷️  Creating article tags...')

  await prisma.tag.createMany({
    data: [
      { name: 'Programming', slug: 'programming' },
      { name: 'Tutorial', slug: 'tutorial' },
      { name: 'Study Tips', slug: 'study-tips' },
      { name: 'Career', slug: 'career' },
      { name: 'Technology', slug: 'technology' },
      { name: 'Web Development', slug: 'web-development' },
      { name: 'Data Science', slug: 'data-science' },
      { name: 'AI', slug: 'ai' },
      { name: 'Productivity', slug: 'productivity' },
    ],
  })

  const allTags = await prisma.tag.findMany()
  console.log(`✅ Created ${allTags.length} tags\n`)

  // ==================== ARTICLES ====================
  console.log('📰 Creating articles...')

  await prisma.article.create({
    data: {
      title: 'Getting Started with Next.js 15',
      slug: 'getting-started-with-nextjs-15',
      excerpt: 'Learn the basics of Next.js 15 and build your first full-stack application',
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
              { type: 'text', text: 'Next.js 15 brings exciting new features and improvements that make building full-stack web applications easier than ever. In this comprehensive guide, we\'ll walk through everything you need to know to get started with the latest version of this powerful React framework.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'What is Next.js?' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Next.js is a React framework that provides a robust set of features for building production-ready applications. It offers server-side rendering, static site generation, API routes, and much more out of the box.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Key Features in Next.js 15' }],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Improved performance with faster builds and optimized bundling' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Enhanced App Router with better streaming and partial prerendering' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Server Actions for seamless server-side mutations' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Improved TypeScript support and type inference' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Getting Started' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'To create a new Next.js 15 project, run:' },
            ],
          },
          {
            type: 'codeBlock',
            attrs: { language: 'bash' },
            content: [{ type: 'text', text: 'npx create-next-app@latest my-app\ncd my-app\nnpm run dev' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This will set up a new Next.js project with all the latest features and best practices configured for you.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Conclusion' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Next.js 15 is an excellent choice for building modern web applications. With its powerful features and excellent developer experience, you\'ll be building production-ready apps in no time!' },
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
        connect: [{ slug: 'programming' }, { slug: 'tutorial' }, { slug: 'web-development' }],
      },
    },
  })

  await prisma.article.create({
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
              { type: 'text', text: 'Succeeding in computer science requires more than just attending lectures. Here are ten proven strategies to help you excel in your CS courses and build a strong foundation for your tech career.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '1. Practice Coding Every Day' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Consistency is key in programming. Dedicate at least 30 minutes daily to coding practice, even on weekends. Use platforms like LeetCode, HackerRank, or build personal projects to reinforce concepts.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '2. Understand, Don\'t Memorize' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Focus on understanding the underlying concepts rather than memorizing syntax. When you understand why something works, you can apply it to new problems more effectively.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '3. Work on Projects' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Build real projects that interest you. Projects help you apply theoretical knowledge, understand software development lifecycle, and create a portfolio for future job applications.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '4. Study in Groups' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Collaborative learning helps you see different approaches to problems. Teaching concepts to peers also reinforces your own understanding.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '5. Debug Systematically' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Learn to use debugging tools and develop a systematic approach to finding bugs. Print statements and debuggers are your best friends.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '6. Read Documentation' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Get comfortable reading official documentation. It\'s an essential skill that will serve you throughout your career and help you learn new technologies independently.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '7. Take Breaks' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Use the Pomodoro Technique: study for 25 minutes, then take a 5-minute break. This prevents burnout and helps maintain focus during long coding sessions.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '8. Participate in Coding Communities' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Join online communities like GitHub, Stack Overflow, and Reddit. Contributing to discussions and open-source projects accelerates learning.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '9. Review and Refactor Code' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Regularly review your old code and look for ways to improve it. This practice helps you recognize patterns and write cleaner, more efficient code.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '10. Stay Updated' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Technology evolves rapidly. Follow tech blogs, podcasts, and industry leaders to stay current with new tools, frameworks, and best practices in computer science.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Conclusion' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Success in computer science is a marathon, not a sprint. Apply these tips consistently, stay curious, and don\'t be afraid to make mistakes—they\'re valuable learning opportunities!' },
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

  await prisma.article.create({
    data: {
      title: 'Introduction to Machine Learning',
      slug: 'introduction-to-machine-learning',
      excerpt: 'A beginner-friendly guide to understanding ML concepts',
      coverImage: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Introduction to Machine Learning' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Machine Learning (ML) is one of the most exciting and rapidly growing fields in computer science. This guide will help you understand the fundamentals of ML and how to get started with your own projects.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'What is Machine Learning?' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Machine Learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. Instead of following rigid instructions, ML systems identify patterns in data and make decisions based on those patterns.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Types of Machine Learning' }],
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Supervised Learning' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'The algorithm learns from labeled training data. Common applications include spam detection, image classification, and price prediction.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Unsupervised Learning' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'The algorithm finds patterns in unlabeled data. Used for clustering customers, anomaly detection, and dimensionality reduction.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Reinforcement Learning' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'The algorithm learns through trial and error, receiving rewards or penalties. Powers game AI, robotics, and recommendation systems.' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Key Concepts' }],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Training Data: The dataset used to teach the model' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Features: Input variables used for making predictions' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Model: The algorithm that learns patterns from data' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Overfitting: When a model performs well on training data but poorly on new data' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Validation: Testing model performance on unseen data' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Popular ML Algorithms' }],
          },
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Linear Regression - for predicting continuous values' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Logistic Regression - for binary classification' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Decision Trees - for classification and regression' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Random Forests - ensemble method for improved accuracy' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Neural Networks - for complex pattern recognition' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Getting Started' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'To begin your ML journey:' },
            ],
          },
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Learn Python programming basics' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Study mathematics (linear algebra, calculus, statistics)' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Use libraries like scikit-learn, TensorFlow, or PyTorch' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Work on small projects with public datasets (Kaggle is great)' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Join ML communities and keep learning' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Conclusion' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Machine Learning is transforming industries worldwide. While it may seem daunting at first, consistent practice and curiosity will help you master this powerful technology. Start small, build projects, and gradually tackle more complex challenges!' },
            ],
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

  // ==================== AI CONVERSATIONS & MESSAGES ====================
  console.log('🤖 Creating AI conversations and messages...')

  const aiConv1 = await prisma.aiConversation.create({
    data: {
      title: 'Explain Quick Sort Algorithm',
      userId: sarah.id,
      courseId: dataStructures.id,
      noteId: dataStructuresNote.id,
      temperature: 0.7,
    },
  })

  await prisma.aiMessage.createMany({
    data: [
      {
        conversationId: aiConv1.id,
        role: 'USER',
        data: JSON.stringify({
          id: 'msg-1',
          role: 'user',
          parts: [{ type: 'text', text: 'Can you explain how quicksort works?' }],
          createdAt: new Date(),
        }),
        tokensUsed: 12,
      },
      {
        conversationId: aiConv1.id,
        role: 'ASSISTANT',
        data: JSON.stringify({
          id: 'msg-2',
          role: 'assistant',
          parts: [
            {
              type: 'text',
              text: 'QuickSort is a divide-and-conquer algorithm that works by selecting a pivot element and partitioning the array around it...',
            },
          ],
          createdAt: new Date(),
        }),
        tokensUsed: 150,
      },
    ],
  })

  const aiConv2 = await prisma.aiConversation.create({
    data: {
      title: 'React Hooks Best Practices',
      userId: sarah.id,
      courseId: webDev.id,
      noteId: webDevNote.id,
      temperature: 0.5,
    },
  })

  await prisma.aiMessage.createMany({
    data: [
      {
        conversationId: aiConv2.id,
        role: 'USER',
        data: JSON.stringify({
          id: 'msg-3',
          role: 'user',
          parts: [{ type: 'text', text: 'What are the best practices for using React hooks?' }],
          createdAt: new Date(),
        }),
        tokensUsed: 15,
      },
      {
        conversationId: aiConv2.id,
        role: 'ASSISTANT',
        data: JSON.stringify({
          id: 'msg-4',
          role: 'assistant',
          parts: [
            {
              type: 'text',
              text: 'Here are the key best practices for React hooks: 1) Always call hooks at the top level...',
            },
          ],
          createdAt: new Date(),
        }),
        tokensUsed: 200,
      },
    ],
  })

  console.log(`✅ Created ${await prisma.aiConversation.count()} AI conversations`)
  console.log(`✅ Created ${await prisma.aiMessage.count()} AI messages\n`)

  // ==================== AI GENERATED NOTES ====================
  console.log('📝 Creating AI-generated notes...')

  await prisma.aiGeneratedNote.createMany({
    data: [
      {
        noteId: dataStructuresNote.id,
        userId: sarah.id,
        prompt: 'Generate comprehensive notes on sorting algorithms',
        tokensUsed: 500,
        contentBefore: undefined,
        contentAfter: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Sorting Algorithms' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Comprehensive overview of sorting algorithms...' }],
            },
          ],
        }),
        type: 'GENERATE',
      },
      {
        noteId: webDevNote.id,
        userId: sarah.id,
        prompt: 'Improve the existing React hooks section',
        tokensUsed: 350,
        contentBefore: JSON.stringify({ type: 'doc', content: [] }),
        contentAfter: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'React Hooks - Enhanced' }],
            },
          ],
        }),
        type: 'IMPROVE',
      },
    ],
  })

  console.log(`✅ Created ${await prisma.aiGeneratedNote.count()} AI-generated notes\n`)

  // ==================== AI QUIZZES ====================
  console.log('🎯 Creating AI quizzes with questions and attempts...')

  const quiz1 = await prisma.aiQuiz.create({
    data: {
      title: 'Data Structures Quiz',
      description: 'Test your knowledge on arrays, linked lists, and trees',
      courseId: dataStructures.id,
      noteId: dataStructuresNote.id,
      userId: sarah.id,
      prompt: 'Create a quiz on data structures covering arrays and linked lists',
      tokensUsed: 400,
    },
  })

  await prisma.aiQuizQuestion.createMany({
    data: [
      {
        quizId: quiz1.id,
        question: 'What is the time complexity of inserting an element at the beginning of an array?',
        type: 'MULTIPLE_CHOICE',
        options: JSON.stringify(['O(1)', 'O(n)', 'O(log n)', 'O(n²)']),
        correctAnswer: 'O(n)',
        explanation: 'Inserting at the beginning requires shifting all existing elements, resulting in O(n) time.',
        order: 0,
      },
      {
        quizId: quiz1.id,
        question: 'A linked list allows constant time insertion at the head.',
        type: 'TRUE_FALSE',
        options: JSON.stringify(['True', 'False']),
        correctAnswer: 'True',
        explanation: 'With a reference to the head, insertion takes O(1) time.',
        order: 1,
      },
      {
        quizId: quiz1.id,
        question: 'What data structure uses LIFO principle?',
        type: 'SHORT_ANSWER',
        correctAnswer: 'Stack',
        explanation: 'A stack follows Last-In-First-Out (LIFO) principle.',
        order: 2,
      },
    ],
  })

  const questions = await prisma.aiQuizQuestion.findMany({ where: { quizId: quiz1.id } })

  // John takes the quiz
  const attempt1 = await prisma.aiQuizAttempt.create({
    data: {
      quizId: quiz1.id,
      userId: john.id,
      score: 66.67,
      completedAt: new Date(),
    },
  })

  await prisma.aiQuizAnswer.createMany({
    data: [
      {
        attemptId: attempt1.id,
        questionId: questions[0]!.id,
        userAnswer: 'O(n)',
        isCorrect: true,
      },
      {
        attemptId: attempt1.id,
        questionId: questions[1]!.id,
        userAnswer: 'True',
        isCorrect: true,
      },
      {
        attemptId: attempt1.id,
        questionId: questions[2]!.id,
        userAnswer: 'Queue',
        isCorrect: false,
      },
    ],
  })

  console.log(`✅ Created ${await prisma.aiQuiz.count()} AI quizzes`)
  console.log(`✅ Created ${await prisma.aiQuizQuestion.count()} quiz questions`)
  console.log(`✅ Created ${await prisma.aiQuizAttempt.count()} quiz attempts\n`)

  // ==================== AI STUDY PLANS ====================
  console.log('📖 Creating AI study plans...')

  const studyPlan = await prisma.aiStudyPlan.create({
    data: {
      title: '4-Week Data Structures Study Plan',
      description: 'Comprehensive study plan for DSA final exam',
      courseId: dataStructures.id,
      userId: sarah.id,
      prompt: 'Create a 4-week study plan for data structures final exam',
      tokensUsed: 600,
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-28'),
    },
  })

  const week1 = await prisma.aiStudyPlanWeek.create({
    data: {
      studyPlanId: studyPlan.id,
      weekNumber: 1,
      title: 'Week 1: Arrays and Strings',
      description: 'Master array manipulation and string algorithms',
      goals: ['Understand array operations', 'Learn string manipulation techniques', 'Practice basic problems'],
    },
  })

  await prisma.aiStudyPlanTask.createMany({
    data: [
      {
        weekId: week1.id,
        title: 'Review array fundamentals',
        description: 'Go through lecture notes on arrays',
        estimatedMinutes: 60,
        isCompleted: true,
        completedAt: new Date(),
        order: 0,
      },
      {
        weekId: week1.id,
        title: 'Solve 10 array problems on LeetCode',
        description: 'Practice easy to medium difficulty problems',
        estimatedMinutes: 120,
        isCompleted: true,
        completedAt: new Date(),
        order: 1,
      },
      {
        weekId: week1.id,
        title: 'Watch string algorithms video',
        description: 'YouTube tutorial on common string patterns',
        estimatedMinutes: 45,
        isCompleted: false,
        order: 2,
      },
    ],
  })

  const week2 = await prisma.aiStudyPlanWeek.create({
    data: {
      studyPlanId: studyPlan.id,
      weekNumber: 2,
      title: 'Week 2: Linked Lists and Stacks',
      description: 'Deep dive into pointer-based data structures',
      goals: ['Understand linked list operations', 'Master stack implementation', 'Solve pointer manipulation problems'],
    },
  })

  await prisma.aiStudyPlanTask.createMany({
    data: [
      {
        weekId: week2.id,
        title: 'Implement singly linked list',
        description: 'Code all basic operations from scratch',
        estimatedMinutes: 90,
        isCompleted: false,
        order: 0,
      },
      {
        weekId: week2.id,
        title: 'Study stack applications',
        description: 'Learn about expression evaluation and backtracking',
        estimatedMinutes: 60,
        isCompleted: false,
        order: 1,
      },
    ],
  })

  console.log(`✅ Created ${await prisma.aiStudyPlan.count()} AI study plans`)
  console.log(`✅ Created ${await prisma.aiStudyPlanWeek.count()} study plan weeks`)
  console.log(`✅ Created ${await prisma.aiStudyPlanTask.count()} study plan tasks\n`)

  // ==================== NOTIFICATIONS ====================
  console.log('🔔 Creating notifications...')

  await prisma.notification.createMany({
    data: [
      // Course invitations
      {
        userId: michael.id,
        type: 'COURSE_INVITATION',
        title: 'Course Invitation',
        message: 'Sarah Ahmed invited you to collaborate on Data Structures & Algorithms',
        metadata: JSON.stringify({
          courseId: dataStructures.id,
          courseName: 'Data Structures & Algorithms',
          inviterId: sarah.id,
          inviterName: 'Sarah Ahmed',
          role: 'VIEWER',
        }),
        read: false,
      },
      {
        userId: emily.id,
        type: 'COURSE_INVITATION',
        title: 'Course Invitation',
        message: 'Sarah Ahmed invited you as a contributor to Data Structures & Algorithms',
        metadata: JSON.stringify({
          courseId: dataStructures.id,
          courseName: 'Data Structures & Algorithms',
          inviterId: sarah.id,
          inviterName: 'Sarah Ahmed',
          role: 'CONTRIBUTOR',
        }),
        read: false,
      },
      // Timetable invitations
      {
        userId: david.id,
        type: 'TIMETABLE_INVITATION',
        title: 'Timetable Shared',
        message: 'Sarah Ahmed shared their Fall 2024 Schedule with you',
        metadata: JSON.stringify({
          timetableId: sarahTimetable.id,
          timetableName: 'Fall 2024 Schedule',
          inviterId: sarah.id,
          inviterName: 'Sarah Ahmed',
          role: 'VIEWER',
        }),
        read: false,
      },
      {
        userId: emily.id,
        type: 'TIMETABLE_INVITATION',
        title: 'Timetable Collaboration',
        message: 'Michael Chen invited you to collaborate on Fall 2024 Engineering Schedule',
        metadata: JSON.stringify({
          timetableId: michaelTimetable.id,
          timetableName: 'Fall 2024 Engineering Schedule',
          inviterId: michael.id,
          inviterName: 'Michael Chen',
          role: 'CONTRIBUTOR',
        }),
        read: false,
      },
      // Accepted invitations
      {
        userId: sarah.id,
        type: 'INVITATION_ACCEPTED',
        title: 'Invitation Accepted',
        message: 'John Doe accepted your course invitation',
        metadata: JSON.stringify({
          courseId: dataStructures.id,
          courseName: 'Data Structures & Algorithms',
          userId: john.id,
          userName: 'John Doe',
        }),
        read: true,
      },
      {
        userId: john.id,
        type: 'INVITATION_ACCEPTED',
        title: 'Invitation Accepted',
        message: 'Sarah Ahmed accepted your timetable invitation',
        metadata: JSON.stringify({
          timetableId: johnTimetable.id,
          timetableName: 'Fall 2024 Schedule',
          userId: sarah.id,
          userName: 'Sarah Ahmed',
        }),
        read: true,
      },
      // Rejected invitations
      {
        userId: david.id,
        type: 'INVITATION_REJECTED',
        title: 'Invitation Declined',
        message: 'Sarah Ahmed declined your course invitation',
        metadata: JSON.stringify({
          courseId: networking.id,
          courseName: 'Computer Networks',
          userId: sarah.id,
          userName: 'Sarah Ahmed',
        }),
        read: false,
      },
      // Class reminders
      {
        userId: sarah.id,
        type: 'CLASS_REMINDER',
        title: 'Class starting in 10 minutes',
        message: 'Data Structures & Algorithms at 09:00',
        metadata: JSON.stringify({
          eventId: 'event-1',
          courseName: 'Data Structures & Algorithms',
          location: 'Room A101',
          startTime: '09:00',
        }),
        read: true,
      },
      {
        userId: john.id,
        type: 'CLASS_REMINDER',
        title: 'Class starting in 10 minutes',
        message: 'Machine Learning at 09:00',
        metadata: JSON.stringify({
          eventId: 'event-2',
          courseName: 'Machine Learning',
          location: 'Room D203',
          startTime: '09:00',
        }),
        read: false,
      },
      // System notifications
      {
        userId: sarah.id,
        type: 'SYSTEM_NOTIFICATION',
        title: 'New Feature: AI Study Plans',
        message: 'Try our new AI-powered study plan generator to ace your exams!',
        metadata: JSON.stringify({
          feature: 'ai-study-plans',
          url: '/ai/study-plans',
        }),
        read: false,
      },
    ],
  })

  console.log(`✅ Created ${await prisma.notification.count()} notifications\n`)

  // ==================== USER NOTIFICATION PREFERENCES ====================
  console.log('⚙️  Creating user notification preferences...')

  await prisma.userNotificationPreferences.createMany({
    data: [
      {
        userId: sarah.id,
        inAppClassReminders: true,
        inAppCollaborationInvites: true,
        inAppAuditLogAlerts: true,
        inAppSystemNotifications: true,
        emailClassReminders: true,
        emailCollaborationInvites: true,
        emailAuditLogAlerts: false,
        emailSystemNotifications: false,
        classReminderMinutes: 10,
      },
      {
        userId: john.id,
        inAppClassReminders: true,
        inAppCollaborationInvites: true,
        inAppAuditLogAlerts: true,
        inAppSystemNotifications: true,
        emailClassReminders: false,
        emailCollaborationInvites: true,
        emailAuditLogAlerts: true,
        emailSystemNotifications: false,
        classReminderMinutes: 15,
      },
      {
        userId: michael.id,
        inAppClassReminders: true,
        inAppCollaborationInvites: true,
        inAppAuditLogAlerts: false,
        inAppSystemNotifications: true,
        emailClassReminders: true,
        emailCollaborationInvites: true,
        emailAuditLogAlerts: false,
        emailSystemNotifications: true,
        classReminderMinutes: 20,
      },
      {
        userId: david.id,
        inAppClassReminders: true,
        inAppCollaborationInvites: true,
        inAppAuditLogAlerts: true,
        inAppSystemNotifications: false,
        emailClassReminders: true,
        emailCollaborationInvites: false,
        emailAuditLogAlerts: true,
        emailSystemNotifications: false,
        classReminderMinutes: 5,
      },
    ],
  })

  console.log(`✅ Created ${await prisma.userNotificationPreferences.count()} notification preferences\n`)

  // ==================== SUMMARY ====================
  console.log('\n🎉 Database seeded successfully with comprehensive data!\n')
  console.log('📊 Summary:')
  console.log(`   • ${await prisma.university.count()} universities`)
  console.log(`   • ${await prisma.faculty.count()} faculties`)
  console.log(`   • ${await prisma.user.count()} users`)
  console.log(`   • ${await prisma.course.count()} courses`)
  console.log(`   • ${await prisma.resource.count()} resources`)
  console.log(`   • ${await prisma.courseCollaborator.count()} course collaborations (ACCEPTED, PENDING, REJECTED)`)
  console.log(`   • ${await prisma.favorite.count()} favorites`)
  console.log(`   • ${await prisma.note.count()} note documents`)
  console.log(`   • ${await prisma.timetable.count()} timetables`)
  console.log(`   • ${await prisma.timetableCollaborator.count()} timetable collaborations (ACCEPTED, PENDING, REJECTED)`)
  console.log(`   • ${await prisma.event.count()} timetable events`)
  console.log(`   • ${await prisma.tag.count()} tags`)
  console.log(`   • ${await prisma.article.count()} articles`)
  console.log(`   • ${await prisma.aiConversation.count()} AI conversations`)
  console.log(`   • ${await prisma.aiMessage.count()} AI messages`)
  console.log(`   • ${await prisma.aiGeneratedNote.count()} AI-generated notes`)
  console.log(`   • ${await prisma.aiQuiz.count()} AI quizzes`)
  console.log(`   • ${await prisma.aiQuizQuestion.count()} quiz questions`)
  console.log(`   • ${await prisma.aiQuizAttempt.count()} quiz attempts`)
  console.log(`   • ${await prisma.aiStudyPlan.count()} AI study plans`)
  console.log(`   • ${await prisma.aiStudyPlanWeek.count()} study plan weeks`)
  console.log(`   • ${await prisma.aiStudyPlanTask.count()} study plan tasks`)
  console.log(`   • ${await prisma.notification.count()} notifications`)
  console.log(`   • ${await prisma.userNotificationPreferences.count()} notification preferences`)

  console.log('\n🔐 Login Credentials (all passwords: admin123):')
  console.log('   🔑 Admin: admin@unishare.com')
  console.log('   👤 Sarah: sarah@student.utm.my (APPROVED)')
  console.log('   👤 John: john@student.utm.my (APPROVED)')
  console.log('   ⏳ Alice: alice@student.utm.my (PENDING)')
  console.log('   👤 Michael: michael@student.utm.my (APPROVED)')
  console.log('   👤 Emily: emily@student.utm.my (APPROVED)')
  console.log('   👤 David: david@student.utm.my (APPROVED)')
  console.log('   👤 Lisa: lisa@student.utm.my (APPROVED)\n')

  console.log('📌 Demo Highlights:')
  console.log('   • Multiple pending course/timetable invitations to showcase')
  console.log('   • Rejected invitations in the system')
  console.log('   • AI conversations with message history')
  console.log('   • Generated notes and quizzes with attempts')
  console.log('   • Study plans with completed and pending tasks')
  console.log('   • Comprehensive notifications (all types)')
  console.log('   • User notification preferences configured\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
