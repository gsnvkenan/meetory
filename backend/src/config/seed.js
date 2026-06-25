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
        university: 'İTÜ',
        department: 'Bilgisayar Mühendisliği',
        year: 3,
        bio: 'Yazılım geliştirmeyi ve yeni teknolojiler keşfetmeyi seviyorum. React & Node.js hayranıyım! 🚀',
        interests: ['Kodlama', 'Yapay Zeka', 'Müzik', 'Sinema'],
        courses: ['BLG312', 'BLG336', 'MAT271'],
        isVerified: true,
      },
      {
        name: 'Elif Yılmaz',
        username: 'elif_yilmaz',
        email: 'elif@itu.edu.tr',
        password: 'password123',
        university: 'İTÜ',
        department: 'Bilgisayar Mühendisliği',
        year: 2,
        bio: 'Kahve sever, amatör fotoğrafçı ve gelecek vaat eden bir yapay zeka mühendisi. ☕📸',
        interests: ['Yapay Zeka', 'Fotoğrafçılık', 'Kitap', 'Tiyatro'],
        courses: ['BLG212', 'BLG233', 'MAT271'],
        isVerified: true,
      },
      {
        name: 'Burak Kaya',
        username: 'burak_kaya',
        email: 'burak@itu.edu.tr',
        password: 'password123',
        university: 'İTÜ',
        department: 'Elektrik-Elektronik Mühendisliği',
        year: 4,
        bio: 'Gömülü sistemler, robotik ve analog devre tasarımı ile uğraşıyorum. İkinci el eşyalar için pazar yerime bakın! 🤖🔌',
        interests: ['Robotik', 'Spor', 'Müzik', 'Yüzme'],
        courses: ['ELK411', 'ELK482', 'BLG312'],
        isVerified: true,
      },
      {
        name: 'Zeynep Demir',
        username: 'zeynep_demir',
        email: 'zeynep@itu.edu.tr',
        password: 'password123',
        university: 'İTÜ',
        department: 'Endüstri Mühendisliği',
        year: 1,
        bio: 'İTÜ Endüstri Mühendisliği 1. sınıf öğrencisiyim. Kulüplerle tanışmak ve yeni arkadaşlar edinmek istiyorum. ✨',
        interests: ['Tiyatro', 'Girişimcilik', 'Kitap', 'Tenis'],
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
        content: 'Meetory projesinin backend ve frontend kodlamasını tamamladım! 🚀 Tailwind v4, Socket.io ve MongoDB ile gerçekten çok akıcı ve modern oldu. Düşüncelerinizi bekliyorum!',
        tags: ['meetory', 'webdev', 'itükampüs'],
        university: 'İTÜ',
        likes: [elif._id, burak._id],
        comments: [
          {
            author: elif._id,
            content: 'Harika görünüyor Kenan! Eline sağlık, kampüs için çok faydalı olacak. 👏',
            likes: [kenan._id]
          },
          {
            author: burak._id,
            content: 'Arayüz tasarımı çok başarılı, özellikle karanlık mod (dark mode) renk paletine bayıldım.',
            likes: []
          }
        ],
        visibility: 'public'
      },
      {
        author: elif._id,
        content: 'Yarınki BLG212 (Mikroişlemci Sistemleri) vizesine çalışan var mı? Kütüphane 3. katta grup çalışması yapıyoruz, katılmak isteyen gelebilir. 📚✍️',
        tags: ['BLG212', 'vize', 'kütüphane'],
        university: 'İTÜ',
        likes: [kenan._id],
        comments: [
          {
            author: kenan._id,
            content: 'Ben de birazdan kütüphaneye geçeceğim, hangi masadasınız?',
            likes: [elif._id]
          }
        ],
        visibility: 'campus'
      },
      {
        author: burak._id,
        content: 'Pazar yerinde paylaştığım Introduction to Algorithms (CLRS) kitabına bakabilirsiniz. Tertemiz ve çiziksiz durumda, ilgilenenler DM atabilir.',
        tags: ['clrs', 'algoritma', 'ikinciel'],
        university: 'İTÜ',
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
        title: 'Algoritma ve Veri Yapıları Çalışma Grubu',
        description: 'Vize ve final sınavlarına hazırlık için haftalık olarak LeetCode soru çözümleri ve algoritma pratikleri yapacağız. Bilgisayar Mühendisliği öğrencileri başta olmak üzere kodlamayla ilgilenen herkese açıktır.',
        category: 'study',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        locationName: 'İTÜ Ayazağa Kampüsü, Kütüphane Grup Çalışma Odası B',
        campus: 'Ayazağa',
        university: 'İTÜ',
        attendees: [kenan._id, elif._id, burak._id],
        maxAttendees: 15,
        isOnline: false,
        tags: ['algorithm', 'leetcode', 'study-group']
      },
      {
        creator: zeynep._id,
        title: 'İTÜ Girişimcilik Zirvesi 2026',
        description: 'Türkiye\'nin önde gelen girişimcilerini ve teknoloji liderlerini ağırlayacağımız bu büyük etkinlikte sen de yerini al! Networking fırsatları, paneller ve çeşitli ikramlar olacaktır.',
        category: 'seminar',
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        locationName: 'İTÜ SDKM Salon A',
        campus: 'Ayazağa',
        university: 'İTÜ',
        attendees: [zeynep._id, kenan._id, elif._id],
        maxAttendees: 200,
        isOnline: false,
        tags: ['girişimcilik', 'itüsdkm', 'networking']
      }
    ];

    const createdEvents = await Event.create(events);
    console.log(`✅ Seeded ${createdEvents.length} events successfully!`);

    console.log('🛒 Seeding market listings...');
    const listings = [
      {
        seller: burak._id,
        title: 'Introduction to Algorithms (CLRS) 3rd Edition',
        description: 'Bilgisayar bilimlerinin kutsal kitabı. Çok temiz durumda, hiçbir satırının altı çizilmedi. Dönem başında aldım ancak artık ihtiyacım kalmadı.',
        category: 'book',
        price: 350,
        isFree: false,
        condition: 'like_new',
        university: 'İTÜ',
        campus: 'Ayazağa',
        tags: ['clrs', 'algorithms', 'cs-books']
      },
      {
        seller: elif._id,
        title: 'Fizik 1 (Physics for Scientists and Engineers) Ders Notları',
        description: 'Vizeler ve finaller için çıkmış soru çözümleri ve konu özetlerinin yer aldığı, tamamı el yazısı ve renkli taratılmış PDF notlar. Ücretsiz paylaşıyorum.',
        category: 'notes',
        price: 0,
        isFree: true,
        condition: 'new',
        university: 'İTÜ',
        campus: 'Ayazağa',
        tags: ['fizik1', 'dersnotları', 'fizik']
      },
      {
        seller: burak._id,
        title: 'Raspberry Pi 4 (4GB RAM) + Lisanslı Kutu ve Adaptör',
        description: 'Robotik projelerim için almıştım. Çok az kullandım, sıfır ayarında. Yanında 32GB MicroSD kart ve lisanslı adaptörüyle birlikte verilecektir.',
        category: 'electronics',
        price: 1800,
        isFree: false,
        condition: 'good',
        university: 'İTÜ',
        campus: 'Ayazağa',
        tags: ['raspberrypi', 'iot', 'robotik']
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
        content: 'Selam Elif, BLG212 vize çalışma grubu nerede? Kütüphaneye geldim.',
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 mins ago
      },
      {
        conversation: conversation._id,
        sender: elif._id,
        receiver: kenan._id,
        content: 'Selam Kenan! Kütüphanenin 3. katında, asansörün hemen yanındaki 12 numaralı masadayız. Bekliyoruz.',
        createdAt: new Date(Date.now() - 8 * 60 * 1000) // 8 mins ago
      },
      {
        conversation: conversation._id,
        sender: kenan._id,
        receiver: elif._id,
        content: 'Süper, 2 dakikaya oradayım. Görüşürüz!',
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
        message: 'Elif Yılmaz seni takip etmeye başladı.',
        isRead: false,
      },
      {
        recipient: kenan._id,
        actor: elif._id,
        type: 'comment',
        referenceModel: 'Post',
        referenceId: createdPosts[0]._id,
        message: 'Elif Yılmaz gönderine yorum yaptı: "Harika görünüyor Kenan!..."',
        isRead: false,
      },
      {
        recipient: kenan._id,
        actor: burak._id,
        type: 'like',
        referenceModel: 'Post',
        referenceId: createdPosts[0]._id,
        message: 'Burak Kaya gönderini beğendi.',
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
