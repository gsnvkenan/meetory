import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './db.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Event from '../models/Event.js';
import MarketListing from '../models/MarketListing.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing old database data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Event.deleteMany({});
    await MarketListing.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});

    console.log('👥 Seeding users...');
    
    // Passwords hashed automatically in User pre-save hook, but let's define them in cleartext here
    const students = [
      {
        name: 'Kenan Hasanov',
        username: 'kenan_hasanov',
        email: 'kenan@itu.edu.tr',
        password: 'password123',
        university: 'ITU',
        department: 'Computer Engineering',
        year: 3,
        bio: 'I love software development and discovering new technologies. I am a React & Node.js fan! 🚀',
        interests: ['Coding', 'AI', 'Music', 'Cinema'],
        courses: ['BLG312', 'BLG336', 'MAT271'],
        isVerified: true,
      },
      {
        name: 'Elif Yılmaz',
        username: 'elif_yilmaz',
        email: 'elif@itu.edu.tr',
        password: 'password123',
        university: 'ITU',
        department: 'Computer Engineering',
        year: 2,
        bio: 'Coffee lover, amateur photographer and an aspiring AI engineer. ☕📸',
        interests: ['AI', 'Photography', 'Books', 'Theater'],
        courses: ['BLG212', 'BLG233', 'MAT271'],
        isVerified: true,
      },
      {
        name: 'Burak Kaya',
        username: 'burak_kaya',
        email: 'burak@itu.edu.tr',
        password: 'password123',
        university: 'ITU',
        department: 'Electrical-Electronics Engineering',
        year: 4,
        bio: 'I am working on embedded systems, robotics and analog circuit design. Check out my marketplace for second-hand items! 🤖🔌',
        interests: ['Robotics', 'Sports', 'Music', 'Swimming'],
        courses: ['ELK411', 'ELK482', 'BLG312'],
        isVerified: true,
      },
      {
        name: 'Zeynep Demir',
        username: 'zeynep_demir',
        email: 'zeynep@itu.edu.tr',
        password: 'password123',
        university: 'ITU',
        department: 'Industrial Engineering',
        year: 1,
        bio: 'I am a 1st year Industrial Engineering student at ITU. I want to discover clubs and make new friends. ✨',
        interests: ['Theater', 'Entrepreneurship', 'Books', 'Tennis'],
        courses: ['END101', 'MAT101'],
        isVerified: true,
      }
    ];

    const createdUsers = await User.create(students);
    console.log(`✅ Seeded ${createdUsers.length} users successfully!`);

    const [kenan, elif, burak, zeynep] = createdUsers;

    // Follow each other
    console.log('🔗 Connecting users (Follows)...');
    kenan.following.push(elif._id, burak._id);
    kenan.followers.push(elif._id);

    elif.following.push(kenan._id, zeynep._id);
    elif.followers.push(kenan._id, burak._id);

    burak.following.push(kenan._id, elif._id);
    burak.followers.push(kenan._id);

    zeynep.following.push(elif._id);
    zeynep.followers.push(elif._id);

    await Promise.all([
      kenan.save({ validateBeforeSave: false }),
      elif.save({ validateBeforeSave: false }),
      burak.save({ validateBeforeSave: false }),
      zeynep.save({ validateBeforeSave: false })
    ]);

    console.log('📝 Seeding posts...');
    const posts = [
      {
        author: kenan._id,
        content: 'I have completed the backend and frontend coding of the Meetory project! 🚀 It became really smooth and modern with Tailwind v4, Socket.io, and MongoDB. Looking forward to your feedback!',
        tags: ['meetory', 'webdev', 'itucampus'],
        university: 'ITU',
        likes: [elif._id, burak._id],
        comments: [
          {
            author: elif._id,
            content: 'Looks great Kenan! Good job, it will be very useful for the campus. 👏',
            likes: [kenan._id]
          },
          {
            author: burak._id,
            content: 'The interface design is very successful, I especially loved the dark mode color palette.',
            likes: []
          }
        ],
        visibility: 'public'
      },
      {
        author: elif._id,
        content: 'Is anyone studying for tomorrow\'s BLG212 (Microprocessor Systems) midterm? We are doing a group study on the 3rd floor of the library, anyone who wants to join can come. 📚✍️',
        tags: ['BLG212', 'midterm', 'library'],
        university: 'ITU',
        likes: [kenan._id],
        comments: [
          {
            author: kenan._id,
            content: 'I will also go to the library in a bit, which table are you at?',
            likes: [elif._id]
          }
        ],
        visibility: 'campus'
      },
      {
        author: burak._id,
        content: 'You can check out the Introduction to Algorithms (CLRS) book I shared in the marketplace. It is in very clean condition, clean of markings. DM if interested.',
        tags: ['clrs', 'algorithm', 'secondhand'],
        university: 'ITU',
        likes: [],
        comments: [],
        visibility: 'public'
      }
    ];

    const createdPosts = await Post.create(posts);
    console.log(`✅ Seeded ${createdPosts.length} posts successfully!`);

    console.log('📅 Seeding events...');
    const events = [
      {
        creator: kenan._id,
        title: 'Algorithm and Data Structures Study Group',
        description: 'We will do weekly LeetCode problem solving and algorithm practices to prepare for midterm and final exams. Open to anyone interested in coding, especially Computer Engineering students.',
        category: 'study',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        locationName: 'ITU Ayazaga Campus, Library Group Study Room B',
        campus: 'Ayazaga',
        university: 'ITU',
        attendees: [kenan._id, elif._id, burak._id],
        maxAttendees: 15,
        isOnline: false,
        tags: ['algorithm', 'leetcode', 'study-group']
      },
      {
        creator: zeynep._id,
        title: 'ITU Entrepreneurship Summit 2026',
        description: 'Take your place in this big event where we will host Turkey\'s leading entrepreneurs and technology leaders! There will be networking opportunities, panels, and various treats.',
        category: 'seminar',
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        locationName: 'ITU SDKM Hall A',
        campus: 'Ayazaga',
        university: 'ITU',
        attendees: [zeynep._id, kenan._id, elif._id],
        maxAttendees: 200,
        isOnline: false,
        tags: ['entrepreneurship', 'itusdkm', 'networking']
      }
    ];

    const createdEvents = await Event.create(events);
    console.log(`✅ Seeded ${createdEvents.length} events successfully!`);

    console.log('🛒 Seeding market listings...');
    const listings = [
      {
        seller: burak._id,
        title: 'Introduction to Algorithms (CLRS) 3rd Edition',
        description: 'The holy book of computer science. Very clean condition, no lines underlined. Bought at the beginning of the semester but no longer need it.',
        category: 'book',
        price: 350,
        isFree: false,
        condition: 'like_new',
        university: 'ITU',
        campus: 'Ayazaga',
        tags: ['clrs', 'algorithms', 'cs-books']
      },
      {
        seller: elif._id,
        title: 'Physics 1 (Physics for Scientists and Engineers) Lecture Notes',
        description: 'Handwritten and color-scanned PDF notes containing solved past exam questions and topic summaries for midterms and finals. Sharing for free.',
        category: 'notes',
        price: 0,
        isFree: true,
        condition: 'new',
        university: 'ITU',
        campus: 'Ayazaga',
        tags: ['physics1', 'notes', 'physics']
      },
      {
        seller: burak._id,
        title: 'Raspberry Pi 4 (4GB RAM) + Official Case and Adapter',
        description: 'Bought it for my robotics projects. Used very little, like new. Will be given with a 32GB MicroSD card and official adapter.',
        category: 'electronics',
        price: 1800,
        isFree: false,
        condition: 'good',
        university: 'ITU',
        campus: 'Ayazaga',
        tags: ['raspberrypi', 'iot', 'robotics']
      }
    ];

    const createdListings = await MarketListing.create(listings);
    console.log(`✅ Seeded ${createdListings.length} market listings successfully!`);

    console.log('💬 Seeding sample conversations and messages...');
    
    // Kenan & Elif Conversation
    const conversation = await Conversation.create({
      participants: [kenan._id, elif._id],
      unreadCount: new Map([[String(elif._id), 0], [String(kenan._id), 0]])
    });

    const messages = [
      {
        conversation: conversation._id,
        sender: kenan._id,
        receiver: elif._id,
        content: 'Hey Elif, where is the BLG212 midterm study group? I arrived at the library.',
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 mins ago
      },
      {
        conversation: conversation._id,
        sender: elif._id,
        receiver: kenan._id,
        content: 'Hey Kenan! We are on the 3rd floor of the library, at table 12 right next to the elevator. Waiting for you.',
        createdAt: new Date(Date.now() - 8 * 60 * 1000) // 8 mins ago
      },
      {
        conversation: conversation._id,
        sender: kenan._id,
        receiver: elif._id,
        content: 'Super, I will be there in 2 minutes. See you!',
        createdAt: new Date(Date.now() - 7 * 60 * 1000) // 7 mins ago
      }
    ];

    const createdMessages = await Message.create(messages);
    
    // Update conversation lastMessage
    conversation.lastMessage = createdMessages[createdMessages.length - 1]._id;
    await conversation.save();

    console.log('💬 Seeded conversation and messages successfully!');

    console.log('🔔 Seeding sample notifications...');
    const notifications = [
      {
        recipient: kenan._id,
        actor: elif._id,
        type: 'follow',
        message: 'Elif Yılmaz started following you.',
        isRead: false,
      },
      {
        recipient: kenan._id,
        actor: elif._id,
        type: 'comment',
        referenceModel: 'Post',
        referenceId: createdPosts[0]._id,
        message: 'Elif Yılmaz commented on your post: "Looks great Kenan!..."',
        isRead: false,
      },
      {
        recipient: kenan._id,
        actor: burak._id,
        type: 'like',
        referenceModel: 'Post',
        referenceId: createdPosts[0]._id,
        message: 'Burak Kaya liked your post.',
        isRead: true,
      }
    ];

    await Notification.create(notifications);
    console.log('🔔 Seeded notifications successfully!');

    console.log('\n🌟 Database seeding completed successfully! Ready for launch.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
