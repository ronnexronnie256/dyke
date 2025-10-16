import { neonDb } from './src/lib/neon.ts';

async function checkProperties() {
  try {
    console.log('Checking all properties in database...\n');
    
    const allProps = await neonDb.getAllPropertiesDebug();
    console.log(`Total properties in database: ${allProps.length}\n`);
    
    if (allProps.length > 0) {
      console.log('Properties breakdown by status:');
      const statusCount = {};
      allProps.forEach(p => {
        statusCount[p.status] = (statusCount[p.status] || 0) + 1;
      });
      console.log(statusCount);
      
      console.log('\nProperty details:');
      allProps.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.title} - Status: ${p.status} - ID: ${p.id}`);
      });
    } else {
      console.log('❌ No properties found in database!');
      console.log('\nYou need to:');
      console.log('1. Add properties through the "Submit Property" page, OR');
      console.log('2. Import test data into the database');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkProperties();
