import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create doctors
  const doctors = [
    {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@oralsync.com',
      phone: '+1 (555) 123-4567',
      speciality: 'General Dentistry',
      bio: 'Dr. Sarah Johnson has over 15 years of experience in general dentistry. She specializes in preventive care and cosmetic dentistry, helping patients achieve their best smiles.',
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
      gender: 'FEMALE',
      isActive: true,
    },
    {
      name: 'Dr. Michael Chen',
      email: 'michael.chen@oralsync.com',
      phone: '+1 (555) 234-5678',
      speciality: 'Orthodontics',
      bio: 'Dr. Michael Chen is a board-certified orthodontist with expertise in traditional braces and Invisalign. He is passionate about creating beautiful, healthy smiles for patients of all ages.',
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
      gender: 'MALE',
      isActive: true,
    },
    {
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@oralsync.com',
      phone: '+1 (555) 345-6789',
      speciality: 'Pediatric Dentistry',
      bio: 'Dr. Emily Rodriguez specializes in pediatric dentistry, making dental visits fun and comfortable for children. She focuses on preventive care and education for young patients.',
      imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
      gender: 'FEMALE',
      isActive: true,
    },
    {
      name: 'Dr. James Wilson',
      email: 'james.wilson@oralsync.com',
      phone: '+1 (555) 456-7890',
      speciality: 'Oral Surgery',
      bio: 'Dr. James Wilson is an experienced oral surgeon specializing in dental implants, wisdom teeth extraction, and corrective jaw surgery. He uses the latest techniques for optimal patient outcomes.',
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
      gender: 'MALE',
      isActive: true,
    },
    {
      name: 'Dr. Lisa Anderson',
      email: 'lisa.anderson@oralsync.com',
      phone: '+1 (555) 567-8901',
      speciality: 'Periodontics',
      bio: 'Dr. Lisa Anderson is a periodontist focused on gum health and treating gum disease. She offers advanced treatments including laser therapy and dental implant placement.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      gender: 'FEMALE',
      isActive: true,
    },
    {
      name: 'Dr. David Park',
      email: 'david.park@oralsync.com',
      phone: '+1 (555) 678-9012',
      speciality: 'Cosmetic Dentistry',
      bio: 'Dr. David Park is a cosmetic dentistry expert specializing in veneers, teeth whitening, and smile makeovers. He combines artistry with dental science to create stunning results.',
      imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
      gender: 'MALE',
      isActive: true,
    },
  ];

  // Delete existing doctors first (optional - for clean slate)
  console.log('🗑️  Cleaning existing data...');
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();

  // Create doctors
  console.log('👨‍⚕️  Creating doctors...');
  for (const doctor of doctors) {
    await prisma.doctor.create({
      data: doctor,
    });
    console.log(`✅ Created: ${doctor.name} - ${doctor.speciality}`);
  }

  console.log('✨ Seed completed successfully!');
  console.log(`📊 Created ${doctors.length} doctors`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

